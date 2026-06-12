const { app, BrowserWindow } = require('electron');
const crypto = require('crypto');
const { performance } = require('perf_hooks');
const { buildChartHtml } = require('../mcp/renderers/chart');

const WIDTH = Number(process.env.VT_BENCH_WIDTH || 1280);
const HEIGHT = Number(process.env.VT_BENCH_HEIGHT || 720);
const FRAMES = Number(process.env.VT_BENCH_FRAMES || 90);

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
    subtitle: 'Electron canvas benchmark',
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

async function createWindow() {
  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    show: false,
    frame: false,
    webPreferences: { offscreen: true },
  });
  const html = buildChartHtml(chartOptions());
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  await win.webContents.executeJavaScript('document.fonts.ready');
  return win;
}

async function benchmark(win, capture) {
  for (let i = 0; i < 5; i++) {
    await win.webContents.executeJavaScript(`window._updateFrame(${i / 5})`);
    await capture(win);
  }
  let bytes = 0;
  let sample;
  const started = performance.now();
  for (let i = 0; i < FRAMES; i++) {
    const progress = i / Math.max(1, FRAMES - 1);
    await win.webContents.executeJavaScript(`window._updateFrame(${progress})`);
    const data = await capture(win);
    if (!sample && i === Math.floor(FRAMES / 2)) sample = data;
    bytes += data.length;
  }
  return {
    elapsedMs: performance.now() - started,
    bytes,
    sample,
  };
}

app.whenReady().then(async () => {
  let screenshotWindow;
  let canvasWindow;
  try {
    screenshotWindow = await createWindow();
    const screenshot = await benchmark(screenshotWindow, async (win) => (
      (await win.webContents.capturePage()).toJPEG(92)
    ));

    canvasWindow = await createWindow();
    const canvas = await benchmark(canvasWindow, async (win) => {
      const base64 = await win.webContents.executeJavaScript(
        `document.getElementById('c').toDataURL('image/jpeg', 0.92).split(',')[1]`
      );
      return Buffer.from(base64, 'base64');
    });

    console.log(JSON.stringify({
      resolution: `${WIDTH}x${HEIGHT}`,
      frames: FRAMES,
      screenshotMs: Number(screenshot.elapsedMs.toFixed(1)),
      canvasMs: Number(canvas.elapsedMs.toFixed(1)),
      speedup: Number((screenshot.elapsedMs / canvas.elapsedMs).toFixed(2)),
      screenshotBytes: screenshot.bytes,
      canvasBytes: canvas.bytes,
      encodedMatch: crypto.timingSafeEqual(
        crypto.createHash('sha256').update(screenshot.sample).digest(),
        crypto.createHash('sha256').update(canvas.sample).digest()
      ),
    }));
  } finally {
    if (screenshotWindow && !screenshotWindow.isDestroyed()) screenshotWindow.destroy();
    if (canvasWindow && !canvasWindow.isDestroyed()) canvasWindow.destroy();
    app.quit();
  }
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
