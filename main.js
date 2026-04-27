const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

let mainWindow;
let bgWindow = null;
let exportWindow = null;

const FONTS_LINK = '<link href="https://fonts.googleapis.com/css2?family=Bitter:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;0,900;1,400&family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@400;600;700;900&family=Lora:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;500;600;700;800&family=Merriweather:wght@400;700;900&family=Outfit:wght@400;500;600;700;800&family=Oswald:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Roboto+Slab:wght@400;700&family=Sora:wght@400;600;700;800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=Space+Grotesk:wght@400;600;700&family=Work+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">';

const EXPORT_HTML = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${FONTS_LINK}
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden}
.keyword-highlight{font-weight:800;padding:2px 6px;border-radius:2px;white-space:nowrap;display:inline}
</style>
<script>
var _fontsReady = false;
window._setAccent = function(c) {
  var el = document.getElementById('dynAccent');
  if (!el) { el = document.createElement('style'); el.id = 'dynAccent'; document.head.appendChild(el); }
  el.textContent = '.keyword-highlight{background:linear-gradient(120deg,'+c+'ee,'+c+');color:#000;box-shadow:0 0 20px '+c+'66,0 0 60px '+c+'26}';
};
window._renderSlide = function(d) {
  document.getElementById('slide').innerHTML = d.bodyHtml;
  var kw = document.querySelector('.keyword-highlight');
  var sc = document.querySelector('.zoom-scroll');
  var inner = document.querySelector('.article-inner');
  if (kw && sc && inner) {
    var sR = sc.getBoundingClientRect();
    var kR = kw.getBoundingClientRect();
    var kCX = kR.left + kR.width / 2 - sR.left;
    var kCY = kR.top + kR.height / 2 - sR.top;
    var ox = (sR.width / 2 - kCX * d.zoom) + d.offX * d.zoom;
    var oy = (sR.height / 2 - kCY * d.zoom) + d.offY * d.zoom;
    inner.style.transform = 'translate('+ox+'px,'+oy+'px) scale('+d.zoom+')';
    inner.style.transformOrigin = '0 0';
  }
};
window._waitForFonts = function() {
  return document.fonts.ready.then(function() { _fontsReady = true; });
};
window._setVignette = function(o, size, spread) {
  var v = document.getElementById('vignette');
  if (!v) return;
  if (o <= 0) { v.style.background = 'none'; return; }
  v.style.background = 'radial-gradient(ellipse '+size+'% '+Math.round(size*0.9)+'% at 50% 50%,transparent 0%,rgba(0,0,0,'+(o*0.08).toFixed(2)+') '+(100-spread)+'%,rgba(0,0,0,'+(o*0.25).toFixed(2)+') '+(100-spread*0.7)+'%,rgba(0,0,0,'+(o*0.5).toFixed(2)+') '+(100-spread*0.4)+'%,rgba(0,0,0,'+o.toFixed(2)+') 100%)';
};
</script>
</head><body>
<div id="slide" style="position:absolute;inset:0"></div>
<div id="vignette" style="position:absolute;inset:0;pointer-events:none;z-index:10"></div>
</body></html>`;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 950,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#141417',
    title: 'Video Tools',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}

ipcMain.handle('save-dialog', async (event, { defaultName, filters }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: filters || [{ name: 'PNG', extensions: ['png'] }]
  });
  return result.canceled ? null : result.filePath;
});

ipcMain.handle('export-png', async (event, { rect, savePath }) => {
  const image = await mainWindow.webContents.capturePage(rect);
  const png = image.toPNG();
  fs.writeFileSync(savePath, png);
  return savePath;
});

ipcMain.handle('capture-frame', async (event, { rect }) => {
  const image = await mainWindow.webContents.capturePage(rect);
  return image.toPNG().toString('base64');
});

ipcMain.handle('bg-init', async (event, { width, height, css, body }) => {
  if (bgWindow) { bgWindow.close(); bgWindow = null; }

  const extraCss = css
    ? (css.startsWith('/') || css.match(/^[A-Z]:\\/i) ? fs.readFileSync(css, 'utf8') : css)
    : '';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${FONTS_LINK}
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#000}
${extraCss}
</style>
</head><body>
<div id="container" style="width:${width}px;height:${height}px;overflow:hidden;position:relative">${body || ''}</div>
<script>
window._bgRender = function(html) {
  document.getElementById('container').innerHTML = html;
};
window._bgSetBody = function(html) {
  document.body.insertAdjacentHTML('beforeend', html);
};
</script>
</body></html>`;

  bgWindow = new BrowserWindow({
    width, height,
    show: false,
    webPreferences: { offscreen: true }
  });
  await bgWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await bgWindow.webContents.executeJavaScript('document.fonts.ready');
  return true;
});

