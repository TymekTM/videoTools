const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const CK = {
  sysInfo: null,
  repoPath: '',
  inputPath: '',
  alphaHintPath: '',
  running: false,

  els: {},

  init() {
    this.els = {
      statusBadge: document.getElementById('ckStatusBadge'),
      licenseToggle: document.getElementById('ckLicenseToggle'),
      licenseFull: document.getElementById('ckLicenseFull'),
      sysGrid: document.getElementById('ckSysGrid'),
      sysPlatform: document.getElementById('ckSysPlatform'),
      sysPython: document.getElementById('ckSysPython'),
      sysUv: document.getElementById('ckSysUv'),
      sysCuda: document.getElementById('ckSysCuda'),
      sysGpu: document.getElementById('ckSysGpu'),
      sysVram: document.getElementById('ckSysVram'),
      sysRepo: document.getElementById('ckSysRepo'),
      sysModels: document.getElementById('ckSysModels'),
      compatibility: document.getElementById('ckCompatibility'),
      scanBtn: document.getElementById('ckScanBtn'),
      cloneRepo: document.getElementById('ckCloneRepo'),
      cloneProgress: document.getElementById('ckCloneProgress'),
      cloneProgressBar: document.getElementById('ckCloneProgressBar'),
      cloneProgressLabel: document.getElementById('ckCloneProgressLabel'),
      repoPath: document.getElementById('ckRepoPath'),
      browseRepo: document.getElementById('ckBrowseRepo'),
      autoDetect: document.getElementById('ckAutoDetect'),
      installDeps: document.getElementById('ckInstallDeps'),
      setupNote: document.getElementById('ckSetupNote'),
      inputPath: document.getElementById('ckInputPath'),
      browseInput: document.getElementById('ckBrowseInput'),
      alphaHintPath: document.getElementById('ckAlphaHintPath'),
      browseAlpha: document.getElementById('ckBrowseAlpha'),
      inputInfo: document.getElementById('ckInputInfo'),
      gammaGroup: document.getElementById('ckGammaGroup'),
      despillRange: document.getElementById('ckDespillRange'),
      despillVal: document.getElementById('ckDespillVal'),
      deviceGroup: document.getElementById('ckDeviceGroup'),
      autoDespeckle: document.getElementById('ckAutoDespeckle'),
      despeckleRange: document.getElementById('ckDespeckleRange'),
      despeckleVal: document.getElementById('ckDespeckleVal'),
      refinerRange: document.getElementById('ckRefinerRange'),
      refinerVal: document.getElementById('ckRefinerVal'),
      alphaMethodGroup: document.getElementById('ckAlphaMethodGroup'),
      alphaNote: document.getElementById('ckAlphaNote'),
      runInference: document.getElementById('ckRunInference'),
      runWizard: document.getElementById('ckRunWizard'),
      listShots: document.getElementById('ckListShots'),
      progress: document.getElementById('ckProgress'),
      progressBar: document.getElementById('ckProgressBar'),
      progressLabel: document.getElementById('ckProgressLabel'),
      logBody: document.getElementById('ckLogBody'),
      logClear: document.getElementById('ckLogClear'),
      previewLog: document.getElementById('ckPreviewLog'),
      previewPlaceholder: document.getElementById('ckPreviewPlaceholder'),
      outputSection: document.getElementById('ckOutputSection'),
      outputGrid: document.getElementById('ckOutputGrid'),
      systemToggle: document.getElementById('ckSystemToggle'),
      systemBody: document.getElementById('ckSystemBody'),
      setupToggle: document.getElementById('ckSetupToggle'),
      setupBody: document.getElementById('ckSetupBody'),
      inputToggle: document.getElementById('ckInputToggle'),
      inputBody: document.getElementById('ckInputBody'),
      paramsToggle: document.getElementById('ckParamsToggle'),
      paramsBody: document.getElementById('ckParamsBody'),
      alphaGenToggle: document.getElementById('ckAlphaGenToggle'),
      alphaGenBody: document.getElementById('ckAlphaGenBody'),
    };

    this.bindEvents();
    this.scanSystem();
  },

  bindEvents() {
    this.els.licenseToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const el = this.els.licenseFull;
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    });

    this.els.scanBtn.addEventListener('click', () => this.scanSystem());

    this.els.cloneRepo.addEventListener('click', () => this.cloneRepo());

    this.els.browseRepo.addEventListener('click', async () => {
      const p = await ipcRenderer.invoke('ck-select-repo');
      if (p) {
        this.els.repoPath.value = p;
        this.repoPath = p;
        this.validateRepo();
      }
    });

    this.els.autoDetect.addEventListener('click', () => this.scanSystem());

    this.els.installDeps.addEventListener('click', () => this.installDeps());

    this.els.browseInput.addEventListener('click', async () => {
      const p = await ipcRenderer.invoke('ck-select-dir');
      if (p) {
        this.els.inputPath.value = p;
        this.inputPath = p;
        this.checkInputStructure(p);
      }
    });

    this.els.browseAlpha.addEventListener('click', async () => {
      const p = await ipcRenderer.invoke('ck-select-dir');
      if (p) {
        this.els.alphaHintPath.value = p;
        this.alphaHintPath = p;
      }
    });

    this.bindBtnGroup(this.els.gammaGroup, 'gamma');
    this.bindBtnGroup(this.els.deviceGroup, 'device');
    this.bindBtnGroup(this.els.alphaMethodGroup, 'alphaMethod');

    this.els.despillRange.addEventListener('input', () => {
      this.els.despillVal.textContent = this.els.despillRange.value;
    });
    this.els.despeckleRange.addEventListener('input', () => {
      this.els.despeckleVal.textContent = this.els.despeckleRange.value;
    });
    this.els.refinerRange.addEventListener('input', () => {
      this.els.refinerVal.textContent = parseFloat(this.els.refinerRange.value).toFixed(1);
    });

    this.els.runInference.addEventListener('click', () => this.runInference());
    this.els.runWizard.addEventListener('click', () => this.runWizard());
    this.els.listShots.addEventListener('click', () => this.listShots());

    this.els.logClear.addEventListener('click', () => {
      this.els.logBody.innerHTML = '';
    });

    this.bindSectionToggle(this.els.systemToggle, this.els.systemBody);
    this.bindSectionToggle(this.els.setupToggle, this.els.setupBody);
    this.bindSectionToggle(this.els.inputToggle, this.els.inputBody);
    this.bindSectionToggle(this.els.paramsToggle, this.els.paramsBody);
    this.bindSectionToggle(this.els.alphaGenToggle, this.els.alphaGenBody);

    ipcRenderer.on('ck-run-output', (_event, data) => {
      this.appendLog(data.text, data.type);
    });
    ipcRenderer.on('ck-install-output', (_event, data) => {
      this.appendLog(data.text, data.type);
    });
    ipcRenderer.on('ck-clone-output', (_event, data) => {
      this.appendLog(data.text, data.type);
    });
  },

  bindBtnGroup(container, key) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.control-btn');
      if (!btn) return;
      container.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  },

  bindSectionToggle(header, body) {
    header.addEventListener('click', () => {
      const collapsed = body.style.display === 'none';
      body.style.display = collapsed ? '' : 'none';
      header.querySelector('.ck-section-arrow').innerHTML = collapsed ? '&#9660;' : '&#9654;';
    });
  },

  getActiveBtnValue(container) {
    const active = container.querySelector('.control-btn.active');
    return active ? Object.values(active.dataset)[0] : null;
  },

  async scanSystem() {
    this.setStatus('scanning', 'Skanowanie...');
    try {
      const info = await ipcRenderer.invoke('ck-detect-system');
      this.sysInfo = info;
      this.renderSystemInfo(info);
      this.assessCompatibility(info);

      if (info.corridorKeyRepo) {
        this.els.repoPath.value = info.corridorKeyRepo;
        this.repoPath = info.corridorKeyRepo;
        this.validateRepo();
      }

      this.updateRunButtons();
    } catch (err) {
      this.setStatus('error', 'Błąd skanowania');
      this.appendLog('Błąd skanowania systemu: ' + err.message, 'stderr');
    }
  },

  renderSystemInfo(info) {
    this.setSysField('ckSysPlatform', info.platform + ' / ' + info.arch, true);
    this.setSysField('ckSysPython', info.python ? (info.pythonVersion || 'Znaleziono') : 'Nie znaleziono', !!info.python);
    this.setSysField('ckSysUv', info.uv ? (info.uvVersion || 'Znaleziono') : 'Nie znaleziono', !!info.uv);
    this.setSysField('ckSysCuda', info.cuda ? ('v' + info.cudaVersion) : 'Brak', !!info.cuda);
    this.setSysField('ckSysGpu', info.gpu || 'Brak / Nie wykryto', !!info.gpu);
    this.setSysField('ckSysVram', info.gpuVram || 'N/A', !!info.gpuVram);
    this.setSysField('ckSysRepo', info.corridorKeyRepo || 'Nie znaleziono', !!info.corridorKeyRepo);
    this.setSysField('ckSysModels', info.corridorKeyModels ? info.corridorKeyModels.join(', ') : 'Brak', !!info.corridorKeyModels);
  },

  setSysField(id, text, ok) {
    const el = document.getElementById(id);
    el.textContent = text;
    const item = el.closest('.ck-sys-item');
    if (item) {
      item.classList.remove('ck-sys-ok', 'ck-sys-fail', 'ck-sys-warn');
      item.classList.add(ok ? 'ck-sys-ok' : 'ck-sys-fail');
    }
  },

  assessCompatibility(info) {
    const comp = this.els.compatibility;
    const checks = [];

    const hasRepo = !!(this.repoPath || info.corridorKeyRepo);
    const hasModels = !!(info.corridorKeyModels && info.corridorKeyModels.length > 0)
      || (this.repoPath && fs.existsSync(path.join(this.repoPath, 'CorridorKeyModule', 'checkpoints')));

    if (!info.python) checks.push({ ok: false, msg: 'Python nie jest zainstalowany lub nie jest w PATH. CorridorKey wymaga Python 3.10+.' });
    if (!info.uv) checks.push({ ok: false, msg: 'uv (menedżer pakietów) nie jest zainstalowany. Pobierz z docs.astral.sh/uv' });
    if (!info.cuda) checks.push({ ok: null, msg: 'CUDA nie wykryte. Inference będzie działać na CPU (wolniej).' });
    if (info.gpuVram) {
      const vramMatch = info.gpuVram.match(/(\d+)\s*Mi?B/i);
      const vramGb = vramMatch ? parseInt(vramMatch[1]) / 1024 : 0;
      if (vramGb >= 6) { /* ok, skip */ }
      else checks.push({ ok: false, msg: `VRAM ${vramGb.toFixed(0)}GB - niewystarczające do GPU inference. Użyj CPU.` });
    }
    if (!hasRepo) checks.push({ ok: false, msg: 'Repozytorium CorridorKey nie znalezione. Sklonuj z GitHub lub wskaż ścieżkę ręcznie.' });
    if (hasRepo && !hasModels) checks.push({ ok: null, msg: 'Model CorridorKey nie pobrany (~300MB). Kliknij "Pobierz model" poniżej.' });

    if (checks.length === 0) {
      comp.style.display = 'none';
      this.setStatus('ready', 'Gotowy');
      return;
    }

    const allOk = checks.every(c => c.ok !== false);
    const anyWarn = checks.some(c => c.ok === null);
    if (allOk && anyWarn) this.setStatus('warning', 'Ostrzeżenia');
    else if (!allOk) this.setStatus('error', 'Problemy');
    else this.setStatus('ready', 'Gotowy');

    comp.style.display = 'block';
    comp.innerHTML = checks.map(c => {
      const cls = c.ok === true ? 'ck-comp-ok' : c.ok === false ? 'ck-comp-fail' : 'ck-comp-warn';
      const icon = c.ok === true ? '&#10003;' : c.ok === false ? '&#10007;' : '&#9888;';
      return `<div class="ck-comp-item ${cls}"><span class="ck-comp-icon">${icon}</span><span>${c.msg}</span></div>`;
    }).join('');
  },

  setStatus(type, text) {
    const badge = this.els.statusBadge;
    badge.className = 'ck-badge ck-badge-' + type;
    badge.textContent = text;
  },

  async validateRepo() {
    const p = this.repoPath;
    if (!p) return;
    try {
      const structure = await ipcRenderer.invoke('ck-check-dir-structure', p);
      if (!structure) {
        this.showSetupNote('Nieprawidłowy folder repozytorium.', 'error');
        return;
      }
      const hasClipMgr = fs.existsSync(path.join(p, 'clip_manager.py'));
      if (!hasClipMgr) {
        this.showSetupNote('Brak clip_manager.py - to nie wygląda na repozytorium CorridorKey.', 'error');
        return;
      }
      const hasPyproject = fs.existsSync(path.join(p, 'pyproject.toml'));
      const hasUvLock = fs.existsSync(path.join(p, 'uv.lock'));
      const hasCheckpoints = fs.existsSync(path.join(p, 'CorridorKeyModule', 'checkpoints'));

      let msg = 'Repozytorium wykryte.';
      if (!hasUvLock) msg += ' Wymaga instalacji zależności.';
      if (!hasCheckpoints) msg += ' Modele zostaną pobrane automatycznie.';
      this.showSetupNote(msg, hasUvLock ? 'ok' : 'warn');
      this.els.installDeps.disabled = false;
      this.updateRunButtons();
    } catch (err) {
      this.showSetupNote('Błąd walidacji: ' + err.message, 'error');
    }
  },

  showSetupNote(msg, type) {
    const el = this.els.setupNote;
    el.style.display = 'block';
    el.className = 'ck-setup-note ck-note-' + type;
    el.textContent = msg;
  },

  async checkInputStructure(dirPath) {
    const info = await ipcRenderer.invoke('ck-check-dir-structure', dirPath);
    const el = this.els.inputInfo;
    if (!info) {
      el.style.display = 'block';
      el.className = 'ck-input-info ck-note-error';
      el.textContent = 'Nie można odczytać folderu.';
      return;
    }

    let msg = '';
    if (info.shotDirs.length > 0) {
      msg = `Znaleziono ${info.shotDirs.length} shot(s): ${info.shotDirs.join(', ')}.`;
    } else if (info.hasInput) {
      msg = 'Pliki wejściowe znalezione.';
      if (info.hasAlphaHint) msg += ' AlphaHint obecny.';
      else msg += ' Brak AlphaHint - wygeneruj lub dostarcz.';
    } else {
      msg = 'Brak plików wejściowych w folderze. Umieść pliki w podfolderze Input/ lub użyj struktury shot/Input.';
    }

    el.style.display = 'block';
    el.className = 'ck-input-info ck-note-' + (info.hasInput ? 'ok' : 'warn');
    el.textContent = msg;
  },

  updateRunButtons() {
    const canRun = this.repoPath && this.sysInfo;
    this.els.runInference.disabled = !canRun || this.running;
    this.els.runWizard.disabled = !canRun || this.running;
    this.els.listShots.disabled = !canRun || this.running;
  },

  showLog() {
    this.els.previewPlaceholder.style.display = 'none';
    this.els.previewLog.style.display = 'flex';
  },

  appendLog(text, type) {
    this.showLog();
    const line = document.createElement('div');
    line.className = 'ck-log-line ck-log-' + (type === 'stderr' ? 'err' : 'out');
    line.textContent = text;
    this.els.logBody.appendChild(line);
    this.els.logBody.scrollTop = this.els.logBody.scrollHeight;
  },

  async cloneRepo() {
    if (this.running) return;
    const targetDir = await ipcRenderer.invoke('ck-select-dir');
    if (!targetDir) return;

    this.running = true;
    this.updateRunButtons();
    this.els.cloneProgress.style.display = 'block';
    this.els.cloneProgressBar.style.width = '100%';
    this.els.cloneProgressBar.style.animation = 'ck-indeterminate 1.5s infinite';
    this.els.cloneProgressLabel.textContent = 'Klonowanie CorridorKey z GitHub...';
    this.setStatus('scanning', 'Klonowanie...');

    try {
      const result = await ipcRenderer.invoke('ck-clone-repo', { targetDir });
      if (result.code === 0) {
        this.els.repoPath.value = result.destPath;
        this.repoPath = result.destPath;
        this.setStatus('ready', 'Sklonowano');
        this.showSetupNote('Repozytorium sklonowane pomyślnie. Możesz teraz zainstalować zależności.', 'ok');
        this.validateRepo();
      } else {
        this.setStatus('error', 'Błąd klonowania');
        this.appendLog('BŁĄD: ' + (result.stderr || 'Nieznany błąd'), 'stderr');
        this.showSetupNote('Błąd klonowania: ' + (result.stderr || '').slice(0, 120), 'error');
      }
    } catch (err) {
      this.setStatus('error', 'Błąd');
      this.appendLog('Błąd: ' + err.message, 'stderr');
    } finally {
      this.running = false;
      this.updateRunButtons();
      this.els.cloneProgressBar.style.animation = '';
      this.els.cloneProgress.style.display = 'none';
    }
  },

  async installDeps() {
    if (!this.repoPath || this.running) return;
    this.running = true;
    this.updateRunButtons();
    this.setStatus('scanning', 'Instalacja...');
    this.els.progress.style.display = 'flex';
    this.els.progressBar.style.width = '100%';
    this.els.progressBar.style.animation = 'ck-indeterminate 1.5s infinite';
    this.els.progressLabel.textContent = 'Instalacja zależności...';

    try {
      const result = await ipcRenderer.invoke('ck-run-install', { repoPath: this.repoPath });
      if (result.code === 0) {
        this.setStatus('ready', 'Zainstalowano');
        this.showSetupNote('Zależności zainstalowane pomyślnie.', 'ok');
        this.scanSystem();
      } else {
        this.setStatus('error', 'Błąd instalacji');
        this.showSetupNote('Błąd instalacji. Sprawdź console output.', 'error');
        this.appendLog('BŁĄD: ' + result.stderr, 'stderr');
      }
    } catch (err) {
      this.setStatus('error', 'Błąd');
      this.appendLog('Błąd: ' + err.message, 'stderr');
    } finally {
      this.running = false;
      this.updateRunButtons();
      this.els.progressBar.style.animation = '';
    }
  },

  async runInference() {
    if (!this.repoPath || this.running) return;
    if (!this.inputPath) {
      this.showSetupNote('Wybierz folder/plik wejściowy przed uruchomieniem.', 'error');
      return;
    }

    this.running = true;
    this.updateRunButtons();
    this.els.progress.style.display = 'flex';
    this.els.progressBar.style.width = '100%';
    this.els.progressBar.style.animation = 'ck-indeterminate 1.5s infinite';
    this.els.progressLabel.textContent = 'Inference w toku...';
    this.setStatus('scanning', 'Inference...');

    const device = this.getActiveBtnValue(this.els.deviceGroup);
    const gamma = this.getActiveBtnValue(this.els.gammaGroup);
    const despill = this.els.despillRange.value;
    const despeckle = this.els.autoDespeckle.checked ? this.els.despeckleRange.value : '0';
    const refiner = this.els.refinerRange.value;

    let args = `--win_path "${this.inputPath}" --device ${device}`;
    if (gamma === 'linear') args += ' --gamma linear';
    if (despill !== '0') args += ` --despill ${despill}`;
    if (despeckle !== '0') args += ` --despeckle ${despeckle}`;
    if (refiner !== '1.0') args += ` --refiner ${refiner}`;

    try {
      const result = await ipcRenderer.invoke('ck-run', {
        repoPath: this.repoPath,
        action: 'run_inference',
        args
      });

      if (result.code === 0) {
        this.setStatus('ready', 'Zakończono');
        this.els.progressLabel.textContent = 'Inference zakończona pomyślnie!';
        this.scanOutputDir();
      } else {
        this.setStatus('error', 'Błąd inference');
        this.els.progressLabel.textContent = 'Błąd podczas inference.';
        this.appendLog('BŁĄD: ' + result.stderr, 'stderr');
      }
    } catch (err) {
      this.setStatus('error', 'Błąd');
      this.appendLog('Błąd: ' + err.message, 'stderr');
    } finally {
      this.running = false;
      this.updateRunButtons();
      this.els.progressBar.style.animation = '';
    }
  },

  async runWizard() {
    if (!this.repoPath || this.running) return;
    this.running = true;
    this.updateRunButtons();
    this.setStatus('scanning', 'Wizard...');

    const inputPath = this.inputPath || '';
    const args = inputPath ? `--win_path "${inputPath}"` : '';

    try {
      const result = await ipcRenderer.invoke('ck-run', {
        repoPath: this.repoPath,
        action: 'wizard',
        args
      });
      this.appendLog('Wizard zakończony (code: ' + result.code + ')', 'stdout');
    } catch (err) {
      this.appendLog('Błąd: ' + err.message, 'stderr');
    } finally {
      this.running = false;
      this.updateRunButtons();
      this.setStatus('ready', 'Gotowy');
    }
  },

  async listShots() {
    if (!this.repoPath || this.running) return;
    this.running = true;
    this.updateRunButtons();

    try {
      const result = await ipcRenderer.invoke('ck-run', {
        repoPath: this.repoPath,
        action: 'list',
        args: ''
      });
      this.appendLog(result.stdout || '(brak danych)', 'stdout');
      if (result.stderr) this.appendLog(result.stderr, 'stderr');
    } catch (err) {
      this.appendLog('Błąd: ' + err.message, 'stderr');
    } finally {
      this.running = false;
      this.updateRunButtons();
    }
  },

  async scanOutputDir() {
    if (!this.inputPath) return;
    try {
      const entries = await ipcRenderer.invoke('ck-read-dir', this.inputPath);
      if (!entries) return;

      const outputDirs = ['Matte', 'FG', 'Processed', 'Comp'];
      const found = entries.filter(e => outputDirs.includes(e.name) && e.isDir);

      if (found.length === 0) {
        const subDirs = entries.filter(e => e.isDir);
        for (const sd of subDirs) {
          const subEntries = await ipcRenderer.invoke('ck-read-dir', sd.path);
          if (subEntries) {
            const subFound = subEntries.filter(e => outputDirs.includes(e.name) && e.isDir);
            if (subFound.length > 0) {
              this.renderOutputs(sd.path, subFound);
              return;
            }
          }
        }
      } else {
        this.renderOutputs(this.inputPath, found);
      }
    } catch (err) {
      this.appendLog('Błąd skanowania output: ' + err.message, 'stderr');
    }
  },

  renderOutputs(basePath, dirs) {
    this.els.outputSection.style.display = 'block';
    this.els.outputGrid.innerHTML = '';

    const labels = {
      'Matte': 'Alpha Matte (EXR)',
      'FG': 'Straight Foreground (EXR)',
      'Processed': 'Premultiplied RGBA (EXR)',
      'Comp': 'Preview Composite (PNG)'
    };

    for (const dir of dirs) {
      const card = document.createElement('div');
      card.className = 'ck-output-card';
      card.innerHTML = `
        <div class="ck-output-card-label">${labels[dir.name] || dir.name}</div>
        <div class="ck-output-card-path">${dir.path}</div>
        <button class="btn btn-ghost ck-open-dir" data-path="${dir.path}">Otwórz folder</button>
      `;
      card.querySelector('.ck-open-dir').addEventListener('click', () => {
        require('child_process').exec(`explorer "${dir.path}"`);
      });
      this.els.outputGrid.appendChild(card);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CK.init();
});
