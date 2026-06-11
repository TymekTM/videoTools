const { app, BrowserWindow } = require('electron');
const { performance } = require('perf_hooks');

const WIDTH = Number(process.env.VT_BENCH_WIDTH || 640);
const HEIGHT = Number(process.env.VT_BENCH_HEIGHT || 360);
const FRAME_COUNT = Number(process.env.VT_BENCH_FRAMES || 60);
const RAF_WAIT = 'new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r);});});';

const HTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #10131a; }
    #card {
      position: absolute;
      width: 220px;
      height: 110px;
      padding: 18px;
      border-radius: 18px;
      color: white;
      background: linear-gradient(135deg, #6757ff, #21c7a8);
      box-shadow: 0 18px 50px rgba(0, 0, 0, .35);
      font: 700 24px Arial, sans-serif;
      will-change: transform, opacity;
    }
    canvas { position: absolute; inset: 0; }
  </style>
</head>
<body>
  <canvas id="canvas" width="${WIDTH}" height="${HEIGHT}"></canvas>
  <div id="card"><span id="label"></span></div>
  <script>
    const card = document.getElementById('card');
    const label = document.getElementById('label');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    window.updateFrame = function(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'hsl(' + Math.round(t * 240) + ' 80% 45%)');
      gradient.addColorStop(1, '#10131a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.beginPath();
      ctx.arc(80 + t * 480, 270, 20 + t * 35, 0, Math.PI * 2);
      ctx.fill();
      card.style.transform = 'translate(' + (40 + t * 330) + 'px,' + (35 + Math.sin(t * Math.PI) * 120) + 'px) scale(' + (0.8 + t * 0.35) + ')';
      card.style.opacity = String(0.45 + t * 0.55);
      label.textContent = 'Frame ' + Math.round(t * 1000);
    };
  </script>
</body>
</html>`;

function compareBitmaps(actual, expected) {
  if (actual.length !== expected.length) return { equal: false, changed: actual.length };
  let changed = 0;
  let maxDelta = 0;
  for (let i = 0; i < actual.length; i++) {
    const delta = Math.abs(actual[i] - expected[i]);
    if (delta) changed++;
    if (delta > maxDelta) maxDelta = delta;
  }
  return { equal: changed === 0, changed, maxDelta };
}

async function captureLegacy(wc, t, delay = 30) {
  await wc.executeJavaScript(`window.updateFrame(${t});${RAF_WAIT}`);
  if (delay) {
    await wc.executeJavaScript(`new Promise(function(r){setTimeout(r,${delay});});`);
  }
  return wc.capturePage();
}

async function captureDoubleRaf(wc, t) {
  await wc.executeJavaScript(`window.updateFrame(${t});${RAF_WAIT}`);
  return wc.capturePage();
}

async function captureSingleRaf(wc, t) {
  await wc.executeJavaScript(`window.updateFrame(${t});new Promise(requestAnimationFrame);`);
  return wc.capturePage();
}

async function captureDirect(wc, t) {
  await wc.executeJavaScript(`window.updateFrame(${t})`);
  return wc.capturePage();
}

async function benchmark(name, wc, capture, serialization) {
  const started = performance.now();
  let bytes = 0;
  for (let i = 0; i < FRAME_COUNT; i++) {
    const image = await capture(wc, i / Math.max(1, FRAME_COUNT - 1));
    if (serialization === 'bitmap') {
      bytes += image.toBitmap().length;
    } else {
      const jpeg = image.toJPEG(92);
      bytes += serialization === 'base64' ? jpeg.toString('base64').length : jpeg.length;
    }
  }
  const elapsed = performance.now() - started;
  return {
    name,
    elapsed,
    fps: FRAME_COUNT / (elapsed / 1000),
    bytes,
  };
}

async function createBenchWindow() {
  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    show: false,
    frame: false,
    webPreferences: { offscreen: true },
  });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(HTML)}`);
  return win;
}

async function verify(wc, capture) {
  const samples = [0, 0.137, 0.5, 0.863, 1];
  let changed = 0;
  let maxDelta = 0;
  for (const t of samples) {
    const expected = await captureLegacy(wc, t);
    const actual = await capture(wc, t);
    const result = compareBitmaps(actual.toBitmap(), expected.toBitmap());
    changed += result.changed;
    maxDelta = Math.max(maxDelta, result.maxDelta);
  }
  return { equal: changed === 0, changed, maxDelta };
}

app.whenReady().then(async () => {
  const win = await createBenchWindow();
  const wc = win.webContents;

  const variants = [
    ['legacy (2 RAF + 30ms + base64)', (contents, t) => captureLegacy(contents, t), 'base64'],
    ['double RAF + base64', captureDoubleRaf, 'base64'],
    ['single RAF + base64', captureSingleRaf, 'base64'],
    ['direct + base64', captureDirect, 'base64'],
    ['direct + binary IPC', captureDirect, 'binary'],
    ['direct + BGRA bitmap', captureDirect, 'bitmap'],
  ];

  console.log(`Renderer benchmark: ${FRAME_COUNT} frames at ${WIDTH}x${HEIGHT}`);
  for (const [name, capture, serialization] of variants) {
    const correctness = name.startsWith('legacy')
      ? { equal: true, changed: 0, maxDelta: 0 }
      : await verify(wc, capture);
    const result = await benchmark(name, wc, capture, serialization);
    console.log(JSON.stringify({
      variant: name,
      ms: Number(result.elapsed.toFixed(1)),
      fps: Number(result.fps.toFixed(2)),
      megapixelsPerSecond: Number((result.fps * WIDTH * HEIGHT / 1e6).toFixed(2)),
      exactPixelMatch: correctness.equal,
      changedBytes: correctness.changed,
      maxChannelDelta: correctness.maxDelta,
    }));
  }

  win.destroy();
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
