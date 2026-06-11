const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    });
  } catch (_) {}
}
loadEnv();

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
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: { offscreen: true }
  });
  await bgWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await bgWindow.webContents.executeJavaScript('document.fonts.ready');
  return true;
});

const RAF_WAIT = 'new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r);});});';

function delayJs(ms) {
  return 'new Promise(function(r){setTimeout(r,' + ms + ');});';
}

async function bgCapture({ html = null, js = null, delay = null, format = 'jpeg' } = {}) {
  if (!bgWindow) return null;
  const wc = bgWindow.webContents;
  if (html !== null) {
    await wc.executeJavaScript('window._bgRender(' + JSON.stringify(html) + ');');
  }
  if (js) {
    await wc.executeJavaScript(js);
  }
  if (delay) {
    await wc.executeJavaScript(delayJs(delay));
  }
  const image = await wc.capturePage();
  return format === 'png'
    ? image.toPNG()
    : image.toJPEG(92);
}

async function runFfmpegExport({ frames, savePath, fps, width, height, writeFrames, buildArgs }) {
  const tmpDir = path.join(os.tmpdir(), `vt-export-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  await writeFrames(tmpDir, frames);
  return new Promise((resolve, reject) => {
    const args = buildArgs(tmpDir, { fps, width, height, savePath });
    const proc = spawn(ffmpegPath, args);
    let stderr = '';
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', (code) => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      if (code === 0) resolve(savePath);
      else reject(new Error('ffmpeg exited ' + code + ': ' + stderr));
    });
  });
}

function* encodedFrameBuffers(frames) {
  for (const frame of frames) {
    const buffer = typeof frame.data === 'string'
      ? Buffer.from(frame.data, 'base64')
      : Buffer.from(frame.data.buffer, frame.data.byteOffset, frame.data.byteLength);
    for (let i = 0; i < frame.duration; i++) {
      yield buffer;
    }
  }
}

async function writeBuffers(stream, buffers) {
  for (const buffer of buffers) {
    if (!stream.write(buffer)) {
      await new Promise((resolve, reject) => {
        const onDrain = () => {
          stream.off('error', onError);
          resolve();
        };
        const onError = (error) => {
          stream.off('drain', onDrain);
          reject(error);
        };
        stream.once('drain', onDrain);
        stream.once('error', onError);
      });
    }
  }
  stream.end();
}

function runFfmpegPipeExport({ frames, savePath, fps, width, height, inputCodec, buildArgs }) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-f', 'image2pipe',
      '-framerate', String(fps),
      '-vcodec', inputCodec,
      '-i', 'pipe:0',
      ...buildArgs({ fps, width, height, savePath })
    ];
    const proc = spawn(ffmpegPath, args, { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';
    let settled = false;
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('error', reject);
    proc.on('close', (code) => {
      settled = true;
      if (code === 0) resolve(savePath);
      else reject(new Error('ffmpeg exited ' + code + ': ' + stderr));
    });
    writeBuffers(proc.stdin, encodedFrameBuffers(frames)).catch((error) => {
      if (!settled) proc.kill();
      reject(error);
    });
  });
}

function writeJpgConcat(tmpDir, frames) {
  let frameIdx = 0;
  for (const frame of frames) {
    const buf = Buffer.from(frame.data, 'base64');
    const fname = `f_${String(frameIdx).padStart(6, '0')}.jpg`;
    fs.writeFileSync(path.join(tmpDir, fname), buf);
    frameIdx++;
  }
  let concatContent = '';
  for (let idx = 0; idx < frames.length; idx++) {
    for (let d = 0; d < frames[idx].duration; d++) {
      concatContent += `file 'f_${String(idx).padStart(6, '0')}.jpg'\n`;
    }
  }
  fs.writeFileSync(path.join(tmpDir, 'concat.txt'), concatContent);
}

function writePngDuplicated(tmpDir, frames) {
  let idx = 0;
  for (const frame of frames) {
    const buf = Buffer.from(frame.data, 'base64');
    for (let d = 0; d < frame.duration; d++) {
      fs.writeFileSync(path.join(tmpDir, `f_${String(idx).padStart(6, '0')}.png`), buf);
      idx++;
    }
  }
}

ipcMain.handle('bg-render', (e, p) => bgCapture({ html: p.html, delay: p.delay, format: 'jpeg' }));

ipcMain.handle('bg-render-png', (e, p) => bgCapture({ html: p.html, format: 'png' }));

ipcMain.handle('bg-render-js', (e, p) => bgCapture({ html: p.html, js: p.js, format: 'jpeg' }));

ipcMain.handle('bg-apply-capture', (e, p) => bgCapture({ js: p.js, format: 'jpeg' }));

ipcMain.handle('bg-eval', async (event, code) => {
  if (!bgWindow || bgWindow.isDestroyed()) return null;
  return await bgWindow.webContents.executeJavaScript(code);
});

ipcMain.handle('bg-load-html', async (event, { html, width, height }) => {
  if (bgWindow) { try { bgWindow.close(); } catch (_) {} bgWindow = null; }
  const tmpHtml = path.join(os.tmpdir(), 'vt-bg-' + Date.now() + '.html');
  fs.writeFileSync(tmpHtml, html, 'utf8');
  bgWindow = new BrowserWindow({
    width: width || 1920,
    height: height || 1080,
    show: false,
    webPreferences: { offscreen: true }
  });
  bgWindow.webContents.on('render-process-gone', (e, details) => {
    console.error('[bgWindow] render-process-gone:', details.reason, details.exitCode);
  });
  bgWindow.webContents.on('crashed', () => {
    console.error('[bgWindow] webContents crashed');
  });
  await bgWindow.loadFile(tmpHtml);
  try { fs.unlinkSync(tmpHtml); } catch (_) {}
  return true;
});

ipcMain.handle('bg-eval-capture', (e, p) => bgCapture({ js: p.js, delay: p.delay, format: 'jpeg' }));

ipcMain.handle('bg-eval-capture-batch', async (event, { frames, format }) => {
  if (!bgWindow || bgWindow.isDestroyed()) return [];
  const wc = bgWindow.webContents;
  if (wc.isDestroyed()) return [];
  const results = [];
  for (const frame of frames) {
    if (bgWindow.isDestroyed() || wc.isDestroyed()) break;
    try {
      if (frame.js) await wc.executeJavaScript(frame.js);
      if (frame.waitForPaint) await wc.executeJavaScript(RAF_WAIT);
      if (frame.delay) {
        await wc.executeJavaScript(delayJs(frame.delay));
      }
      const image = await wc.capturePage();
      if (format === 'png') {
        results.push(image.toPNG());
      } else {
        results.push(image.toJPEG(92));
      }
    } catch (e) {
      console.error('[bg-eval-capture-batch] frame error:', e.message);
      break;
    }
  }
  return results;
});

ipcMain.handle('bg-cleanup', () => {
  if (bgWindow) { try { bgWindow.close(); } catch (_) {} bgWindow = null; }
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
      'window._renderSlide(' + JSON.stringify(d) + ');' + RAF_WAIT
    );
    const image = await wc.capturePage();
    frames.push({ data: image.toJPEG(92), duration: d.duration });
  }
  return frames;
});

ipcMain.handle('export-cleanup', () => {
  if (exportWindow) { exportWindow.close(); exportWindow = null; }
});

ipcMain.handle('export-mp4', (e, p) => runFfmpegPipeExport({
  ...p,
  inputCodec: 'mjpeg',
  buildArgs: ({ savePath }) => [
    '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-preset', 'fast', '-crf', '18', '-movflags', '+faststart',
    savePath
  ]
}));

ipcMain.handle('export-mov', (e, p) => runFfmpegPipeExport({
  ...p,
  inputCodec: 'png',
  buildArgs: ({ width, height, savePath }) => [
    '-s', `${width}x${height}`,
    '-c:v', 'prores_ks', '-profile:v', '3',
    '-pix_fmt', 'yuva444p10le', '-vendor', 'ap10',
    savePath
  ]
}));

ipcMain.handle('export-webm', (e, p) => runFfmpegPipeExport({
  ...p,
  inputCodec: 'png',
  buildArgs: ({ savePath }) => [
    '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
    '-auto-alt-ref', '0', '-crf', '18', '-b:v', '0',
    savePath
  ]
}));

ipcMain.handle('bg-capture-png', (e, p) => bgCapture({ js: p.js, delay: p.delay, format: 'png' }));

function execAsync(cmd, opts = {}) {
  return new Promise((resolve) => {
    const proc = spawn('cmd', ['/c', cmd], { timeout: 15000, ...opts });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => stdout += d.toString());
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', (code) => resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() }));
    proc.on('error', (err) => resolve({ code: -1, stdout: '', stderr: err.message }));
  });
}

async function detectSystem() {
  const result = {
    platform: process.platform,
    arch: process.arch,
    python: null,
    pythonVersion: null,
    uv: null,
    uvVersion: null,
    cuda: null,
    cudaVersion: null,
    gpu: null,
    gpuVram: null,
    gpuDriver: null,
    corridorKeyRepo: null,
    corridorKeyModels: null,
    errors: []
  };

  const pyCmd = process.platform === 'win32' ? 'where python' : 'which python3 || which python';
  const pyRes = await execAsync(pyCmd);
  if (pyRes.code === 0 && pyRes.stdout) {
    result.python = pyRes.stdout.split('\n')[0].trim();
    const verRes = await execAsync('python --version 2>&1');
    result.pythonVersion = verRes.stdout || verRes.stderr || null;
  }

  const uvCmd = process.platform === 'win32' ? 'where uv' : 'which uv';
  const uvRes = await execAsync(uvCmd);
  if (uvRes.code === 0 && uvRes.stdout) {
    result.uv = uvRes.stdout.split('\n')[0].trim();
    const uvVerRes = await execAsync('uv --version 2>&1');
    result.uvVersion = uvVerRes.stdout || uvVerRes.stderr || null;
  }

  const nvccRes = await execAsync('nvcc --version 2>&1');
  if (nvccRes.code === 0) {
    result.cuda = true;
    const m = (nvccRes.stdout + nvccRes.stderr).match(/release\s+([\d.]+)/);
    result.cudaVersion = m ? m[1] : 'unknown';
  }

  const nvidiaSmiRes = await execAsync('nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader 2>&1');
  if (nvidiaSmiRes.code === 0 && nvidiaSmiRes.stdout) {
    const parts = nvidiaSmiRes.stdout.split(',').map(s => s.trim());
    result.gpu = parts[0] || null;
    result.gpuVram = parts[1] || null;
    result.gpuDriver = parts[2] || null;
  }

  const homeDir = os.homedir();
  const possiblePaths = [
    path.join(homeDir, 'CorridorKey'),
    path.join(homeDir, 'Projects', 'CorridorKey'),
    path.join(homeDir, 'repos', 'CorridorKey'),
    path.join(homeDir, 'github', 'CorridorKey'),
  ];
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(drive => {
    possiblePaths.push(path.join(drive + ':', 'CorridorKey'));
  });

  for (const p of possiblePaths) {
    if (fs.existsSync(path.join(p, 'clip_manager.py'))) {
      result.corridorKeyRepo = p;
      const ckpts = path.join(p, 'CorridorKeyModule', 'checkpoints');
      if (fs.existsSync(ckpts)) {
        const files = fs.readdirSync(ckpts);
        const modelFiles = files.filter(f => f.endsWith('.safetensors') || f.endsWith('.pth'));
        result.corridorKeyModels = modelFiles.length > 0 ? modelFiles : null;
      }
      break;
    }
  }

  return result;
}

ipcMain.handle('ck-detect-system', async () => {
  return await detectSystem();
});

ipcMain.handle('ck-select-dir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select green screen material folder'
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('ck-select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: 'Select video or image file',
    filters: [
      { name: 'Media', extensions: ['mp4', 'mov', 'avi', 'mkv', 'png', 'jpg', 'jpeg', 'exr', 'tiff', 'tif'] }
    ]
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('ck-select-repo', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select CorridorKey repository folder'
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('ck-run', async (event, { repoPath, action, args }) => {
  const cmd = `uv run python clip_manager.py --action ${action} ${args || ''}`;
  return new Promise((resolve) => {
    const proc = spawn('cmd', ['/c', cmd], {
      cwd: repoPath,
      timeout: 600000,
      env: { ...process.env, OPENCV_IO_ENABLE_OPENEXR: '1' }
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => {
      const text = d.toString();
      stdout += text;
      mainWindow.webContents.send('ck-run-output', { text, type: 'stdout' });
    });
    proc.stderr.on('data', d => {
      const text = d.toString();
      stderr += text;
      mainWindow.webContents.send('ck-run-output', { text, type: 'stderr' });
    });
    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
    proc.on('error', (err) => {
      resolve({ code: -1, stdout, stderr: err.message });
    });
  });
});

ipcMain.handle('ck-run-birefnet', async (event, { repoPath, device, usage }) => {
  const scriptPath = path.join(__dirname, 'scripts', 'birefnet_alpha.py');
  if (!fs.existsSync(scriptPath)) {
    return { code: -1, stdout: '', stderr: `Script not found: ${scriptPath}` };
  }

  const args = ['run', 'python', scriptPath, '--repo-path', repoPath, '--usage', usage || 'General'];
  if (device) args.push('--device', device);

  return new Promise((resolve) => {
    const proc = spawn('uv', args, {
      cwd: repoPath,
      timeout: 600000,
      env: { ...process.env, OPENCV_IO_ENABLE_OPENEXR: '1' }
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => {
      const text = d.toString();
      stdout += text;
      mainWindow.webContents.send('ck-run-output', { text, type: 'stdout' });
    });
    proc.stderr.on('data', d => {
      const text = d.toString();
      stderr += text;
      mainWindow.webContents.send('ck-run-output', { text, type: 'stderr' });
    });
    proc.on('close', (code) => resolve({ code, stdout, stderr }));
    proc.on('error', (err) => resolve({ code: -1, stdout, stderr: err.message }));
  });
});

ipcMain.handle('ck-run-install', async (event, { repoPath }) => {
  const scriptName = process.platform === 'win32'
    ? 'Install_CorridorKey_Windows.bat'
    : 'Install_CorridorKey_Linux_Mac.sh';
  const scriptPath = path.join(repoPath, scriptName);

  if (!fs.existsSync(scriptPath)) {
    return { code: -1, stdout: '', stderr: `Install script not found: ${scriptPath}` };
  }

  return new Promise((resolve) => {
    const proc = spawn('cmd', ['/c', scriptPath], {
      cwd: repoPath,
      timeout: 600000,
      env: { ...process.env }
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => {
      const text = d.toString();
      stdout += text;
      mainWindow.webContents.send('ck-install-output', { text, type: 'stdout' });
    });
    proc.stderr.on('data', d => {
      const text = d.toString();
      stderr += text;
      mainWindow.webContents.send('ck-install-output', { text, type: 'stderr' });
    });
    proc.on('close', (code) => resolve({ code, stdout, stderr }));
    proc.on('error', (err) => resolve({ code: -1, stdout, stderr: err.message }));
  });
});

ipcMain.handle('ck-clone-repo', async (event, { targetDir }) => {
  const destPath = path.join(targetDir, 'CorridorKey');
  if (fs.existsSync(destPath)) {
    return { code: -1, stdout: '', stderr: 'CorridorKey folder already exists in: ' + targetDir };
  }

  return new Promise((resolve) => {
    const proc = spawn('git', ['clone', 'https://github.com/nikopueringer/CorridorKey.git', destPath], {
      timeout: 600000,
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => {
      const text = d.toString();
      stdout += text;
      mainWindow.webContents.send('ck-clone-output', { text, type: 'stdout' });
    });
    proc.stderr.on('data', d => {
      const text = d.toString();
      stderr += text;
      mainWindow.webContents.send('ck-clone-output', { text, type: 'stderr' });
    });
    proc.on('close', (code) => resolve({ code, stdout, stderr, destPath }));
    proc.on('error', (err) => resolve({ code: -1, stdout, stderr: err.message, destPath }));
  });
});

ipcMain.handle('ck-download-model', async (event, { repoPath }) => {
  const ckptDir = path.join(repoPath, 'CorridorKeyModule', 'checkpoints');
  fs.mkdirSync(ckptDir, { recursive: true });

  const scriptPath = path.join(ckptDir, '_download_model.py');
  fs.writeFileSync(scriptPath, [
    'import sys',
    'from huggingface_hub import hf_hub_download',
    'ckpt_dir = sys.argv[1]',
    'result = hf_hub_download("nikopueringer/CorridorKey_v1.0", "CorridorKey_v1.0.safetensors", local_dir=ckpt_dir)',
    'print("OK:", result)',
  ].join('\n'));

  return new Promise((resolve) => {
    const proc = spawn('uv', ['run', 'python', scriptPath, ckptDir], {
      cwd: repoPath,
      timeout: 600000,
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => {
      const text = d.toString();
      stdout += text;
      mainWindow.webContents.send('ck-download-output', { text, type: 'stdout' });
    });
    proc.stderr.on('data', d => {
      const text = d.toString();
      stderr += text;
      mainWindow.webContents.send('ck-download-output', { text, type: 'stderr' });
    });
    proc.on('close', (code) => {
      try { fs.unlinkSync(scriptPath); } catch (_) {}
      resolve({ code, stdout, stderr });
    });
    proc.on('error', (err) => {
      try { fs.unlinkSync(scriptPath); } catch (_) {}
      resolve({ code: -1, stdout, stderr: err.message });
    });
  });
});

ipcMain.handle('ck-check-dir-structure', async (event, dirPath) => {
  if (!dirPath || !fs.existsSync(dirPath)) return null;
  const entries = fs.readdirSync(dirPath);
  const hasInput = entries.includes('Input') || entries.some(e => /\.(mp4|mov|avi|png|jpg|exr)$/i.test(e));
  const hasAlphaHint = entries.includes('AlphaHint');
  const hasVideoMamaMaskHint = entries.includes('VideoMamaMaskHint');
  const subDirs = entries.filter(e => fs.statSync(path.join(dirPath, e)).isDirectory());
  const shotDirs = subDirs.filter(sd => {
    const subEntries = fs.readdirSync(path.join(dirPath, sd));
    return subEntries.includes('Input') || subEntries.includes('AlphaHint');
  });
  return { entries, hasInput, hasAlphaHint, hasVideoMamaMaskHint, subDirs, shotDirs };
});

ipcMain.handle('ck-read-dir', async (event, dirPath) => {
  if (!dirPath || !fs.existsSync(dirPath)) return null;
  return fs.readdirSync(dirPath).map(name => {
    const fullPath = path.join(dirPath, name);
    const stat = fs.statSync(fullPath);
    return { name, path: fullPath, isDir: stat.isDirectory(), size: stat.size };
  });
});

ipcMain.handle('ck-video-info', async (event, { videoPath }) => {
  return new Promise((resolve) => {
    const proc = spawn(ffmpegPath, ['-i', videoPath]);
    let stderr = '';
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', () => {
      const durationMatch = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
      const resMatch = stderr.match(/(\d+)x(\d+)\s/);
      const fpsMatch = stderr.match(/(\d+(?:\.\d+)?)\s*tbr/);
      let durationSec = 0;
      if (durationMatch) {
        durationSec = parseInt(durationMatch[1]) * 3600 + parseInt(durationMatch[2]) * 60 + parseFloat(durationMatch[3]);
      }
      resolve({
        duration: durationMatch ? durationMatch[0].replace('Duration: ', '') : null,
        durationSec,
        width: resMatch ? parseInt(resMatch[1]) : null,
        height: resMatch ? parseInt(resMatch[2]) : null,
        fps: fpsMatch ? parseFloat(fpsMatch[1]) : null,
      });
    });
    proc.on('error', () => resolve(null));
  });
});

ipcMain.handle('ck-extract-frames', async (event, { videoPath, outputDir, fps }) => {
  const inputDir = path.join(outputDir, 'Input');
  fs.mkdirSync(inputDir, { recursive: true });
  const args = ['-i', videoPath, '-qscale:v', '2'];
  if (fps) args.push('-r', String(fps));
  args.push('-y', path.join(inputDir, 'frame_%06d.png'));

  return new Promise((resolve) => {
    const proc = spawn(ffmpegPath, args, { timeout: 600000 });
    let stderr = '';
    proc.stderr.on('data', d => {
      const text = d.toString();
      stderr += text;
      const frameMatch = text.match(/frame=\s*(\d+)/);
      if (frameMatch) {
        mainWindow.webContents.send('ck-extract-progress', { frame: parseInt(frameMatch[1]) });
      }
    });
    proc.on('close', (code) => resolve({ code, outputDir, stderr }));
    proc.on('error', (err) => resolve({ code: -1, outputDir, stderr: err.message }));
  });
});

ipcMain.handle('ck-assemble-video', async (event, { framesDir, savePath, fps }) => {
  return new Promise((resolve) => {
    const fs = require('fs');
    const files = fs.readdirSync(framesDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f)).sort();
    if (files.length === 0) { resolve({ code: -1, stderr: 'No image files found' }); return; }

    const firstStem = files[0].replace(/\.[^.]+$/, '');
    let inputPattern;
    if (/^\d+$/.test(firstStem) && files.every(f => /^\d+\.\w+$/.test(f))) {
      inputPattern = `%0${firstStem.length}d${path.extname(files[0])}`;
    } else {
      const listPath = path.join(framesDir, '_ffmpeg_concat.txt');
      fs.writeFileSync(listPath, files.map(f => `file '${path.join(framesDir, f).replace(/'/g, "'\\''")}'`).join('\n'));
      inputPattern = null;
      const args = [
        '-y', '-f', 'concat', '-safe', '0', '-i', listPath,
        '-framerate', String(fps || 24),
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
        '-preset', 'fast', '-crf', '18', '-movflags', '+faststart',
        savePath
      ];
      const proc = spawn(ffmpegPath, args, { timeout: 600000 });
      let stderr = '';
      proc.stderr.on('data', d => stderr += d.toString());
      proc.on('close', (code) => {
        try { fs.unlinkSync(listPath); } catch {}
        resolve({ code, savePath, stderr });
      });
      proc.on('error', (err) => { try { fs.unlinkSync(listPath); } catch {}; resolve({ code: -1, savePath, stderr: err.message }); });
      return;
    }

    const args = [
      '-y', '-framerate', String(fps || 24),
      '-start_number', String(parseInt(firstStem, 10)),
      '-i', path.join(framesDir, inputPattern),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-preset', 'fast', '-crf', '18', '-movflags', '+faststart',
      savePath
    ];
    const proc = spawn(ffmpegPath, args, { timeout: 600000 });
    let stderr = '';
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', (code) => resolve({ code, savePath, stderr }));
    proc.on('error', (err) => resolve({ code: -1, savePath, stderr: err.message }));
  });
});

