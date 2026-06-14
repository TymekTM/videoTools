(function () {
  'use strict';

  var { ipcRenderer } = require('electron');

  var CHAR_RES = RESOLUTIONS;
  var DESIGN_H = 540;

  var st = {
    character: {
      name: 'Jan Kowalski',
      nickname: 'Kox',
      photo: '',
      photoShape: 'circle',
      ageMode: 'age',
      ageValue: '34',
      role: 'Świadek',
      bio: 'Naoczy świadek wydarzeń z tamtego wieczoru.',
      customs: [{ label: 'Wzrost', value: '182 cm' }],
      reward: '5,000'
    },
    style: 'hero',
    accent: '#6366f1',
    introDuration: 900,
    holdDuration: 2600,
    bgMode: 'preset',
    bgPreset: 'aurora',
    format: '16:9',
    resolution: '1080p',
    animating: false,
    animRaf: null,
    scale: 1
  };

  var STYLES = [
    { key: 'hero', label: 'Hero' },
    { key: 'lower-third', label: 'Lower Third' },
    { key: 'wanted', label: 'Wanted' },
    { key: 'polaroid', label: 'Polaroid' }
  ];

  var BG_MODES = ['preset', 'green', 'blue', 'black', 'white'];

  function getResolution() { return CHAR_RES[st.format][st.resolution]; }

  function getDesignDims() {
    var res = getResolution();
    var rw = res[0], rh = res[1];
    var dw = Math.round(rw * DESIGN_H / rh);
    return { dw: dw, dh: DESIGN_H, rw: rw, rh: rh };
  }

  function labels() {
    return {
      role: t('characterLblRole'),
      age: t('characterLblAge'),
      dob: t('characterLblDob'),
      namePlaceholder: t('characterNamePh'),
      reward: t('characterLblReward'),
      stamp: t('characterWanted'),
      deadOrAlive: t('characterDeadOrAlive')
    };
  }

  function renderPreview() {
    var area = $('[data-tool="character"] .preview-area');
    var canvas = $('#characterPreviewCanvas');
    if (!area || !canvas) return;

    var dm = getDesignDims();
    var aw = area.clientWidth, ah = area.clientHeight;
    var displayScale = Math.min(aw / dm.dw, ah / dm.dh, 1);

    var wrapper = $('#characterPreviewWrapper');
    if (wrapper) {
      wrapper.style.width = Math.round(dm.dw * displayScale) + 'px';
      wrapper.style.height = Math.round(dm.dh * displayScale) + 'px';
    }
    canvas.style.width = dm.dw + 'px';
    canvas.style.height = dm.dh + 'px';
    canvas.style.zoom = displayScale;
    st.scale = displayScale;

    renderPreviewContent();
  }

  function renderPreviewContent() {
    var canvas = $('#characterPreviewCanvas');
    if (!canvas) return;
    var dm = getDesignDims();
    var bg = CharacterCore.resolveBackground(st.bgMode, st.bgPreset);
    var card = CharacterCore.buildCardHtml({
      ch: st.character, style: st.style, accent: st.accent,
      W: dm.dw, H: dm.dh, progress: 1, labels: labels(),
      dark: CharacterCore.isDarkBg(st.bgMode, st.bgPreset)
    });
    canvas.innerHTML = '<div style="position:relative;width:100%;height:100%;background:' + bg + ';overflow:hidden">' + card + '</div>';
  }

  function renderAnimationFrame(t) {
    var canvas = $('#characterPreviewCanvas');
    if (!canvas) return;
    var dm = getDesignDims();
    var totalMs = st.introDuration + st.holdDuration;
    var elapsed = t * totalMs;
    var prog = Math.max(0, Math.min(1, elapsed / st.introDuration));
    var bg = CharacterCore.resolveBackground(st.bgMode, st.bgPreset);
    var card = CharacterCore.buildCardHtml({
      ch: st.character, style: st.style, accent: st.accent,
      W: dm.dw, H: dm.dh, progress: prog, labels: labels(),
      dark: CharacterCore.isDarkBg(st.bgMode, st.bgPreset)
    });
    canvas.innerHTML = '<div style="position:relative;width:100%;height:100%;background:' + bg + ';overflow:hidden">' + card + '</div>';
  }

  function startAnimation() {
    if (st.animating) stopAnimation();
    var canvas = $('#characterPreviewCanvas');
    if (!canvas) return;
    st.animating = true;
    var totalDuration = st.introDuration + st.holdDuration;
    var start = performance.now();
    function frame(now) {
      if (!st.animating) return;
      var elapsed = now - start;
      var t = Math.min(elapsed / totalDuration, 1);
      renderAnimationFrame(t);
      if (t < 1) {
        st.animRaf = requestAnimationFrame(frame);
      } else {
        st.animating = false;
        setPlayLabel(false);
      }
    }
    st.animRaf = requestAnimationFrame(frame);
    setPlayLabel(true);
  }

  function stopAnimation() {
    if (st.animRaf) cancelAnimationFrame(st.animRaf);
    st.animating = false;
    st.animRaf = null;
    renderPreviewContent();
    setPlayLabel(false);
  }

  function setPlayLabel(playing) {
    var btn = $('#characterPlayBtn');
    if (btn) btn.querySelector('span').textContent = playing ? t('characterPlaying') : t('characterPlay');
  }

  async function exportVideo(format) {
    if (st.animating) return;

    var ext = format === 'mov' ? 'mov' : format === 'webm' ? 'webm' : 'mp4';
    var ipcMethod = format === 'mov' ? 'export-mov' : format === 'webm' ? 'export-webm' : 'export-mp4';
    var isAlpha = format === 'mov' || format === 'webm';

    var savePath = await ipcRenderer.invoke('save-dialog', {
      defaultName: 'character-' + Date.now() + '.' + ext,
      filters: [{ name: ext.toUpperCase(), extensions: [ext] }]
    });
    if (!savePath) return;

    var res = getResolution();
    var w = res[0], h = res[1];
    var fps = 30;

    var setExporting = makeSetExporting('character');
    setExporting(true, t('characterPreparing'), 0);

    var html = CharacterCore.buildOffscreenHtml({
      width: w, height: h,
      character: st.character,
      style: st.style,
      accent: st.accent,
      bgMode: st.bgMode,
      bgPreset: st.bgPreset,
      introDuration: st.introDuration,
      holdDuration: st.holdDuration,
      labels: labels()
    });

    await ipcRenderer.invoke('bg-load-html', { html: html, width: w, height: h });
    setExporting(true, t('characterRenderingFrames'), 5);

    var frameSpecs = CharacterCore.buildFramePlan({
      introDuration: st.introDuration,
      holdDuration: st.holdDuration
    }, fps).frames;

    var frames = [];
    var batchSize = 30;
    var batchItems = [];
    for (var i = 0; i < frameSpecs.length; i++) {
      var frameJs = '(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){window._uf(' + frameSpecs[i].t + ');return 1})';
      batchItems.push({ js: frameJs, waitForPaint: true });
      if (batchItems.length >= batchSize || i === frameSpecs.length - 1) {
        var batchData = await ipcRenderer.invoke('bg-eval-capture-batch', {
          frames: batchItems,
          format: isAlpha ? 'png' : 'jpeg'
        });
        for (var b = 0; b < batchData.length; b++) {
          var specIndex = frames.length;
          frames.push({ data: batchData[b], duration: frameSpecs[specIndex].duration });
        }
        batchItems = [];
        var pct = 5 + Math.round((i / frameSpecs.length) * 80);
        setExporting(true, t('characterFrame') + ' ' + (i + 1) + '/' + frameSpecs.length, pct);
      }
    }

    frames.push({ data: frames[frames.length - 1].data, duration: Math.round(fps * 1.2) });

    setExporting(true, t('characterEncoding') + ' ' + ext.toUpperCase() + '...', 90);
    await ipcRenderer.invoke(ipcMethod, { frames: frames, savePath: savePath, fps: fps, width: w, height: h });
    await ipcRenderer.invoke('bg-cleanup');

    setExporting(false);
  }

  /* ── Photo handling ── */
  function loadPhoto(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      st.character.photo = e.target.result;
      updatePhotoPreview();
      renderPreviewContent();
    };
    reader.readAsDataURL(file);
  }

  function updatePhotoPreview() {
    var prev = $('#characterPhotoPreview');
    if (!prev) return;
    if (st.character.photo) {
      prev.style.backgroundImage = 'url("' + st.character.photo + '")';
      prev.textContent = '';
    } else {
      prev.style.backgroundImage = '';
      prev.textContent = t('characterNoPhoto');
    }
  }

  /* ── Custom fields ── */
  function renderCustoms() {
    var list = $('#characterCustomList');
    if (!list) return;
    list.innerHTML = '';
    st.character.customs.forEach(function (c, i) {
      var row = document.createElement('div');
      row.className = 'character-custom-item';

      var labelInp = document.createElement('input');
      labelInp.type = 'text';
      labelInp.className = 'control-input';
      labelInp.value = c.label;
      labelInp.placeholder = t('characterCustomLabelPh');
      (function (idx, inp) {
        inp.addEventListener('input', function () { st.character.customs[idx].label = inp.value; renderPreviewContent(); });
      })(i, labelInp);

      var valInp = document.createElement('input');
      valInp.type = 'text';
      valInp.className = 'control-input';
      valInp.value = c.value;
      valInp.placeholder = t('characterCustomValuePh');
      (function (idx, inp) {
        inp.addEventListener('input', function () { st.character.customs[idx].value = inp.value; renderPreviewContent(); });
      })(i, valInp);

      var del = document.createElement('button');
      del.className = 'character-custom-del';
      del.innerHTML = '&times;';
      del.title = t('characterDeleteField');
      (function (idx) {
        del.addEventListener('click', function () { st.character.customs.splice(idx, 1); renderCustoms(); renderPreviewContent(); });
      })(i);

      row.appendChild(labelInp);
      row.appendChild(valInp);
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  /* ── BG preset swatches ── */
  function renderBgPresets() {
    var group = $('#characterBgPresetGroup');
    if (!group) return;
    group.innerHTML = '';
    Object.keys(CharacterCore.BG_PRESETS).forEach(function (key) {
      var btn = document.createElement('button');
      btn.className = 'character-bg-preset' + (key === st.bgPreset ? ' active' : '');
      btn.dataset.preset = key;
      btn.title = key;
      btn.style.background = CharacterCore.BG_PRESETS[key];
      btn.addEventListener('click', function () {
        st.bgPreset = key;
        $$('#characterBgPresetGroup .character-bg-preset').forEach(function (b) { b.classList.toggle('active', b.dataset.preset === key); });
        renderPreviewContent();
      });
      group.appendChild(btn);
    });
  }

  function syncAgeInputVisibility() {
    var inp = $('#characterAgeValue');
    if (!inp) return;
    inp.style.display = st.character.ageMode === 'none' ? 'none' : '';
  }

  var controlsBound = false;

  function bindControls() {
    if (controlsBound) return;
    controlsBound = true;

    $$('#characterStyleGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#characterStyleGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.style = btn.dataset.style;
        renderPreviewContent();
      });
    });

    listen('#characterPhotoFile', 'change', function (e) {
      if (e.target.files && e.target.files[0]) loadPhoto(e.target.files[0]);
    });
    listen('#characterPhotoFilePick', 'click', function () {
      var f = $('#characterPhotoFile'); if (f) f.click();
    });
    listen('#characterPhotoClear', 'click', function () {
      st.character.photo = '';
      updatePhotoPreview();
      renderPreviewContent();
      var f = $('#characterPhotoFile'); if (f) f.value = '';
    });

    $$('#characterShapeGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#characterShapeGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.character.photoShape = btn.dataset.shape;
        renderPreviewContent();
      });
    });

    function bindChar(id, prop, parseFn) {
      listen(id, 'input', function (e) {
        st.character[prop] = parseFn ? parseFn(e.target.value) : e.target.value;
        renderPreviewContent();
      });
    }
    bindChar('#characterName', 'name');
    bindChar('#characterNickname', 'nickname');
    bindChar('#characterRole', 'role');
    bindChar('#characterBio', 'bio');

    listen('#characterAgeMode', 'change', function (e) {
      st.character.ageMode = e.target.value;
      syncAgeInputVisibility();
      renderPreviewContent();
    });
    bindChar('#characterAgeValue', 'ageValue');

    listen('#characterAddCustom', 'click', function () {
      st.character.customs.push({ label: '', value: '' });
      renderCustoms();
    });

    listen('#characterAccent', 'input', function (e) {
      st.accent = e.target.value;
      renderPreviewContent();
    });

    $$('#characterBgModeGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#characterBgModeGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.bgMode = btn.dataset.bgmode;
        var pg = $('#characterBgPresetWrap');
        if (pg) pg.style.display = st.bgMode === 'preset' ? '' : 'none';
        renderPreviewContent();
      });
    });

    listen('#characterIntro', 'input', function (e) {
      st.introDuration = parseInt(e.target.value);
      var el = $('#characterIntroVal'); if (el) el.textContent = st.introDuration + 'ms';
    });
    listen('#characterHold', 'input', function (e) {
      st.holdDuration = parseInt(e.target.value);
      var el = $('#characterHoldVal'); if (el) el.textContent = st.holdDuration + 'ms';
    });

    $$('#characterFormatGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#characterFormatGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.format = btn.dataset.format;
        renderPreview();
      });
    });
    listen('#characterResolutionSelect', 'change', function (e) {
      st.resolution = e.target.value;
      renderPreview();
    });

    listen('#characterPlayBtn', 'click', function () {
      if (st.animating) stopAnimation(); else startAnimation();
    });
    listen('#characterStopBtn', 'click', function () { stopAnimation(); });

    listen('#characterExportMov', 'click', function () { exportVideo('mov'); });
    listen('#characterExportWebm', 'click', function () { exportVideo('webm'); });
    listen('#characterExportMp4', 'click', function () { exportVideo('mp4'); });

    listen('#characterClearBtn', 'click', function () {
      st.character = { name: '', nickname: '', photo: '', photoShape: 'circle', ageMode: 'none', ageValue: '', role: '', bio: '', customs: [], reward: '5,000' };
      var nm = $('#characterName'); if (nm) nm.value = '';
      var nk = $('#characterNickname'); if (nk) nk.value = '';
      var rl = $('#characterRole'); if (rl) rl.value = '';
      var bo = $('#characterBio'); if (bo) bo.value = '';
      var ag = $('#characterAgeValue'); if (ag) ag.value = '';
      var am = $('#characterAgeMode'); if (am) { am.value = 'none'; }
      syncAgeInputVisibility();
      updatePhotoPreview();
      renderCustoms();
      renderPreviewContent();
    });
  }

  function syncInputsFromState() {
    var set = function (id, val) { var el = $(id); if (el) el.value = val == null ? '' : val; };
    set('#characterName', st.character.name);
    set('#characterNickname', st.character.nickname);
    set('#characterRole', st.character.role);
    set('#characterBio', st.character.bio);
    set('#characterAgeValue', st.character.ageValue);
    var am = $('#characterAgeMode'); if (am) am.value = st.character.ageMode;
    syncAgeInputVisibility();
    $$('#characterShapeGroup .control-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.shape === st.character.photoShape); });
    $$('#characterStyleGroup .control-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.style === st.style); });
    $$('#characterBgModeGroup .control-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.bgmode === st.bgMode); });
    var ac = $('#characterAccent'); if (ac) ac.value = st.accent;
    var pg = $('#characterBgPresetWrap'); if (pg) pg.style.display = st.bgMode === 'preset' ? '' : 'none';
    var iv = $('#characterIntroVal'); if (iv) iv.textContent = st.introDuration + 'ms';
    var hv = $('#characterHoldVal'); if (hv) hv.textContent = st.holdDuration + 'ms';
  }

  window.initCharacterTool = function () {
    bindControls();
    renderBgPresets();
    syncInputsFromState();
    updatePhotoPreview();
    renderCustoms();
    renderPreview();
  };

  window.characterActivate = function () {
    try {
      bindControls();
      renderBgPresets();
      syncInputsFromState();
      updatePhotoPreview();
      renderCustoms();
      renderPreview();
    } catch (e) { console.error('[character] activate:', e); }
    setTimeout(function () { renderPreview(); }, 150);
  };

  window.characterUpdatePreviewSize = function () { renderPreview(); };
})();
