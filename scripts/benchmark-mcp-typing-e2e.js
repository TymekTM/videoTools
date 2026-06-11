const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(process.env.VT_RENDERER_ROOT || path.join(__dirname, '..'));
const renderer = require(path.join(root, 'mcp/renderers/typing'));
const { closeBrowser } = require(path.join(root, 'mcp/lib/browser'));

const fps = Number(process.env.VT_BENCH_FPS || 30);
const staticSeconds = Number(process.env.VT_BENCH_STATIC_SECONDS || 30);
const resolution = process.env.VT_BENCH_RESOLUTION || '720p';
const output = path.join(os.tmpdir(), `vt-typing-${process.pid}.mp4`);

async function run() {
  const started = performance.now();
  try {
    const result = await renderer.generate({
      theme: 'editor',
      format: '16:9',
      resolution,
      fps,
      typeSpeed: 1000 / fps,
      startDelay: staticSeconds * 1000,
      endDelay: staticSeconds * 1000,
      cursorBlink: false,
      sequences: [
        { action: 'type', text: 'renderer-speed-test' },
        { action: 'pause', duration: staticSeconds * 1000 },
      ],
    }, output, 'mp4');

    console.log(JSON.stringify({
      root,
      elapsedMs: Number((performance.now() - started).toFixed(1)),
      frames: result.frames,
      duration: result.duration,
      fileSize: result.fileSize,
      fps,
      staticSeconds,
      resolution,
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
