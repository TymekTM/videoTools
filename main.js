const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

let mainWindow;
let exportWindow = null;

const FONTS_LINK = '<link href="https://fonts.googleapis.com/css2?family=Bitter:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;0,900;1,400&family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@400;600;700;900&family=Lora:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;500;600;700;800&family=Merriweather:wght@400;700;900&family=Outfit:wght@400;500;600;700;800&family=Oswald:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Roboto+Slab:wght@400;700&family=Sora:wght@400;600;700;800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=Space+Grotesk:wght@400;600;700&family=Work+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">';

const EXPORT_HTML = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${FONTS_LINK}
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden}
.keyword-highlight{color:#000;font-weight:800;padding:2px 6px;border-radius:2px;white-space:nowrap;display:inline}
</style>
<script>
window._renderAndCapture = function(slides) {
  var results = [];
  var i = 0;
  function next() {
    if (i >= slides.length) return Promise.resolve(results);
    var d = slides[i];
    document.body.innerHTML = d.bodyHtml;
    return document.fonts.ready.then(function() {
      return new Promise(function(r) { requestAnimationFrame(function() { requestAnimationFrame(r); }); });
    }).then(function() {
      var kw = document.querySelector('.keyword-highlight');
      var sc = document.querySelector('.zoom-scroll');
      if (kw && sc) {
        var sR = sc.getBoundingClientRect();
        var kR = kw.getBoundingClientRect();
        var cx = kR.left + kR.width / 2 - sR.left;
        var cy = kR.top + kR.height / 2 - sR.top;
        var ox = sR.width / 2 - cx + d.offX;
        var oy = sR.height / 2 - cy + d.offY;
        document.querySelector('.article-inner').style.transform =
          'translate(' + ox + 'px,' + oy + 'px) scale(' + d.zoom + ')';
      }
      return new Promise(function(r) { requestAnimationFrame(function() { requestAnimationFrame(r); }); });
    }).then(function() {
      results.push({ idx: i });
      i++;
      return next();
    });
  }
  return next();
};
</script>
</head><body></body></html>`;

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

ipcMain.handle('export-init', async (event, { width, height }) => {
  if (exportWindow) { exportWindow.close(); exportWindow = null; }
  exportWindow = new BrowserWindow({
    width, height,
    show: false,
    webPreferences: { offscreen: true }
  });
  await exportWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(EXPORT_HTML));
  await exportWindow.webContents.executeJavaScript('document.fonts.ready');
  return true;
});

ipcMain.handle('export-slides', async (event, { slides }) => {
  if (!exportWindow) return [];
  const frames = [];
  for (let i = 0; i < slides.length; i++) {
    const d = slides[i];
    await exportWindow.webContents.executeJavaScript(
      'window._renderAndCapture(' + JSON.stringify([d]) + ')'
    );
    const image = await exportWindow.webContents.capturePage();
    frames.push({ data: image.toPNG().toString('base64'), duration: d.duration });
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
  for (const frame of frames) {
    const buf = Buffer.from(frame.data, 'base64');
    for (let d = 0; d < frame.duration; d++) {
      fs.writeFileSync(path.join(tmpDir, `frame_${String(frameIdx).padStart(6, '0')}.png`), buf);
      frameIdx++;
    }
  }

  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-framerate', String(fps),
      '-i', path.join(tmpDir, 'frame_%06d.png'),
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
      else reject(new Error(`ffmpeg exited ${code}: ${stderr}`));
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