ipcMain.handle('bg-render', async (event, { html, delay }) => {
  if (!bgWindow) return null;
  const wc = bgWindow.webContents;
  await wc.executeJavaScript(
    'window._bgRender(' + JSON.stringify(html) + ');' +
    'new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r);});});'
  );
  if (delay) {
    await wc.executeJavaScript(
      'new Promise(function(r){setTimeout(r,' + delay + ');});'
    );
  }
  const image = await wc.capturePage();
  return image.toJPEG(92).toString('base64');
});

ipcMain.handle('bg-render-js', async (event, { html, js }) => {
  if (!bgWindow) return null;
  const wc = bgWindow.webContents;
  await wc.executeJavaScript(
    'window._bgRender(' + JSON.stringify(html) + ');' +
    'new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r);});});'
  );
  if (js) {
    await wc.executeJavaScript(js);
    await wc.executeJavaScript(
      'new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r);});});'
    );
  }
  const image = await wc.capturePage();
  return image.toJPEG(92).toString('base64');
});

ipcMain.handle('bg-eval', async (event, code) => {
  if (!bgWindow) return null;
  return await bgWindow.webContents.executeJavaScript(code);
});

ipcMain.handle('bg-cleanup', () => {
  if (bgWindow) { bgWindow.close(); bgWindow = null; }
});

ipcMain.handle('export-init', async (event, { width, height, accent, vignetteOpacity, vignetteSize, vignetteSpread }) => {
  if (exportWindow) { exportWindow.close(); exportWindow = null; }
  exportWindow = new BrowserWindow({
    width, height,
    show: false,
    webPreferences: { offscreen: true }
  });
  await exportWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(EXPORT_HTML));
  await exportWindow.webContents.executeJavaScript(`
    window._waitForFonts().then(function() {
      window._setAccent(${JSON.stringify(accent)});
      window._setVignette(${vignetteOpacity/100}, ${vignetteSize}, ${vignetteSpread});
    })
  `);
  return true;
});

ipcMain.handle('export-slides', async (event, { slides }) => {
  if (!exportWindow) return [];
  const wc = exportWindow.webContents;
  const frames = [];
  for (const d of slides) {
    await wc.executeJavaScript(
      'window._renderSlide(' + JSON.stringify(d) + ');' +
      'new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r);});});'
    );
    const image = await wc.capturePage();
    frames.push({ data: image.toJPEG(92).toString('base64'), duration: d.duration });
  }
  return frames;
});

ipcMain.handle('export-cleanup', () => {
  if (exportWindow) { exportWindow.close(); exportWindow = null; }
});

ipcMain.handle('export-mp4', async (event, { frames, savePath, fps, width, height }) => {
  const tmpDir = path.join(os.tmpdir(), `vt-export-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  let frameIdx = 0;
  const dupMap = new Map();
  for (const frame of frames) {
    const buf = Buffer.from(frame.data, 'base64');
    const fname = `f_${String(frameIdx).padStart(6, '0')}.jpg`;
    fs.writeFileSync(path.join(tmpDir, fname), buf);
    dupMap.set(frameIdx, { buf, count: frame.duration });
    frameIdx++;
  }

  let concatContent = '';
  for (const [idx, info] of dupMap) {
    for (let d = 0; d < info.count; d++) {
      concatContent += `file 'f_${String(idx).padStart(6, '0')}.jpg'\n`;
    }
  }

  fs.writeFileSync(path.join(tmpDir, 'concat.txt'), concatContent);

  return new Promise((resolve, reject) => {
    const args = [
      '-y', '-f', 'concat', '-safe', '0',
      '-r', String(fps),
      '-i', path.join(tmpDir, 'concat.txt'),
      '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'fast',
      '-crf', '18',
      '-movflags', '+faststart',
      savePath
    ];
    const proc = spawn(ffmpegPath, args);
    let stderr = '';
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', (code) => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      if (code === 0) resolve(savePath);
      else reject(new Error('ffmpeg exited ' + code + ': ' + stderr));
    });
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
