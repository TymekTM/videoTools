const { app, BrowserWindow } = require('electron');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

const WIDTH = 1280;
const HEIGHT = 720;
const RUNS = Number(process.env.VT_BENCH_RUNS || 4);

app.on('window-all-closed', () => {});

function html(id) {
  return `<!doctype html><html><body style="margin:0;overflow:hidden">
    <canvas id="c" width="${WIDTH}" height="${HEIGHT}"></canvas>
    <meta name="benchmark-load" content="${id}">
    <script>
      const c = document.getElementById('c');
      const x = c.getContext('2d');
      window._updateFrame = function(t) {
        const g = x.createLinearGradient(0, 0, c.width, c.height);
        g.addColorStop(0, 'hsl(' + Math.round(t * 300) + ' 80% 50%)');
        g.addColorStop(1, '#111827');
        x.fillStyle = g;
        x.fillRect(0, 0, c.width, c.height);
      };
    </script>
  </body></html>`;
}

function createWindow() {
  return new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    show: false,
    webPreferences: { offscreen: true },
  });
}

async function destroyWindow(win) {
  if (win.isDestroyed()) return;
  await new Promise((resolve) => {
    win.once('closed', resolve);
    win.destroy();
  });
  await new Promise((resolve) => setImmediate(resolve));
}

async function loadAndCapture(win, id) {
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html(id))}`);
  await win.webContents.executeJavaScript('window._updateFrame(0.5)');
  return (await win.webContents.capturePage()).toJPEG(92);
}

async function benchmarkFresh() {
  const started = performance.now();
  const windows = [];
  const hashes = [];
  let bytes = 0;
  try {
    for (let i = 0; i < RUNS; i++) {
      const win = createWindow();
      windows.push(win);
      const frame = await loadAndCapture(win, i);
      bytes += frame.length;
      hashes.push(crypto.createHash('sha256').update(frame).digest('hex'));
    }
  } finally {
    for (const win of windows) await destroyWindow(win);
  }
  return { elapsedMs: performance.now() - started, bytes, hashes };
}

async function benchmarkReuse() {
  const started = performance.now();
  const win = createWindow();
  const hashes = [];
  let bytes = 0;
  try {
    for (let i = 0; i < RUNS; i++) {
      const frame = await loadAndCapture(win, i + RUNS);
      bytes += frame.length;
      hashes.push(crypto.createHash('sha256').update(frame).digest('hex'));
      await win.loadURL('about:blank');
    }
  } finally {
    await destroyWindow(win);
  }
  return { elapsedMs: performance.now() - started, bytes, hashes };
}

app.whenReady().then(async () => {
  try {
    const fresh = await benchmarkFresh();
    const reuse = await benchmarkReuse();
    console.log(JSON.stringify({
      runs: RUNS,
      freshMs: Number(fresh.elapsedMs.toFixed(1)),
      reuseMs: Number(reuse.elapsedMs.toFixed(1)),
      speedup: Number((fresh.elapsedMs / reuse.elapsedMs).toFixed(2)),
      sameBytes: fresh.bytes === reuse.bytes,
      exactFrames: fresh.hashes.every((hash, index) => hash === reuse.hashes[index]),
    }));
  } finally {
    app.quit();
  }
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
