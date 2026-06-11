const { performance } = require('perf_hooks');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const { createPage, loadHtml, captureFrame, closePage, closeBrowser } = require('./lib/browser');
const { encodeMov, encodeWebm } = require('./lib/encoder');

const WIDTH = Number(process.env.VT_BENCH_WIDTH || 640);
const HEIGHT = Number(process.env.VT_BENCH_HEIGHT || 360);
const FPS = 30;
const UNIQUE_FRAMES = Number(process.env.VT_BENCH_STATES || 8);
const DURATION = Number(process.env.VT_BENCH_DURATION || 15);

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout = [];
    let stderr = '';
    proc.stdout.on('data', (chunk) => stdout.push(chunk));
    proc.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve(Buffer.concat(stdout));
      else reject(new Error(`ffmpeg exited ${code}: ${stderr}`));
    });
  });
}

async function captureFrames() {
  const page = await createPage(WIDTH, HEIGHT);
  await loadHtml(page, `<!doctype html><html><body style="margin:0;overflow:hidden">
    <canvas id="c" width="${WIDTH}" height="${HEIGHT}"></canvas>
    <script>
      const c = document.getElementById('c');
      const x = c.getContext('2d');
      window.draw = function(t) {
        const g = x.createLinearGradient(0, 0, c.width, c.height);
        g.addColorStop(0, 'hsl(' + Math.round(t * 300) + ' 80% 50%)');
        g.addColorStop(1, '#111827');
        x.fillStyle = g;
        x.fillRect(0, 0, c.width, c.height);
        x.fillStyle = '#fff';
        x.fillRect(20 + t * (c.width - 80), 80, 60, 60);
      };
    </script>
  </body></html>`);
  const frames = [];
  for (let i = 0; i < UNIQUE_FRAMES; i++) {
    await page.evaluate((t) => window.draw(t), i / Math.max(1, UNIQUE_FRAMES - 1));
    frames.push({ data: await captureFrame(page), duration: DURATION });
  }
  await closePage(page);
  return frames;
}

async function encodeLegacy(frames, outputPath, format, tmpDir) {
  let index = 0;
  for (const frame of frames) {
    const buffer = Buffer.from(frame.data, 'base64');
    for (let i = 0; i < frame.duration; i++) {
      fs.writeFileSync(path.join(tmpDir, `f_${String(index++).padStart(6, '0')}.jpg`), buffer);
    }
  }
  const args = ['-y', '-f', 'image2', '-framerate', String(FPS), '-i', path.join(tmpDir, 'f_%06d.jpg')];
  if (format === 'mov') {
    args.push(
      '-s', `${WIDTH}x${HEIGHT}`,
      '-c:v', 'prores_ks', '-profile:v', '3',
      '-pix_fmt', 'yuva444p10le', '-vendor', 'ap10'
    );
  } else {
    args.push(
      '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
      '-auto-alt-ref', '0', '-crf', '18', '-b:v', '0'
    );
  }
  args.push(outputPath);
  await runFfmpeg(args);
}

async function frameMd5(filePath) {
  return (await runFfmpeg([
    '-v', 'error', '-i', filePath, '-f', 'framemd5', 'pipe:1',
  ])).toString().split(/\r?\n/).filter((line) => line && !line.startsWith('#')).join('\n');
}

async function benchmarkFormat(frames, format, tmpDir) {
  const legacyPath = path.join(tmpDir, `legacy.${format}`);
  const pipedPath = path.join(tmpDir, `piped.${format}`);
  const legacyFramesDir = path.join(tmpDir, `legacy-${format}`);
  fs.mkdirSync(legacyFramesDir);

  let started = performance.now();
  await encodeLegacy(frames, legacyPath, format, legacyFramesDir);
  const legacyMs = performance.now() - started;

  started = performance.now();
  if (format === 'mov') await encodeMov(frames, pipedPath, FPS, WIDTH, HEIGHT);
  else await encodeWebm(frames, pipedPath, FPS);
  const pipedMs = performance.now() - started;

  return {
    format,
    legacyMs: Number(legacyMs.toFixed(1)),
    pipedMs: Number(pipedMs.toFixed(1)),
    speedup: Number((legacyMs / pipedMs).toFixed(2)),
    exactDecodedMatch: await frameMd5(legacyPath) === await frameMd5(pipedPath),
  };
}

async function run() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-encoder-benchmark-'));
  try {
    const frames = await captureFrames();
    const results = [];
    results.push(await benchmarkFormat(frames, 'mov', tmpDir));
    results.push(await benchmarkFormat(frames, 'webm', tmpDir));
    console.log(JSON.stringify({
      resolution: `${WIDTH}x${HEIGHT}`,
      uniqueFrames: UNIQUE_FRAMES,
      outputFrames: UNIQUE_FRAMES * DURATION,
      results,
    }));
  } finally {
    await closeBrowser();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

run().catch(async (error) => {
  console.error(error);
  await closeBrowser();
  process.exit(1);
});