ipcMain.handle('get-env', (e, key) => process.env[key] || '');

ipcMain.handle('write-file-utf8', async (event, { path: savePath, content }) => {
  fs.writeFileSync(savePath, content, 'utf-8');
  return savePath;
});

ipcMain.handle('subtitles-select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: 'Select audio or video file',
    filters: [
      { name: 'Media', extensions: ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'mp4', 'mov', 'avi', 'mkv', 'webm'] }
    ]
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('subtitles-extract-audio', async (event, { mediaPath }) => {
  const tmpDir = path.join(os.tmpdir(), 'vt-sub-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });
  const audioPath = path.join(tmpDir, 'audio.wav');

  return new Promise((resolve) => {
    const proc = spawn(ffmpegPath, [
      '-i', mediaPath,
      '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1',
      '-y', audioPath
    ], { timeout: 300000 });

    let stderr = '';
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', (code) => {
      if (code === 0) resolve({ audioPath });
      else resolve({ error: 'ffmpeg error: ' + stderr.substring(stderr.length - 300) });
    });
    proc.on('error', (err) => resolve({ error: err.message }));
  });
});

ipcMain.handle('subtitles-whisper-local', async (event, { audioPath, model }) => {
  const scriptPath = path.join(__dirname, 'scripts', 'whisper_transcribe.py');
  if (!fs.existsSync(scriptPath)) {
    return { error: 'Script not found: ' + scriptPath };
  }

  return new Promise((resolve) => {
    const proc = spawn('uv', ['run', 'python', scriptPath, '--audio', audioPath, '--model', model || 'base'], {
      timeout: 600000,
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => {
      const text = d.toString();
      stdout += text;
      mainWindow.webContents.send('subtitles-whisper-progress', { text, type: 'stdout' });
    });
    proc.stderr.on('data', d => {
      const text = d.toString();
      stderr += text;
      mainWindow.webContents.send('subtitles-whisper-progress', { text, type: 'stderr' });
    });
    proc.on('close', (code) => {
      if (code !== 0) {
        resolve({ error: 'Exit code ' + code + ': ' + stderr.substring(stderr.length - 300) });
        return;
      }
      try {
        const result = JSON.parse(stdout.trim().split('\n').pop());
        resolve(result);
      } catch (e) {
        resolve({ error: 'Parse error: ' + stdout.substring(stdout.length - 300) });
      }
    });
    proc.on('error', (err) => resolve({ error: err.message }));
  });
});

function groqTranscribeChunk(chunkPath, apiKey, timeOffset) {
  const https = require('https');
  const boundary = '----WhisperBoundary' + Date.now();
  const fileName = path.basename(chunkPath);
  const fileBuffer = fs.readFileSync(chunkPath);

  function fieldPart(name, value) {
    return Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"\r\n\r\n' + value + '\r\n');
  }

  const parts = [
    fieldPart('model', 'whisper-large-v3-turbo'),
    fieldPart('response_format', 'verbose_json'),
    fieldPart('timestamp_granularities[]', 'word'),
    Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="file"; filename="' + fileName + '"\r\nContent-Type: application/octet-stream\r\n\r\n'),
    fileBuffer,
    Buffer.from('\r\n--' + boundary + '--\r\n')
  ];
  const body = Buffer.concat(parts);

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.groq.com',
      path: '/openai/v1/audio/transcriptions',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': body.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            resolve({ error: typeof json.error === 'string' ? json.error : json.error.message || JSON.stringify(json.error) });
            return;
          }
          const words = [];
          if (json.words && json.words.length > 0) {
            for (const w of json.words) {
              const trimmed = (w.word || '').trim();
              if (!trimmed) continue;
              words.push({
                word: trimmed,
                start: Math.round((w.start || 0) * 1000) / 1000 + timeOffset,
                end: Math.round((w.end || 0) * 1000) / 1000 + timeOffset
              });
            }
          } else if (json.segments) {
            for (const seg of json.segments) {
              if (seg.words) {
                for (const w of seg.words) {
                  const trimmed = (w.word || '').trim();
                  if (!trimmed) continue;
                  words.push({
                    word: trimmed,
                    start: Math.round((w.start || 0) * 1000) / 1000 + timeOffset,
                    end: Math.round((w.end || 0) * 1000) / 1000 + timeOffset
                  });
                }
              }
            }
          }
          resolve({ words, error: null });
        } catch (e) {
          resolve({ error: 'Parse error: ' + data.substring(0, 300) });
        }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(body);
    req.end();
  });
}

