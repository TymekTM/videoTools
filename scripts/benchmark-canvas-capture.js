const { spawn } = require('child_process');
const crypto = require('crypto');
const { performance } = require('perf_hooks');
const ffmpegPath = require('ffmpeg-static');
const {
  createPage,
  loadHtml,
  closePage,
  closeBrowser,
} = require('../mcp/lib/browser');

const WIDTH = Number(process.env.VT_BENCH_WIDTH || 1280);
const HEIGHT = Number(process.env.VT_BENCH_HEIGHT || 720);
const FRAMES = Number(process.env.VT_BENCH_FRAMES || 120);

function runFfmpeg(args, input) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    const stdout = [];
    let stderr = '';
    proc.stdout.on('data', (chunk) => stdout.push(chunk));
    proc.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve(Buffer.concat(stdout));
      else reject(new Error(stderr));
    });
    proc.stdin.end(input);
  });
}

async function decodedHash(buffer) {
  const raw = await runFfmpeg([
    '-v', 'error',
    '-f', 'image2pipe',
    '-i', 'pipe:0',
    '-f', 'rawvideo',
    'pipe:1',
  ], buffer);
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function preparePage() {
  const page = await createPage(WIDTH, HEIGHT);
  await loadHtml(page, `<!doctype html><html><body style="margin:0;overflow:hidden">
    <canvas id="c" width="${WIDTH}" height="${HEIGHT}" style="width:100%;height:100%"></canvas>
    <script>
      const c = document.getElementById('c');
      const x = c.getContext('2d');
      window.draw = function(t) {
        const g = x.createLinearGradient(0, 0, c.width, c.height);
        g.addColorStop(0, 'hsl(' + Math.round(t * 320) + ' 80% 50%)');
        g.addColorStop(1, '#111827');
        x.fillStyle = g;
        x.fillRect(0, 0, c.width, c.height);
        x.fillStyle = '#fff';
        x.font = '700 48px sans-serif';
        x.fillText('Canvas ' + Math.round(t * 1000), 40, 72);
        x.fillRect(30 + t * (c.width - 100), c.height / 2, 70, 70);
      };
    </script>
  </body></html>`);
  return page;
}

async function benchmark(label, capture) {
  const page = await preparePage();
  try {
    for (let i = 0; i < 5; i++) {
      await page.evaluate((t) => window.draw(t), i / 5);
      await capture(page);
    }
    let bytes = 0;
    let sample;
    const started = performance.now();
    for (let i = 0; i < FRAMES; i++) {
      await page.evaluate((t) => window.draw(t), i / Math.max(1, FRAMES - 1));
      const data = await capture(page);
      if (!sample && i === Math.floor(FRAMES / 2)) sample = data;
      bytes += Buffer.byteLength(data, 'base64');
    }
    return {
      label,
      elapsedMs: Number((performance.now() - started).toFixed(1)),
      bytes,
      sample,
    };
  } finally {
    await closePage(page);
  }
}

async function run() {
  try {
    const screenshot = await benchmark('screenshot', (page) => page.screenshot({
      type: 'jpeg',
      quality: 92,
      encoding: 'base64',
    }));
    const canvas = await benchmark('canvas', (page) => page.evaluate(() => (
      document.getElementById('c').toDataURL('image/jpeg', 0.92).split(',')[1]
    )));
    const screenshotSample = Buffer.from(screenshot.sample, 'base64');
    const canvasSample = Buffer.from(canvas.sample, 'base64');
    console.log(JSON.stringify({
      resolution: `${WIDTH}x${HEIGHT}`,
      frames: FRAMES,
      screenshotMs: screenshot.elapsedMs,
      canvasMs: canvas.elapsedMs,
      speedup: Number((screenshot.elapsedMs / canvas.elapsedMs).toFixed(2)),
      screenshotBytes: screenshot.bytes,
      canvasBytes: canvas.bytes,
      decodedPixelsMatch: await decodedHash(screenshotSample) === await decodedHash(canvasSample),
    }));
  } finally {
    await closeBrowser();
  }
}

run().catch(async (error) => {
  console.error(error);
  await closeBrowser();
  process.exit(1);
});
