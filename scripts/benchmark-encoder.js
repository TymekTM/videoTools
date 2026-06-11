const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { performance } = require('perf_hooks');
const ffmpegPath = require('ffmpeg-static');
const { encodeMp4, X264_PRESET } = require('../shared/encoder');

const WIDTH = Number(process.env.VT_BENCH_WIDTH || 640);
const HEIGHT = Number(process.env.VT_BENCH_HEIGHT || 360);
const FRAME_COUNT = Number(process.env.VT_BENCH_FRAMES || 90);
const FPS = 30;

function runFfmpeg(args, stdinBuffers) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, {
      stdio: [stdinBuffers ? 'pipe' : 'ignore', 'pipe', 'pipe'],
    });
    const stdout = [];
    let stderr = '';
    proc.stdout.on('data', (chunk) => stdout.push(chunk));
    proc.stderr.on('data', (chunk) => stderr += chunk.toString());
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve(Buffer.concat(stdout));
      else reject(new Error(`ffmpeg exited ${code}: ${stderr}`));
    });
    if (stdinBuffers) {
      (async () => {
        for (const buffer of stdinBuffers) {
          if (!proc.stdin.write(buffer)) {
            await new Promise((resolve) => proc.stdin.once('drain', resolve));
          }
        }
        proc.stdin.end();
      })().catch(reject);
    }
  });
}

async function captureFrames() {
  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    show: false,
    frame: false,
    webPreferences: { offscreen: true },
  });
  const html = `<!doctype html><html><body style="margin:0;overflow:hidden">
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
        x.beginPath();
        x.arc(50 + t * (c.width - 100), c.height / 2, 25, 0, Math.PI * 2);
        x.fill();
      };
    </script>
  </body></html>`;
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  const frames = [];
  for (let i = 0; i < FRAME_COUNT; i++) {
    await win.webContents.executeJavaScript(`window.draw(${i / Math.max(1, FRAME_COUNT - 1)})`);
    frames.push((await win.webContents.capturePage()).toJPEG(92));
  }
  return { frames, win };
}

async function encodeLegacy(frames, outputPath, tmpDir) {
  const started = performance.now();
  let concat = '';
  for (let i = 0; i < frames.length; i++) {
    const name = `f_${String(i).padStart(6, '0')}.jpg`;
    fs.writeFileSync(path.join(tmpDir, name), frames[i]);
    concat += `file '${name}'\n`;
  }
  fs.writeFileSync(path.join(tmpDir, 'concat.txt'), concat);
  await runFfmpeg([
    '-y', '-f', 'concat', '-safe', '0', '-r', String(FPS),
    '-i', path.join(tmpDir, 'concat.txt'),
    '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-preset', 'fast', '-crf', '18', '-movflags', '+faststart',
    outputPath,
  ]);
  return performance.now() - started;
}

async function encodePipe(frames, outputPath, preset = 'fast') {
  const started = performance.now();
  await runFfmpeg([
    '-y', '-f', 'image2pipe', '-framerate', String(FPS),
    '-vcodec', 'mjpeg', '-i', 'pipe:0',
    '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-preset', preset, '-crf', '18', '-movflags', '+faststart',
    outputPath,
  ], frames);
  return performance.now() - started;
}

async function encodeDurationConcat(frames, outputPath) {
  const started = performance.now();
  await encodeMp4(frames, outputPath, FPS, WIDTH, HEIGHT);
  return performance.now() - started;
}

async function frameMd5(filePath) {
  return (await runFfmpeg([
    '-v', 'error', '-i', filePath, '-f', 'framemd5', 'pipe:1',
  ])).toString().split(/\r?\n/).filter((line) => line && !line.startsWith('#')).join('\n');
}

app.whenReady().then(async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vt-encoder-benchmark-'));
  let win;
  try {
    const captured = await captureFrames();
    const frames = captured.frames;
    win = captured.win;
    const legacyPath = path.join(tmpDir, 'legacy.mp4');
    const pipePath = path.join(tmpDir, 'pipe.mp4');
    const legacyMs = await encodeLegacy(frames, legacyPath, tmpDir);
    const pipeMs = await encodePipe(frames, pipePath);
    const exactDecodedMatch = await frameMd5(legacyPath) === await frameMd5(pipePath);
    const staticFrames = frames.slice(0, Math.min(8, frames.length)).map((data) => ({ data, duration: 15 }));
    const expandedStatic = staticFrames.flatMap((frame) => Array(frame.duration).fill(frame.data));
    const staticPipePath = path.join(tmpDir, 'static-pipe.mp4');
    const staticDurationPath = path.join(tmpDir, 'static-duration.mp4');
    const staticPipeMs = await encodePipe(expandedStatic, staticPipePath, X264_PRESET);
    const staticDurationMs = await encodeDurationConcat(staticFrames, staticDurationPath);
    const staticExactDecodedMatch = await frameMd5(staticPipePath) === await frameMd5(staticDurationPath);
    console.log(JSON.stringify({
      frames: FRAME_COUNT,
      resolution: `${WIDTH}x${HEIGHT}`,
      legacyMs: Number(legacyMs.toFixed(1)),
      pipeMs: Number(pipeMs.toFixed(1)),
      speedup: Number((legacyMs / pipeMs).toFixed(2)),
      exactDecodedMatch,
      staticStates: staticFrames.length,
      staticOutputFrames: expandedStatic.length,
      staticPipeMs: Number(staticPipeMs.toFixed(1)),
      staticDurationMs: Number(staticDurationMs.toFixed(1)),
      staticSpeedup: Number((staticPipeMs / staticDurationMs).toFixed(2)),
      staticExactDecodedMatch,
    }));
  } finally {
    if (win && !win.isDestroyed()) win.destroy();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    app.quit();
  }
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