function getAudioDuration(audioPath) {
  return new Promise((resolve) => {
    const proc = spawn(ffmpegPath, ['-i', audioPath]);
    let stderr = '';
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', () => {
      const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
      if (m) {
        resolve(parseFloat(m[1]) * 3600 + parseFloat(m[2]) * 60 + parseFloat(m[3]));
      } else {
        resolve(0);
      }
    });
    proc.on('error', () => resolve(0));
  });
}

ipcMain.handle('subtitles-whisper-groq', async (event, { audioPath, apiKey }) => {
  const MAX_BYTES = 20 * 1024 * 1024;
  const CHUNK_SEC = 300;

  const stat = fs.statSync(audioPath);
  const duration = await getAudioDuration(audioPath);

  if (stat.size <= MAX_BYTES) {
    const result = await groqTranscribeChunk(audioPath, apiKey, 0);
    if (result.error) return result;
    const dur = result.words.length > 0 ? result.words[result.words.length - 1].end : duration;
    return { words: result.words, duration: dur, text: '' };
  }

  mainWindow.webContents.send('subtitles-whisper-progress', { text: 'File too large (' + Math.round(stat.size / 1024 / 1024) + 'MB), splitting into chunks...\n', type: 'stdout' });

  const tmpDir = path.join(os.tmpdir(), 'vt-sub-chunks-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const numChunks = Math.ceil(duration / CHUNK_SEC);
  const chunks = [];

  for (let i = 0; i < numChunks; i++) {
    const startTime = i * CHUNK_SEC;
    const chunkPath = path.join(tmpDir, 'chunk_' + String(i).padStart(3, '0') + '.mp3');

    mainWindow.webContents.send('subtitles-whisper-progress', { text: 'Creating chunk ' + (i + 1) + '/' + numChunks + ' (' + formatTime(startTime) + ')\n', type: 'stdout' });

    await new Promise((res, rej) => {
      const args = ['-y', '-i', audioPath, '-ss', String(startTime), '-t', String(CHUNK_SEC), '-acodec', 'libmp3lame', '-ar', '16000', '-ac', '1', '-b:a', '64k', chunkPath];
      const proc = spawn(ffmpegPath, args, { timeout: 120000 });
      let stderr = '';
      proc.stderr.on('data', d => stderr += d.toString());
      proc.on('close', (code) => {
        if (code === 0) res();
        else rej(new Error('ffmpeg chunk error: ' + stderr.substring(-200)));
      });
      proc.on('error', rej);
    });

    chunks.push({ path: chunkPath, offset: startTime });
  }

  const allWords = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    mainWindow.webContents.send('subtitles-whisper-progress', { text: 'Transcribing chunk ' + (i + 1) + '/' + chunks.length + '...\n', type: 'stdout' });

    const result = await groqTranscribeChunk(chunk.path, apiKey, chunk.offset);
    if (result.error) {
      for (const c of chunks) { try { fs.unlinkSync(c.path); } catch (_) {} }
      try { fs.rmdirSync(tmpDir); } catch (_) {}
      return { error: 'Chunk ' + (i + 1) + ' error: ' + result.error };
    }

    if (result.words && result.words.length > 0) {
      for (const w of result.words) allWords.push(w);
    }

    try { fs.unlinkSync(chunk.path); } catch (_) {}
  }

  try { fs.rmdirSync(tmpDir); } catch (_) {}

  const finalDur = allWords.length > 0 ? allWords[allWords.length - 1].end : duration;
  return { words: allWords, duration: finalDur, text: '' };
});

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

