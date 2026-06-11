const { performance } = require('perf_hooks');
const {
  createPage,
  loadHtml,
  captureFrame,
  closePage,
  closeBrowser,
} = require('./lib/browser');
const { buildMapHtml } = require('./renderers/map');

const WIDTH = Number(process.env.VT_BENCH_WIDTH || 1280);
const HEIGHT = Number(process.env.VT_BENCH_HEIGHT || 720);
const LEGACY_WAIT_MS = 3000;

async function run() {
  const routeCoords = [
    { lat: 52.2297, lng: 21.0122 },
    { lat: 50.7, lng: 14.8 },
    { lat: 48.8566, lng: 2.3522 },
  ];
  const html = buildMapHtml({
    width: WIDTH,
    height: HEIGHT,
    routeCoords,
    waypoints: [
      { ...routeCoords[0], name: 'Warsaw' },
      { ...routeCoords[2], name: 'Paris' },
    ],
    segments: null,
    centerLat: 50.5,
    centerLng: 11.7,
    zoom: 5,
    mapStyle: 'dark',
    cameraMode: 'static',
    transportType: 'plane',
    routeColor: '#6366f1',
    routeWidth: 4,
    showLabels: true,
  });

  const page = await createPage(WIDTH, HEIGHT);
  const started = performance.now();
  await loadHtml(page, html);
  await page.evaluate(() => window._tilesReady);
  const readyMs = performance.now() - started;
  await page.evaluate(() => window._setProgress(0.5));
  const samples = [];
  let previousDelay = 0;
  for (const delay of [0, 100, 250, 500, 1000]) {
    await new Promise((resolve) => setTimeout(resolve, delay - previousDelay));
    samples.push({ delay, elapsed: performance.now() - started, frame: await captureFrame(page) });
    previousDelay = delay;
  }

  const remainingWait = Math.max(0, LEGACY_WAIT_MS - (performance.now() - started));
  await new Promise((resolve) => setTimeout(resolve, remainingWait));
  const legacyFrame = await captureFrame(page);
  const legacyMs = performance.now() - started;
  const comparisons = samples.map((sample) => ({
    delayMs: sample.delay,
    elapsedMs: Number(sample.elapsed.toFixed(1)),
    exactEncodedMatch: sample.frame === legacyFrame,
  }));
  const firstExact = comparisons.find((sample) => sample.exactEncodedMatch);

  console.log(JSON.stringify({
    resolution: `${WIDTH}x${HEIGHT}`,
    readyMs: Number(readyMs.toFixed(1)),
    legacyMs: Number(legacyMs.toFixed(1)),
    startupSpeedup: firstExact ? Number((legacyMs / firstExact.elapsedMs).toFixed(2)) : null,
    firstExact,
    comparisons,
  }));
  await closePage(page);
  await closeBrowser();
}

run().catch(async (error) => {
  console.error(error);
  await closeBrowser();
  process.exit(1);
});
