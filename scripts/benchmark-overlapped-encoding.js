const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { performance } = require('perf_hooks');
const ffmpegPath = require('ffmpeg-static');
const { encodeMp4, createMp4Stream, X264_PRESET } = require('../shared/encoder');
const AnimationCore = require('../shared/animation');
const { buildChartHtml } = require('../mcp/renderers/chart');
const {
  createPage,
  loadHtml,
  waitForFonts,
  captureCanvasFrame,
  closePage,
  closeBrowser,
} = require('../mcp/lib/browser');

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;

function chartOptions() {
  return {
    width: WIDTH,
    height: HEIGHT,
    chartType: 'bar',
    data: [
      { label: 'A', value: 120 },
      { label: 'B', value: 230 },
      { label: 'C', value: 180 },
      { label: 'D', value: 310 },
      { label: 'E', value: 270 },
    ],
    title: 'Renderer',
    subtitle: 'Overlapped encoding',
    palette: 'vivid',
    bgColor: '#1a1a2e',
    textColor: '#e4e4e7',
    fontSize: 32,
    stagger: 0.08,
    easing: 'easeOut',
    barRadius: 6,
    lineWidth: 3,
    lineSmooth: true,
    donutHole: 0.6,
    showLabels: true,
    showValues: true,
    showGrid: true,
    showLegend: true,
    counterFrom: 0,
    counterTo: 1000000,
    counterPrefix: '',
    counterSuffix: '',
    counterDecimals: 0,
    gaugeValue: 72,
    gaugeLabel: 'Performance',
  };
}

async function createChartPage() {
  const page = await createPage(WIDTH, HEIGHT);
  await loadHtml(page, buildChartHtml(chartOptions()));
  await waitForFonts(page);
  return page;
}

function createPipe(outputPath) {
  const proc = spawn(ffmpegPath, [
    '-y',
    '-f', 'image2pipe',
    '-framerate', String(FPS),
    '-vcodec', 'mjpeg',
    '-i', 'pipe:0',
    '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', X264_PRESET,
    '-crf', '18',
    '-movflags', '+faststart',
    outputPath,
  ], { stdio: ['pipe', 'ignore', 'pipe'] });
  let stderr = '';
  proc.stderr.on('data', (chunk) => (stderr += chunk.toString()));
  const done = new Promise((resolve, reject) => {
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr));
    });
  });
  return { proc, done };
}

async function writeBuffer(stream, buffer) {
  if (stream.write(buffer)) return;
  await new Promise((resolve, reject) => {
    const onDrain = () => {
      stream.off('error', onError);
      resolve();
    };
    const onError = (error) => {
      stream.off('drain', onDrain);
      reject(error);
    };
    stream.once('drain', onDrain);
    stream.once('error', onError);
  });
}

async function frameMd5(filePath) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, [
      '-v', 'error',
      '-i', filePath,
      '-f', 'framemd5',
      'pipe:1',
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout = [];
    let stderr = '';
    proc.stdout.on('data', (chunk) => stdout.push(chunk));
    proc.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve(Buffer.concat(stdout).toString());
      else reject(new Error(stderr));
    });
  });
}

async function renderSequential(plan, outputPath) {
  const page = await createChartPage();
  const started = performance.now();
  try {
    const frames = [];
    for (const spec of plan.frames) {
      await page.evaluate((progress) => window._updateFrame(progress), spec.progress);
      frames.push({
        data: await captureCanvasFrame(page, '#c'),
        duration: spec.duration,
      });
    }
    await encodeMp4(frames, outputPath, FPS);
    return performance.now() - started;
  } finally {
    await closePage(page);
  }
}

async function capturePlan(plan) {
  const page = await createChartPage();
  try {
    const frames = [];
    for (const spec of plan.frames) {
      await page.evaluate((progress) => window._updateFrame(progress), spec.progress);
      frames.push({
        data: await captureCanvasFrame(page, '#c'),
        duration: spec.duration,
      });
    }
    return frames;
  } finally {
    await closePage(page);
  }
}

async function renderOverlapped(plan, outputPath) {
  const page = await createChartPage();
  const { proc, done } = createPipe(outputPath);
  const started = performance.now();
  try {
    for (const spec of plan.frames) {
      await page.evaluate((progress) => window._updateFrame(progress), spec.progress);
      const buffer = Buffer.from(await captureCanvasFrame(page, '#c'), 'base64');
      for (let repeat = 0; repeat < spec.duration; repeat++) {
        await writeBuffer(proc.stdin, buffer);
      }
    }
    proc.stdin.end();
    await done;
    return performance.now() - started;
  } finally {
    await closePage(page);
  }
}

async function run() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vt-overlap-'));
  try {
    const plan = AnimationCore.buildFramePlan({
      durationSeconds: 3,
      holdSeconds: 1.5,
    }, FPS);
    const sequentialPath = path.join(dir, 'sequential.mp4');
    const overlappedPath = path.join(dir, 'overlapped.mp4');
    const sequentialMs = await renderSequential(plan, sequentialPath);
    const overlappedMs = await renderOverlapped(plan, overlappedPath);
    const sameInputFrames = await capturePlan(plan);
    const sameInputConcatPath = path.join(dir, 'same-input-concat.mp4');
    const sameInputStreamPath = path.join(dir, 'same-input-stream.mp4');
    await encodeMp4(sameInputFrames, sameInputConcatPath, FPS);
    const stream = createMp4Stream(sameInputStreamPath, FPS);
    await stream.write(sameInputFrames);
    await stream.finish();
    console.log(JSON.stringify({
      logicalFrames: plan.totalFrames,
      capturedFrames: plan.frames.length,
      sequentialMs: Number(sequentialMs.toFixed(1)),
      overlappedMs: Number(overlappedMs.toFixed(1)),
      speedup: Number((sequentialMs / overlappedMs).toFixed(2)),
      crossRunExactDecodedMatch: await frameMd5(sequentialPath) === await frameMd5(overlappedPath),
      sameInputExactDecodedMatch: await frameMd5(sameInputConcatPath) === await frameMd5(sameInputStreamPath),
      sequentialBytes: fs.statSync(sequentialPath).size,
      overlappedBytes: fs.statSync(overlappedPath).size,
    }));
  } finally {
    await closeBrowser();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

run().catch(async (error) => {
  console.error(error);
  await closeBrowser();
  process.exit(1);
});
