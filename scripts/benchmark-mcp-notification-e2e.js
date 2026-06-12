const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(process.env.VT_RENDERER_ROOT || path.join(__dirname, '..'));
const renderer = require(path.join(root, 'mcp/renderers/notification'));
const { closeBrowser } = require(path.join(root, 'mcp/lib/browser'));

const resolution = process.env.VT_BENCH_RESOLUTION || '720p';
const notificationCount = Number(process.env.VT_BENCH_NOTIFICATIONS || 1);
const output = path.join(os.tmpdir(), `vt-notification-${process.pid}.webm`);

async function run() {
  const started = performance.now();
  try {
    const result = await renderer.generate({
      theme: 'ios',
      format: '16:9',
      resolution,
      fps: 30,
      animSpeed: 600,
      slideDuration: 300,
      notifications: Array.from({ length: notificationCount }, (_, index) => (
        {
          appName: 'Instagram',
          title: `Renderer benchmark ${index + 1}`,
          message: `Cross-platform PNG capture ${index + 1}`,
          accentColor: '#E1306C',
        }
      )),
    }, output, 'webm');

    console.log(JSON.stringify({
      root,
      elapsedMs: Number((performance.now() - started).toFixed(1)),
      frames: result.frames,
      duration: result.duration,
      fileSize: result.fileSize,
      resolution,
      notificationCount,
    }));
  } finally {
    await closeBrowser();
    fs.rmSync(output, { force: true });
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
