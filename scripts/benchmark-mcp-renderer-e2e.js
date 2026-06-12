const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(process.env.VT_RENDERER_ROOT || path.join(__dirname, '..'));
const rendererName = process.env.VT_BENCH_RENDERER || 'chat';
const runs = Number(process.env.VT_BENCH_RUNS || 1);
const renderer = require(path.join(root, `mcp/renderers/${rendererName}`));
const { closeBrowser } = require(path.join(root, 'mcp/lib/browser'));
const requestedOutput = process.env.VT_BENCH_OUTPUT
  ? path.resolve(process.env.VT_BENCH_OUTPUT)
  : null;

const paramsByRenderer = {
  newspaper: {
    keyword: 'RENDERER',
    templates: ['nyt', 'guardian', 'verge', 'wikipedia'],
    format: '16:9',
    resolution: '720p',
    duration: 12,
    fps: 30,
    speed: 800,
    animationPreset: 'none',
  },
  chat: {
    platform: 'imessage',
    format: '9:16',
    resolution: '720p',
    fps: 30,
    animSpeed: 600,
    messages: [
      { sender: 0, text: 'Pierwsza wiadomość' },
      { sender: 1, text: 'Druga wiadomość' },
      { sender: 0, text: 'Trzecia wiadomość' },
      { sender: 1, text: 'Czwarta wiadomość' },
      { sender: 0, text: 'Piąta wiadomość' },
      { sender: 1, text: 'Szósta wiadomość' },
      { sender: 0, text: 'Siódma wiadomość' },
      { sender: 1, text: 'Ósma wiadomość' },
    ],
  },
  typing: {
    theme: 'editor',
    format: '16:9',
    resolution: '720p',
    fps: 30,
    typeSpeed: 34,
    startDelay: 1000,
    endDelay: 1500,
    cursorBlink: false,
    sequences: [
      { action: 'type', text: 'renderer benchmark' },
      { action: 'pause', duration: 1000 },
    ],
  },
  chart: {
    chartType: 'bar',
    format: '16:9',
    resolution: '720p',
    fps: 30,
    animDuration: 3,
    data: [
      { label: 'A', value: 120 },
      { label: 'B', value: 230 },
      { label: 'C', value: 180 },
      { label: 'D', value: 310 },
      { label: 'E', value: 270 },
    ],
  },
  notification: {
    theme: 'ios',
    format: '16:9',
    resolution: '720p',
    fps: 30,
    animSpeed: 600,
    notifications: Array.from({ length: 6 }, (_, index) => ({
      appName: 'Instagram',
      title: `Notification ${index + 1}`,
      message: `Renderer benchmark ${index + 1}`,
      accentColor: '#E1306C',
    })),
  },
  map: {
    waypoints: [
      { lat: 52.2297, lng: 21.0122, name: 'Warsaw' },
      { lat: 50.0647, lng: 19.945, name: 'Krakow' },
    ],
    transportType: 'plane',
    mapStyle: 'dark',
    cameraMode: 'overview',
    format: '16:9',
    resolution: '720p',
    fps: 30,
    animDuration: 3,
    zoom: 5,
    easing: true,
    showLabels: true,
  },
};

async function run() {
  const params = paramsByRenderer[rendererName];
  if (!params) throw new Error(`Unsupported renderer: ${rendererName}`);
  const results = [];
  try {
    for (let runIndex = 0; runIndex < runs; runIndex++) {
      const output = requestedOutput || path.join(
        os.tmpdir(),
        `vt-${rendererName}-${process.pid}-${runIndex}.mp4`
      );
      const started = performance.now();
      const result = await renderer.generate(params, output, 'mp4');
      results.push({
        run: runIndex + 1,
        elapsedMs: Number((performance.now() - started).toFixed(1)),
        frames: result.frames,
        duration: result.duration,
        fileSize: result.fileSize,
      });
      if (!requestedOutput) fs.rmSync(output, { force: true });
    }
    console.log(JSON.stringify({
      root,
      renderer: rendererName,
      runs: results,
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