let webcapWindow = null;

ipcMain.handle('webcap-load-url', async (event, { url, viewportWidth, viewportHeight, fullPage, scaleFactor }) => {
  if (webcapWindow) { try { webcapWindow.close(); } catch (_) {} webcapWindow = null; }

  const vw = Math.max(320, Math.min(7680, viewportWidth || 1920));
  const vh = Math.max(400, Math.min(8000, viewportHeight || 900));
  const sf = Math.max(1, Math.min(4, scaleFactor || 1));

  webcapWindow = new BrowserWindow({
    width: vw,
    height: vh,
    show: false,
    webPreferences: { offscreen: true }
  });

  if (sf > 1) {
    webcapWindow.webContents.enableDeviceEmulation({
      deviceScaleFactor: sf,
      screenPosition: 'desktop'
    });
  }

  try {
    await webcapWindow.loadURL(url);
  } catch (e) {
    try { webcapWindow.close(); } catch (_) {}
    webcapWindow = null;
    return { error: e.message };
  }

  await webcapWindow.webContents.executeJavaScript('document.fonts.ready');
  await webcapWindow.webContents.executeJavaScript('new Promise(function(r){setTimeout(r,1000)})');

  if (fullPage) {
    const dimsJson = await webcapWindow.webContents.executeJavaScript(
      'JSON.stringify({w:Math.max(document.documentElement.scrollWidth,document.body?document.body.scrollWidth:0,' + vw + '),h:Math.max(document.documentElement.scrollHeight,document.body?document.body.scrollHeight:0,' + vh + ')})'
    );
    const dims = JSON.parse(dimsJson);
    const fpW = Math.min(dims.w, 7680);
    const fpH = Math.min(dims.h, 32768);
    webcapWindow.setSize(fpW, fpH);
    await webcapWindow.webContents.executeJavaScript('new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})})');
    await webcapWindow.webContents.executeJavaScript('new Promise(function(r){setTimeout(r,500)})');
  }

  const image = await webcapWindow.capturePage();
  const imgSize = image.getSize();
  const screenshot = image.toPNG().toString('base64');

  try { webcapWindow.close(); } catch (_) {}
  webcapWindow = null;

  return { screenshot, width: imgSize.width, height: imgSize.height };
});

ipcMain.handle('webcap-cleanup', () => {
  if (webcapWindow) { try { webcapWindow.close(); } catch (_) {} webcapWindow = null; }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
