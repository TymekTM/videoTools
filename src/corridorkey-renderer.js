const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const CK = {
  sysInfo: null,
  repoPath: '',
  inputPath: '',
  videoPath: '',
  videoInfo: null,
  shotDir: '',
  running: false,

  els: {},

  init() {
    this.els = {
      statusBadge: document.getElementById('ckStatusBadge'),
      licenseToggle: document.getElementById('ckLicenseToggle'),
      licenseFull: document.getElementById('ckLicenseFull'),
      scanBtn: document.getElementById('ckScanBtn'),
      cloneRepo: document.getElementById('ckCloneRepo'),
      cloneProgress: document.getElementById('ckCloneProgress'),
      cloneProgressBar: document.getElementById('ckCloneProgressBar'),
      cloneProgressLabel: document.getElementById('ckCloneProgressLabel'),
      downloadModel: document.getElementById('ckDownloadModel'),
      repoPath: document.getElementById('ckRepoPath'),
      browseRepo: document.getElementById('ckBrowseRepo'),
      installDeps: document.getElementById('ckInstallDeps'),
      setupNote: document.getElementById('ckSetupNote'),
      inputPath: document.getElementById('ckInputPath'),
      browseInput: document.getElementById('ckBrowseInput'),
      browseInputVideo: document.getElementById('ckBrowseInputVideo'),
      videoSection: document.getElementById('ckVideoSection'),
      videoInfo: document.getElementById('ckVideoInfo'),
      extractFrames: document.getElementById('ckExtractFrames'),
      videoProgress: document.getElementById('ckVideoProgress'),
      videoProgressBar: document.getElementById('ckVideoProgressBar'),
      videoProgressLabel: document.getElementById('ckVideoProgressLabel'),
      organizeInput: document.getElementById('ckOrganizeInput'),
      inputInfo: document.getElementById('ckInputInfo'),
      generateAlphasBiRefNet: document.getElementById('ckGenerateAlphasBiRefNet'),
      generateAlphasGVM: document.getElementById('ckGenerateAlphasGVM'),
      alphaInfo: document.getElementById('ckAlphaInfo'),
      deviceGroup: document.getElementById('ckDeviceGroup'),
      runInference: document.getElementById('ckRunInference'),
      progress: document.getElementById('ckProgress'),
      progressBar: document.getElementById('ckProgressBar'),
      progressLabel: document.getElementById('ckProgressLabel'),
      logBody: document.getElementById('ckLogBody'),
      logClear: document.getElementById('ckLogClear'),
      outputSection: document.getElementById('ckOutputSection'),
      outputGrid: document.getElementById('ckOutputGrid'),
      assembleVideo: document.getElementById('ckAssembleVideo'),
      wsProgress: document.getElementById('ckWsProgress'),
      wsProgressFill: document.getElementById('ckWsProgressFill'),
      wsProgressLabel: document.getElementById('ckWsProgressLabel'),
    };

    this.bindEvents();
    this.initWorkspace();
    this.scanSystem();
  },

  initWorkspace() {
    const tabs = document.querySelectorAll('.ck-ws-tab');
    const panels = document.querySelectorAll('.ck-ws-panel');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.style.display = 'none');
        tab.classList.add('active');
        const panel = document.querySelector(`[data-ws-panel="${tab.dataset.wsTab}"]`);
        if (panel) panel.style.display = '';
      });
    });
  },

  switchTab(name) {
    const tab = document.querySelector(`.ck-ws-tab[data-ws-tab="${name}"]`);
    if (tab) tab.click();
  },

  bindEvents() {
    this.els.licenseToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const el = this.els.licenseFull;
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    });

    this.els.scanBtn.addEventListener('click', () => this.scanSystem());
    this.els.cloneRepo.addEventListener('click', () => this.cloneRepo());
    this.els.downloadModel.addEventListener('click', () => this.downloadModel());

    this.els.browseRepo.addEventListener('click', async () => {
      const p = await ipcRenderer.invoke('ck-select-repo');
      if (p) {
        this.els.repoPath.value = p;
        this.repoPath = p;
        this.validateRepo();
      }
    });

    this.els.installDeps.addEventListener('click', () => this.installDeps());

    this.els.browseInput.addEventListener('click', async () => {
      const p = await ipcRenderer.invoke('ck-select-dir');
      if (p) {
        this.videoPath = '';
        this.videoInfo = null;
        this.els.videoSection.style.display = 'none';
        this.els.inputPath.value = p;
        this.inputPath = p;
        this.els.organizeInput.disabled = !this.repoPath;
        this.loadInputThumbnails();
      }
    });

    this.els.browseInputVideo.addEventListener('click', async () => {
      const p = await ipcRenderer.invoke('ck-select-file');
      if (p) {
        this.els.inputPath.value = p;
        this.inputPath = p;
        this.videoPath = p;
        this.loadVideoInfo(p);
      }
    });

    this.els.extractFrames.addEventListener('click', () => this.extractFrames());
    this.els.organizeInput.addEventListener('click', () => this.organizeInput());

    this.els.generateAlphasBiRefNet.addEventListener('click', () => this.generateAlphas('birefnet'));
    this.els.generateAlphasGVM.addEventListener('click', () => this.generateAlphas('gvm'));

    this.bindBtnGroup(this.els.deviceGroup);
    this.els.runInference.addEventListener('click', () => this.runInference());
    this.els.assembleVideo.addEventListener('click', () => this.assembleVideo());
    this.els.logClear.addEventListener('click', () => { this.els.logBody.innerHTML = ''; });

    ipcRenderer.on('ck-run-output', (_e, d) => this.appendLog(d.text, d.type));
    ipcRenderer.on('ck-install-output', (_e, d) => this.appendLog(d.text, d.type));
    ipcRenderer.on('ck-clone-output', (_e, d) => this.appendLog(d.text, d.type));
    ipcRenderer.on('ck-download-output', (_e, d) => this.appendLog(d.text, d.type));
    ipcRenderer.on('ck-extract-progress', (_e, d) => {
      this.els.videoProgressLabel.textContent = `Ekstrahowano ${d.frame} klatek...`;
    });
  },

  bindBtnGroup(container) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.control-btn');
      if (!btn) return;
      container.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  },

  getActiveBtnValue(container) {
    const active = container.querySelector('.control-btn.active');
    return active ? Object.values(active.dataset)[0] : null;
  },

  getRepoModels() {
    if (!this.repoPath) return null;
    const ckptDir = path.join(this.repoPath, 'CorridorKeyModule', 'checkpoints');
    if (!fs.existsSync(ckptDir)) return null;
    const files = fs.readdirSync(ckptDir).filter(f => f.endsWith('.safetensors') || f.endsWith('.pth'));
    return files.length > 0 ? files : null;
  },

  setStepState(stepId, state) {
    const el = document.getElementById(stepId);
    if (!el) return;
    el.classList.remove('ck-step-active', 'ck-step-done');
    if (state) el.classList.add('ck-step-' + state);
  },

  async scanSystem() {
    this.setStatus('scanning', '...');
    try {
      const info = await ipcRenderer.invoke('ck-detect-system');
      this.sysInfo = info;

      if (info.corridorKeyRepo) {
        this.els.repoPath.value = info.corridorKeyRepo;
        this.repoPath = info.corridorKeyRepo;
        this.validateRepo();
      }

      this.updateSteps();
    } catch (err) {
      this.setStatus('error', 'Blad skanowania');
    }
  },

  async validateRepo() {
    const p = this.repoPath;
    if (!p) return;
    const hasClipMgr = fs.existsSync(path.join(p, 'clip_manager.py'));
    if (!hasClipMgr) {
      this.showNote(this.els.setupNote, 'Brak clip_manager.py - to nie jest repo CorridorKey.', 'error');
      return;
    }
    const hasUvLock = fs.existsSync(path.join(p, 'uv.lock'));
    const ckptDir = path.join(p, 'CorridorKeyModule', 'checkpoints');
    const hasModel = fs.existsSync(ckptDir) && fs.readdirSync(ckptDir).some(f => f.endsWith('.safetensors') || f.endsWith('.pth'));

    let msg = 'Repozytorium wykryte.';
    if (!hasUvLock) msg += ' Wymaga instalacji zaleznosci.';
    if (!hasModel) msg += ' Model nie pobrany (~300MB).';
    this.showNote(this.els.setupNote, msg, hasUvLock && hasModel ? 'ok' : 'warn');
    this.els.installDeps.disabled = false;
    this.els.downloadModel.disabled = hasModel;
    this.updateSteps();
  },

  updateSteps() {
    const repoValid = !!this.repoPath && fs.existsSync(path.join(this.repoPath, 'clip_manager.py'));
    const hasModel = this.repoPath && this.getRepoModels();
    const setupDone = repoValid && hasModel;

    this.setStepState('ckStepSetup', setupDone ? 'done' : 'active');

    this.els.organizeInput.disabled = !this.inputPath || !this.repoPath;

    const inputReady = !!this.shotDir && fs.existsSync(this.shotDir);
    this.setStepState('ckStepInput', inputReady ? 'done' : (this.inputPath ? 'active' : ''));

    const hasAlpha = inputReady && fs.existsSync(path.join(this.shotDir, 'AlphaHint')) &&
      fs.readdirSync(path.join(this.shotDir, 'AlphaHint')).some(f => /\.(png|jpg|jpeg|exr)$/i.test(f));
    this.setStepState('ckStepAlpha', hasAlpha ? 'done' : (inputReady ? 'active' : ''));

    this.els.generateAlphasBiRefNet.disabled = !inputReady || this.running;
    this.els.generateAlphasGVM.disabled = !inputReady || this.running;
    this.els.runInference.disabled = !inputReady || !this.repoPath || this.running;

    if (hasAlpha) {
      this.setStepState('ckStepProcess', 'active');
    } else {
      this.setStepState('ckStepProcess', '');
    }

    if (setupDone && inputReady) this.setStatus('ready', 'Gotowy');
    else if (setupDone) this.setStatus('warning', 'Wybierz input');
    else this.setStatus('error', 'Setup wymagany');
  },

  setStatus(type, text) {
    const b = this.els.statusBadge;
    b.className = 'ck-badge ck-badge-' + type;
    b.textContent = text;
  },

  showNote(el, msg, type) {
    el.style.display = 'block';
    el.className = (el.id.includes('setup') ? 'ck-setup-note' : 'ck-input-info') + ' ck-note-' + type;
    el.textContent = msg;
  },

  showWsProgress(text) {
    this.els.wsProgress.style.display = 'flex';
    this.els.wsProgressFill.style.animation = 'ck-indeterminate 1.5s infinite';
    this.els.wsProgressLabel.textContent = text;
  },

  hideWsProgress() {
    this.els.wsProgress.style.display = 'none';
    this.els.wsProgressFill.style.animation = '';
  },

  showSidebarProgress(text) {
    this.els.progress.style.display = 'flex';
    this.els.progressBar.style.width = '100%';
    this.els.progressBar.style.animation = 'ck-indeterminate 1.5s infinite';
    this.els.progressLabel.textContent = text;
  },

  hideSidebarProgress() {
    this.els.progress.style.display = 'none';
    this.els.progressBar.style.animation = '';
  },

  appendLog(text, type) {
    if (/^\s*$/.test(text)) return;
    if (/Materializing param=|Loading weights:|Fetching \d+ files/i.test(text)) return;
    if (type === 'stderr' && /UserWarning|warnings\.warn/i.test(text)) return;
    this.switchTab('log');
    const line = document.createElement('div');
    line.className = 'ck-log-line ck-log-' + (type === 'stderr' ? 'err' : 'out');
    line.textContent = text.replace(/\r/g, '');
    this.els.logBody.appendChild(line);
    this.els.logBody.scrollTop = this.els.logBody.scrollHeight;
  },

  getImageFiles(dirPath) {
    try {
      return fs.readdirSync(dirPath).filter(f => /\.(png|jpg|jpeg|bmp)$/i.test(f)).sort();
    } catch { return []; }
  },

  pickSamples(files, count) {
    if (files.length <= count) return files;
    const step = files.length / count;
    const result = [];
    for (let i = 0; i < count; i++) result.push(files[Math.floor(i * step)]);
    if (result[result.length - 1] !== files[files.length - 1]) result.push(files[files.length - 1]);
    return result;
  },

  getActualInputDir() {
    if (!this.inputPath) return null;
    const inputSub = path.join(this.inputPath, 'Input');
    if (fs.existsSync(inputSub)) return inputSub;
    try {
      const entries = fs.readdirSync(this.inputPath);
      if (entries.some(f => /\.(png|jpg|jpeg|bmp|exr|tiff|tif)$/i.test(f))) return this.inputPath;
      for (const d of entries) {
        const subInput = path.join(this.inputPath, d, 'Input');
        if (fs.existsSync(subInput)) return subInput;
      }
    } catch {}
    return null;
  },

  loadInputThumbnails() {
    const dirPath = this.getActualInputDir();
    const idle = document.getElementById('ckWsIdle');
    const content = document.getElementById('ckWsInputContent');
    const infoBar = document.getElementById('ckInputInfoBar');
    const grid = document.getElementById('ckInputGrid');

    if (!dirPath) {
      idle.style.display = '';
      content.style.display = 'none';
      return;
    }
    const files = this.getImageFiles(dirPath);
    if (files.length === 0) { idle.style.display = ''; content.style.display = 'none'; return; }

    idle.style.display = 'none';
    content.style.display = '';
    infoBar.textContent = `${files.length} klatek | ${path.basename(dirPath)}`;
    grid.innerHTML = '';
    for (const f of this.pickSamples(files, 8)) {
      const url = 'file:///' + path.join(dirPath, f).replace(/\\/g, '/');
      const el = document.createElement('div');
      el.className = 'ck-ws-thumb';
      el.innerHTML = `<img src="${url}" loading="lazy"/><span>${f}</span>`;
      el.addEventListener('click', () => require('child_process').exec(`explorer "${dirPath}"`));
      grid.appendChild(el);
    }
    this.switchTab('input');
  },

  loadOutputThumbnails() {
    const compDir = this.findOutputDir('Comp');
    if (!compDir) return;
    const files = this.getImageFiles(compDir);
    if (files.length === 0) return;

    document.getElementById('ckOutputEmpty').style.display = 'none';
    const content = document.getElementById('ckWsOutputContent');
    content.style.display = '';
    document.getElementById('ckOutputInfoBar').textContent = `Comp | ${files.length} klatek`;

    const grid = document.getElementById('ckOutputGrid');
    grid.innerHTML = '';
    for (const f of this.pickSamples(files, 8)) {
      const url = 'file:///' + path.join(compDir, f).replace(/\\/g, '/');
      const el = document.createElement('div');
      el.className = 'ck-ws-thumb';
      el.innerHTML = `<img src="${url}" loading="lazy"/><span>${f}</span>`;
      el.addEventListener('click', () => require('child_process').exec(`explorer "${compDir}"`));
      grid.appendChild(el);
    }
    this.switchTab('output');
  },

  findOutputDir(name) {
    if (!this.shotDir) return null;
    const d = path.join(this.shotDir, 'Output', name);
    if (fs.existsSync(d)) return d;
    return null;
  },

  async loadVideoInfo(videoPath) {
    const info = await ipcRenderer.invoke('ck-video-info', { videoPath });
    if (!info) { this.els.videoSection.style.display = 'none'; return; }
    this.videoInfo = info;
    const approxFrames = info.durationSec && info.fps ? Math.round(info.durationSec * info.fps) : '?';
    this.els.videoInfo.textContent = `${info.width || '?'}x${info.height || '?'} | ${info.duration || '?'} | ${info.fps || '?'} fps | ~${approxFrames} klatek`;
    this.els.videoSection.style.display = 'flex';
    this.els.extractFrames.disabled = false;
    this.els.organizeInput.disabled = !this.repoPath;

    document.getElementById('ckWsIdle').style.display = 'none';
    document.getElementById('ckWsInputContent').style.display = '';
    document.getElementById('ckInputInfoBar').textContent = `Wideo: ${path.basename(videoPath)}`;
    document.getElementById('ckInputGrid').innerHTML = '';
    this.switchTab('input');
  },

  async extractFrames() {
    if (!this.videoPath || this.running) return;
    this.running = true;
    this.els.extractFrames.disabled = true;
    this.els.videoProgress.style.display = 'block';
    this.els.videoProgressBar.style.width = '100%';
    this.els.videoProgressBar.style.animation = 'ck-indeterminate 1.5s infinite';
    this.els.videoProgressLabel.textContent = 'Ekstrakcja klatek...';
    this.showWsProgress('Ekstrakcja klatek...');

    const videoName = path.basename(this.videoPath, path.extname(this.videoPath));
    const outputDir = path.join(path.dirname(this.videoPath), videoName + '_frames');

    try {
      const result = await ipcRenderer.invoke('ck-extract-frames', {
        videoPath: this.videoPath, outputDir, fps: this.videoInfo ? this.videoInfo.fps : null,
      });
      if (result.code === 0 || fs.existsSync(path.join(outputDir, 'Input'))) {
        this.inputPath = outputDir;
        this.els.inputPath.value = outputDir;
        this.els.videoSection.style.display = 'none';
        this.loadInputThumbnails();
        this.els.organizeInput.disabled = !this.repoPath;
      } else {
        this.appendLog('BLAD: ' + (result.stderr || '').slice(0, 200), 'stderr');
        this.els.extractFrames.disabled = false;
      }
    } catch (err) {
      this.appendLog('Blad: ' + err.message, 'stderr');
      this.els.extractFrames.disabled = false;
    } finally {
      this.running = false;
      this.els.videoProgressBar.style.animation = '';
      this.els.videoProgress.style.display = 'none';
      this.hideWsProgress();
      this.updateSteps();
    }
  },

  organizeInput() {
    if (!this.inputPath) { this.showNote(this.els.inputInfo, 'Wybierz materiał wejściowy.', 'err'); return; }
    if (!this.repoPath) { this.showNote(this.els.inputInfo, 'Najpierw ustaw repo CorridorKey (Krok 1).', 'err'); return; }

    try {
      const clipsDir = path.join(this.repoPath, 'ClipsForInference');
      fs.mkdirSync(clipsDir, { recursive: true });

      const stat = fs.statSync(this.inputPath);
      let shotName, shotDir;

      if (stat.isDirectory()) {
        const hasInputSub = fs.existsSync(path.join(this.inputPath, 'Input'));
        shotName = path.basename(this.inputPath).replace(/[^a-zA-Z0-9_\-.]/g, '_');
        shotDir = path.join(clipsDir, shotName);

        if (fs.existsSync(shotDir)) {
          try {
            if (fs.lstatSync(shotDir).isSymbolicLink()) fs.unlinkSync(shotDir);
            else fs.rmSync(shotDir, { recursive: true, force: true });
          } catch {}
        }

        if (hasInputSub) {
          fs.symlinkSync(this.inputPath, shotDir, 'junction');
        } else {
          fs.mkdirSync(shotDir, { recursive: true });
          fs.symlinkSync(this.inputPath, path.join(shotDir, 'Input'), 'junction');
          if (!fs.existsSync(path.join(shotDir, 'AlphaHint'))) {
            fs.mkdirSync(path.join(shotDir, 'AlphaHint'), { recursive: true });
          }
        }
      } else {
        shotName = path.basename(this.inputPath, path.extname(this.inputPath)).replace(/[^a-zA-Z0-9_\-.]/g, '_');
        shotDir = path.join(clipsDir, shotName);
        if (fs.existsSync(shotDir)) { try { fs.rmSync(shotDir, { recursive: true, force: true }); } catch {} }
        fs.mkdirSync(shotDir, { recursive: true });
        fs.copyFileSync(this.inputPath, path.join(shotDir, `Input${path.extname(this.inputPath)}`));
        if (!fs.existsSync(path.join(shotDir, 'AlphaHint'))) {
          fs.mkdirSync(path.join(shotDir, 'AlphaHint'), { recursive: true });
        }
      }

      this.shotDir = shotDir;
      this.showNote(this.els.inputInfo, `Przygotowano: ${shotName} → ClipsForInference/${shotName}`, 'ok');
    } catch (err) {
      this.appendLog('Blad organizacji: ' + err.message, 'stderr');
      this.showNote(this.els.inputInfo, 'Blad: ' + err.message, 'err');
    }
    this.updateSteps();
  },

  async generateAlphas(method) {
    if (!this.repoPath || this.running) {
      if (!this.repoPath) this.appendLog('Brak repo — ustaw CorridorKey (Krok 1).', 'stderr');
      return;
    }
    this.running = true;
    this.updateSteps();
    this.showWsProgress(`Generowanie Alpha (${method})...`);
    this.showSidebarProgress(`Generowanie Alpha (${method})...`);
    this.setStatus('scanning', 'Alpha...');
    this.appendLog(`Generowanie Alpha (${method})...`, 'stdout');

    const device = this.getActiveBtnValue(this.els.deviceGroup) || 'auto';
    try {
      let result;
      if (method === 'birefnet') {
        result = await ipcRenderer.invoke('ck-run-birefnet', {
          repoPath: this.repoPath,
          device,
          usage: 'General',
        });
      } else {
        const weightsDir = path.join(this.repoPath, 'gvm_core', 'weights');
        if (!fs.existsSync(path.join(weightsDir, 'vae', 'config.json'))) {
          this.appendLog('Brak wag GVM — pobierz wagi do gvm_core/weights/{vae,scheduler,unet}/', 'stderr');
          this.showNote(this.els.alphaInfo, 'Brak wag GVM. Sprawdz instrukcje.', 'err');
          this.running = false;
          this.hideWsProgress();
          this.hideSidebarProgress();
          this.updateSteps();
          return;
        }
        result = await ipcRenderer.invoke('ck-run', {
          repoPath: this.repoPath,
          action: 'generate_alphas',
          args: `--device ${device}`,
        });
      }

      const hasError = result.stderr && /ERROR/i.test(result.stderr);
      if (result.code === 0 && !hasError) {
        this.setStatus('ready', 'Alpha gotowe');
        if (this.els.alphaInfo) this.showNote(this.els.alphaInfo, 'Alpha wygenerowane.', 'ok');
        this.appendLog('Alpha wygenerowane pomyslnie.', 'stdout');
      } else {
        this.setStatus('error', 'Blad');
        const errMsg = hasError
          ? result.stderr.split('\n').filter(l => /ERROR/i.test(l)).join('\n')
          : result.stderr;
        this.appendLog('BLAD: ' + errMsg, 'stderr');
        if (this.els.alphaInfo) this.showNote(this.els.alphaInfo, 'Blad generowania Alpha.', 'err');
      }
    } catch (err) {
      this.setStatus('error', 'Blad');
      this.appendLog('Blad: ' + err.message, 'stderr');
    } finally {
      this.running = false;
      this.hideWsProgress();
      this.hideSidebarProgress();
      this.updateSteps();
    }
  },

  async cloneRepo() {
    if (this.running) return;
    const targetDir = await ipcRenderer.invoke('ck-select-dir');
    if (!targetDir) return;
    this.running = true;
    this.els.cloneProgress.style.display = 'block';
    this.els.cloneProgressBar.style.width = '100%';
    this.els.cloneProgressBar.style.animation = 'ck-indeterminate 1.5s infinite';
    this.els.cloneProgressLabel.textContent = 'Klonowanie...';
    this.showWsProgress('Klonowanie repozytorium...');
    try {
      const result = await ipcRenderer.invoke('ck-clone-repo', { targetDir });
      if (result.code === 0) {
        this.els.repoPath.value = result.destPath;
        this.repoPath = result.destPath;
        this.showNote(this.els.setupNote, 'Sklonowano. Zainstaluj deps.', 'ok');
        this.validateRepo();
      } else {
        this.appendLog('BLAD: ' + (result.stderr || ''), 'stderr');
      }
    } catch (err) { this.appendLog('Blad: ' + err.message, 'stderr'); }
    finally {
      this.running = false;
      this.els.cloneProgressBar.style.animation = '';
      this.els.cloneProgress.style.display = 'none';
      this.hideWsProgress();
      this.updateSteps();
    }
  },

  async downloadModel() {
    if (!this.repoPath || this.running) return;
    this.running = true;
    this.els.downloadModel.disabled = true;
    this.showWsProgress('Pobieranie modelu (~300MB)...');
    try {
      const result = await ipcRenderer.invoke('ck-download-model', { repoPath: this.repoPath });
      if (result.code === 0) {
        this.showNote(this.els.setupNote, 'Model pobrany.', 'ok');
        this.scanSystem();
      } else {
        this.appendLog('BLAD: ' + (result.stderr || ''), 'stderr');
        this.els.downloadModel.disabled = false;
      }
    } catch (err) { this.appendLog('Blad: ' + err.message, 'stderr'); this.els.downloadModel.disabled = false; }
    finally { this.running = false; this.hideWsProgress(); this.updateSteps(); }
  },

  async installDeps() {
    if (!this.repoPath || this.running) return;
    this.running = true;
    this.showWsProgress('Instalacja zaleznosci...');
    try {
      const result = await ipcRenderer.invoke('ck-run-install', { repoPath: this.repoPath });
      if (result.code === 0) {
        this.showNote(this.els.setupNote, 'Zaleznosci zainstalowane.', 'ok');
        this.scanSystem();
      } else {
        this.showNote(this.els.setupNote, 'Blad instalacji.', 'error');
        this.appendLog('BLAD: ' + result.stderr, 'stderr');
      }
    } catch (err) { this.appendLog('Blad: ' + err.message, 'stderr'); }
    finally { this.running = false; this.hideWsProgress(); this.updateSteps(); }
  },

  async runInference() {
    if (!this.repoPath) {
      this.showNote(this.els.inputInfo, 'Najpierw ustaw repo CorridorKey (Krok 1).', 'err');
      this.appendLog('Nie mozna uruchomic inference — brak repo CorridorKey.', 'stderr');
      return;
    }
    if (!this.shotDir) {
      this.showNote(this.els.inputInfo, 'Najpierw przygotuj materiał wejściowy (Krok 2).', 'err');
      this.appendLog('Nie mozna uruchomic inference — brak przygotowanego shotu. Kliknij "Przygotuj do inference" w Kroku 2.', 'stderr');
      return;
    }
    if (this.running) {
      this.appendLog('Inna operacja w toku, poczekaj...', 'stderr');
      return;
    }
    this.running = true;
    this.updateSteps();
    this.setStatus('scanning', 'Inference...');
    this.showWsProgress('Inference w toku...');
    this.showSidebarProgress('Inference w toku...');
    this.appendLog('Uruchamiam inference...', 'stdout');

    const device = this.getActiveBtnValue(this.els.deviceGroup) || 'auto';
    try {
      const result = await ipcRenderer.invoke('ck-run', {
        repoPath: this.repoPath,
        action: 'run_inference',
        args: `--device ${device}`,
      });
      const hasError = result.stderr && /ERROR/i.test(result.stderr);
      if (result.code === 0 && !hasError) {
        this.setStatus('ready', 'Zakonczono');
        this.hideWsProgress();
        this.hideSidebarProgress();
        this.appendLog('Inference zakonczona pomyslnie!', 'stdout');
        this.scanOutputDir();
        this.loadOutputThumbnails();
      } else {
        this.setStatus('error', 'Blad');
        this.showWsProgress('Blad inference.');
        this.showSidebarProgress('Blad inference.');
        const errMsg = hasError
          ? result.stderr.split('\n').filter(l => /ERROR/i.test(l)).join('\n')
          : result.stderr;
        this.appendLog('BLAD: ' + errMsg, 'stderr');
      }
    } catch (err) {
      this.setStatus('error', 'Blad');
      this.appendLog('Blad: ' + err.message, 'stderr');
    } finally {
      this.running = false;
      this.hideSidebarProgress();
      this.updateSteps();
    }
  },

  async scanOutputDir() {
    if (!this.shotDir) return;
    const outputDir = path.join(this.shotDir, 'Output');
    if (!fs.existsSync(outputDir)) return;
    const entries = fs.readdirSync(outputDir).map(name => {
      const fullPath = path.join(outputDir, name);
      return { name, path: fullPath, isDir: fs.statSync(fullPath).isDirectory() };
    });
    const outputDirs = ['Matte', 'FG', 'Processed', 'Comp'];
    const found = entries.filter(e => outputDirs.includes(e.name) && e.isDir);
    if (found.length > 0) this.renderOutputs(found);
  },

  renderOutputs(dirs) {
    this.els.outputSection.style.display = 'block';
    this.els.outputGrid.innerHTML = '';
    const labels = { 'Matte': 'Alpha Matte (EXR)', 'FG': 'Foreground (EXR)', 'Processed': 'Premultiplied RGBA (EXR)', 'Comp': 'Preview Composite (PNG)' };
    for (const dir of dirs) {
      const card = document.createElement('div');
      card.className = 'ck-output-card';
      card.innerHTML = `<div class="ck-output-card-label">${labels[dir.name] || dir.name}</div><div class="ck-output-card-path">${dir.path}</div><button class="btn btn-ghost ck-open-dir">Otworz</button>`;
      card.querySelector('.ck-open-dir').addEventListener('click', () => require('child_process').exec(`explorer "${dir.path}"`));
      this.els.outputGrid.appendChild(card);
    }
    if (dirs.find(d => d.name === 'Comp')) this.els.assembleVideo.style.display = '';
  },

  async assembleVideo() {
    const compDir = this.findOutputDir('Comp');
    if (!compDir) { this.appendLog('Brak katalogu Comp.', 'stderr'); return; }
    const saveResult = await ipcRenderer.invoke('save-dialog', {
      defaultName: path.basename(this.shotDir || 'output') + '_comp.mp4',
      filters: [{ name: 'MP4', extensions: ['mp4'] }]
    });
    if (!saveResult) return;
    this.running = true;
    this.showWsProgress('Składanie wideo...');
    this.showSidebarProgress('Składanie wideo...');
    this.appendLog('Składanie wideo z Comp...', 'stdout');
    try {
      const result = await ipcRenderer.invoke('ck-assemble-video', {
        framesDir: compDir, savePath: saveResult, fps: this.videoInfo ? this.videoInfo.fps : 24,
      });
      if (result.code === 0) {
        this.appendLog('Wideo zapisane: ' + saveResult, 'stdout');
        require('child_process').exec(`explorer "${path.dirname(saveResult)}"`);
      } else {
        this.appendLog('BLAD: ' + result.stderr, 'stderr');
      }
    } catch (err) { this.appendLog('Blad: ' + err.message, 'stderr'); }
    finally { this.running = false; this.hideWsProgress(); this.hideSidebarProgress(); this.updateSteps(); }
  }
};

document.addEventListener('DOMContentLoaded', () => CK.init());
