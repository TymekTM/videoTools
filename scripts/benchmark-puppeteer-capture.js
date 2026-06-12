const { performance } = require('perf_hooks');
const { spawnSync } = require('child_process');
const crypto = require('crypto');
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

async function preparePage() {
  const page = await createPage(WIDTH, HEIGHT);
  await loadHtml(page, `<!doctype html><html><body style="margin:0;overflow:hidden">
    <canvas id="c" width="${WIDTH}" height="${HEIGHT}"></canvas>
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
        x.fillText('Capture ' + Math.round(t * 1000), 40, 72);
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
    const started = performance.now();
    for (let i = 0; i < FRAMES; i++) {
      await page.evaluate((t) => window.draw(t), i / Math.max(1, FRAMES - 1));
      const data = await capture(page);
      bytes += typeof data === 'string' ? Buffer.byteLength(data, 'base64') : data.length;
    }
    return {
      label,
      elapsedMs: Number((performance.now() - started).toFixed(1)),
      bytes,
    };
  } finally {
    await closePage(page);
  }
}

function decodedHash(buffer) {
  const result = spawnSync(ffmpegPath, [
    '-v', 'error',
    '-f', 'image2pipe',
    '-i', 'pipe:0',
    '-f', 'rawvideo',
    'pipe:1',
  ], {
    input: buffer,
    maxBuffer: WIDTH * HEIGHT * 8,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr.toString());
  }
  return crypto.createHash('sha256').update(result.stdout).digest('hex');
}

async function runFormat(format) {
  const pageCapture = (page) => page.screenshot({
    type: format,
    ...(format === 'jpeg' ? { quality: 92 } : {}),
    encoding: 'base64',
  });
  const fastCapture = (page) => page.screenshot({
    type: format,
    ...(format === 'jpeg' ? { quality: 92 } : {}),
    encoding: 'base64',
    optimizeForSpeed: true,
  });

  const pageFirst = await benchmark(`${format}-page-first`, pageCapture);
  const fastSecond = await benchmark(`${format}-fast-second`, fastCapture);
  const fastFirst = await benchmark(`${format}-fast-first`, fastCapture);
  const pageSecond = await benchmark(`${format}-page-second`, pageCapture);
  const pageMs = (pageFirst.elapsedMs + pageSecond.elapsedMs) / 2;
  const fastMs = (fastFirst.elapsedMs + fastSecond.elapsedMs) / 2;
  const verificationPage = await preparePage();
  let decodedPixelsMatch;
  try {
    await verificationPage.evaluate(() => window.draw(0.42));
    const normal = Buffer.from(await pageCapture(verificationPage), 'base64');
    const fast = Buffer.from(await fastCapture(verificationPage), 'base64');
    decodedPixelsMatch = decodedHash(normal) === decodedHash(fast);
  } finally {
    await closePage(verificationPage);
  }
  return {
    format,
    pageMs: Number(pageMs.toFixed(1)),
    fastMs: Number(fastMs.toFixed(1)),
    speedup: Number((pageMs / fastMs).toFixed(2)),
    normalBytes: pageFirst.bytes,
    fastBytes: fastSecond.bytes,
    decodedPixelsMatch,
    runs: [pageFirst, fastSecond, fastFirst, pageSecond],
  };
}

async function run() {
  try {
    console.log(JSON.stringify({
      resolution: `${WIDTH}x${HEIGHT}`,
      frames: FRAMES,
      results: [
        await runFormat('jpeg'),
        await runFormat('png'),
      ],
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
