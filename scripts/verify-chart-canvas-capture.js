const { spawn } = require('child_process');
const crypto = require('crypto');
const ffmpegPath = require('ffmpeg-static');
const { buildChartHtml } = require('../mcp/renderers/chart');
const {
  createPage,
  loadHtml,
  waitForFonts,
  captureCanvasFrame,
  closePage,
  closeBrowser,
} = require('../mcp/lib/browser');

const WIDTH = 640;
const HEIGHT = 360;
const PROGRESS_VALUES = [0, 0.25, 0.5, 0.75, 1];
const CHART_TYPES = ['bar', 'line', 'pie', 'counter', 'gauge'];

function runFfmpeg(input) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, [
      '-v', 'error',
      '-f', 'image2pipe',
      '-i', 'pipe:0',
      '-f', 'rawvideo',
      'pipe:1',
    ], { stdio: ['pipe', 'pipe', 'pipe'] });
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

async function decodedHash(base64) {
  const raw = await runFfmpeg(Buffer.from(base64, 'base64'));
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function chartOptions(chartType) {
  return {
    width: WIDTH,
    height: HEIGHT,
    chartType,
    data: [
      { label: 'A', value: 120 },
      { label: 'B', value: 230 },
      { label: 'C', value: 180 },
      { label: 'D', value: 310 },
    ],
    title: 'Renderer',
    subtitle: 'Capture verification',
    palette: 'vivid',
    bgColor: '#1a1a2e',
    textColor: '#e4e4e7',
    fontSize: 24,
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

async function verifyType(chartType) {
  const page = await createPage(WIDTH, HEIGHT);
  try {
    await loadHtml(page, buildChartHtml(chartOptions(chartType)));
    await waitForFonts(page);
    let matchingFrames = 0;
    for (const progress of PROGRESS_VALUES) {
      await page.evaluate((value) => window._updateFrame(value), progress);
      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 92,
        encoding: 'base64',
      });
      const canvas = await captureCanvasFrame(page, '#c');
      if (await decodedHash(screenshot) === await decodedHash(canvas)) {
        matchingFrames++;
      }
    }
    return {
      chartType,
      matchingFrames,
      totalFrames: PROGRESS_VALUES.length,
    };
  } finally {
    await closePage(page);
  }
}

async function run() {
  try {
    const results = [];
    for (const chartType of CHART_TYPES) {
      results.push(await verifyType(chartType));
    }
    const exact = results.every((result) => result.matchingFrames === result.totalFrames);
    console.log(JSON.stringify({ exact, results }));
    if (!exact) process.exitCode = 1;
  } finally {
    await closeBrowser();
  }
}

run().catch(async (error) => {
  console.error(error);
  await closeBrowser();
  process.exit(1);
});
