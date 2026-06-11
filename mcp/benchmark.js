const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
const fs = require('fs');
const crypto = require('crypto');

const WIDTH = Number(process.env.VT_BENCH_WIDTH || 640);
const HEIGHT = Number(process.env.VT_BENCH_HEIGHT || 360);
const FRAME_COUNT = Number(process.env.VT_BENCH_FRAMES || 60);

const HTML = `<!doctype html><html><body style="margin:0;overflow:hidden">
  <canvas id="c" width="${WIDTH}" height="${HEIGHT}"></canvas>
  <div id="label" style="position:absolute;left:40px;top:30px;color:white;font:700 28px Arial"></div>
  <script>
    const c = document.getElementById('c');
    const x = c.getContext('2d');
    const label = document.getElementById('label');
    window.draw = function(t) {
      const g = x.createLinearGradient(0, 0, c.width, c.height);
      g.addColorStop(0, 'hsl(' + Math.round(t * 300) + ' 80% 50%)');
      g.addColorStop(1, '#111827');
      x.fillStyle = g;
      x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = '#fff';
      x.beginPath();
      x.arc(50 + t * (c.width - 100), c.height / 2, 25, 0, Math.PI * 2);
      x.fill();
      label.textContent = 'Frame ' + Math.round(t * 1000);
    };
  </script>
</body></html>`;

async function benchmark(name, page, capture) {
  const started = performance.now();
  let bytes = 0;
  const hashes = [];
  for (let i = 0; i < FRAME_COUNT; i++) {
    const t = i / Math.max(1, FRAME_COUNT - 1);
    await page.evaluate((value) => window.draw(value), t);
    const data = await capture();
    const buffer = typeof data === 'string' ? Buffer.from(data, 'base64') : Buffer.from(data);
    bytes += buffer.length;
    if (i === 0 || i === Math.floor(FRAME_COUNT / 2) || i === FRAME_COUNT - 1) {
      hashes.push(buffer.toString('base64'));
    }
  }
  const elapsed = performance.now() - started;
  return { name, elapsed, fps: FRAME_COUNT / (elapsed / 1000), bytes, hashes };
}

async function run() {
  const systemChrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const disableGpu = process.env.VT_BENCH_GPU !== '1';
  const args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'];
  if (disableGpu) args.push('--disable-gpu');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: fs.existsSync(systemChrome) ? systemChrome : undefined,
    args,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.setContent(HTML);
  const client = await page.createCDPSession();

  const variants = [
    ['screenshot buffer', () => page.screenshot({ type: 'jpeg', quality: 92 })],
    ['screenshot base64', () => page.screenshot({ type: 'jpeg', quality: 92, encoding: 'base64' })],
    ['screenshot optimized', () => page.screenshot({ type: 'jpeg', quality: 92, encoding: 'base64', optimizeForSpeed: true })],
    ['CDP captureScreenshot', async () => (await client.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 92,
      fromSurface: true,
      captureBeyondViewport: false,
      optimizeForSpeed: true,
    })).data],
  ];

  let baseline;
  console.log(`Puppeteer benchmark: ${FRAME_COUNT} frames at ${WIDTH}x${HEIGHT}, GPU ${disableGpu ? 'disabled' : 'enabled'}`);
  for (const [name, capture] of variants) {
    const result = await benchmark(name, page, capture);
    if (!baseline) baseline = result;
    console.log(JSON.stringify({
      variant: name,
      ms: Number(result.elapsed.toFixed(1)),
      fps: Number(result.fps.toFixed(2)),
      speedup: Number((baseline.elapsed / result.elapsed).toFixed(2)),
      exactEncodedMatch: result.hashes.every((hash, i) => hash === baseline.hashes[i]),
      sampleDigest: crypto.createHash('sha256').update(result.hashes.join('')).digest('hex').slice(0, 16),
    }));
  }

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
