const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { performance } = require('perf_hooks');
const ffmpegPath = require('ffmpeg-static');
const {
  createPage,
  loadHtml,
  closePage,
  closeBrowser,
} = require('../mcp/lib/browser');

const WIDTH = Number(process.env.VT_BENCH_WIDTH || 640);
const HEIGHT = Number(process.env.VT_BENCH_HEIGHT || 360);
const FPS = 30;
const FRAME_COUNT = Number(process.env.VT_BENCH_FRAMES || 120);
const CPU_USED_VALUES = (process.env.VT_BENCH_CPU_USED || '1,3,5,7')
  .split(',')
  .map(Number);

function runFfmpeg(args, stdinBuffers) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, {
      stdio: [stdinBuffers ? 'pipe' : 'ignore', 'pipe', 'pipe'],
    });
    const stdout = [];
    let stderr = '';
    proc.stdout.on('data', (chunk) => stdout.push(chunk));
    proc.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve({ stdout: Buffer.concat(stdout), stderr });
      else reject(new Error(`ffmpeg exited ${code}: ${stderr}`));
    });
    if (stdinBuffers) {
      (async () => {
        for (const buffer of stdinBuffers) {
          if (!proc.stdin.write(buffer)) {
            await new Promise((resolve, reject) => {
              const onDrain = () => {
                proc.stdin.off('error', onError);
                resolve();
              };
              const onError = (error) => {
                proc.stdin.off('drain', onDrain);
                reject(error);
              };
              proc.stdin.once('drain', onDrain);
              proc.stdin.once('error', onError);
            });
          }
        }
        proc.stdin.end();
      })().catch(reject);
    }
  });
}

async function captureFrames() {
  const page = await createPage(WIDTH, HEIGHT);
  try {
    await loadHtml(page, `<!doctype html><html><body style="margin:0;overflow:hidden">
      <canvas id="c" width="${WIDTH}" height="${HEIGHT}"></canvas>
      <script>
        const c = document.getElementById('c');
        const x = c.getContext('2d');
        window.draw = function(t) {
          x.clearRect(0, 0, c.width, c.height);
          const g = x.createLinearGradient(0, 0, c.width, c.height);
          g.addColorStop(0, 'hsl(' + Math.round(t * 300) + ' 80% 50%)');
          g.addColorStop(1, '#111827');
          x.fillStyle = g;
          x.fillRect(0, 0, c.width, c.height);
          x.fillStyle = '#fff';
          x.font = '700 42px sans-serif';
          x.fillText('Frame ' + Math.round(t * 1000), 32, 64);
          x.beginPath();
          x.arc(50 + t * (c.width - 100), c.height / 2, 28, 0, Math.PI * 2);
          x.fill();
        };
      </script>
    </body></html>`);
    const frames = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      await page.evaluate((t) => window.draw(t), i / Math.max(1, FRAME_COUNT - 1));
      frames.push(await page.screenshot({ type: 'png' }));
    }
    return frames;
  } finally {
    await closePage(page);
  }
}

async function encode(frames, outputPath, cpuUsed) {
  const started = performance.now();
  await runFfmpeg([
    '-y',
    '-f', 'image2pipe',
    '-framerate', String(FPS),
    '-vcodec', 'png',
    '-i', 'pipe:0',
    '-c:v', 'libvpx-vp9',
    '-pix_fmt', 'yuva420p',
    '-auto-alt-ref', '0',
    '-crf', '18',
    '-b:v', '0',
    '-deadline', 'good',
    '-cpu-used', String(cpuUsed),
    outputPath,
  ], frames);
  return performance.now() - started;
}

async function frameCount(filePath) {
  const { stdout } = await runFfmpeg([
    '-v', 'error',
    '-i', filePath,
    '-f', 'framemd5',
    'pipe:1',
  ]);
  return stdout.toString().split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#')).length;
}

async function ssim(referencePath, candidatePath) {
  const { stderr } = await runFfmpeg([
    '-v', 'info',
    '-i', referencePath,
    '-i', candidatePath,
    '-lavfi', 'ssim',
    '-f', 'null',
    '-',
  ]);
  const match = stderr.match(/All:([0-9.]+)/);
  return match ? Number(match[1]) : null;
}

async function run() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vt-vp9-benchmark-'));
  try {
    const frames = await captureFrames();
    const results = [];
    let referencePath;
    for (const cpuUsed of CPU_USED_VALUES) {
      const outputPath = path.join(tmpDir, `cpu-${cpuUsed}.webm`);
      const elapsedMs = await encode(frames, outputPath, cpuUsed);
      if (!referencePath) referencePath = outputPath;
      results.push({
        cpuUsed,
        elapsedMs: Number(elapsedMs.toFixed(1)),
        speedup: null,
        bytes: fs.statSync(outputPath).size,
        frames: await frameCount(outputPath),
        ssim: await ssim(referencePath, outputPath),
      });
    }
    const baselineMs = results[0].elapsedMs;
    for (const result of results) {
      result.speedup = Number((baselineMs / result.elapsedMs).toFixed(2));
    }
    console.log(JSON.stringify({
      resolution: `${WIDTH}x${HEIGHT}`,
      frames: FRAME_COUNT,
      fps: FPS,
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
