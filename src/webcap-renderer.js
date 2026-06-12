(function () {
  var fs = require('fs');
  var ipcRenderer = require('electron').ipcRenderer;

  var els = {};
  var state = {
    imageBase64: null,
    imageWidth: 0,
    imageHeight: 0,
    displayWidth: 0,
    displayHeight: 0,
    scale: 1,
    crop: { x: 0, y: 0, w: 0, h: 0 },
    aspectRatio: null,
    format: '16:9',
    outputWidth: 1920,
    outputHeight: 1080,
    outputRes: '1080p',
    keepProportions: true,
    scaleFactor: 2,
    fullPage: true,
    viewportW: 1920,
    viewportH: 900,
    loaded: false,
    dragState: null
  };

  var FORMAT_RATIOS = {
    free: null,
    '16:9': 16 / 9,
    '9:16': 9 / 16,
    '1:1': 1,
    '4:5': 4 / 5
  };

  function initWebcap() {
    els.urlInput = $('#webcapUrlInput');
    els.loadBtn = $('#webcapLoadBtn');
    els.viewportSelect = $('#webcapViewport');
    els.customViewport = $('#webcapCustomViewport');
    els.customVpW = $('#webcapCustomVpW');
    els.customVpH = $('#webcapCustomVpH');
    els.fullPageToggle = $('#webcapFullPage');
    els.scaleGroup = $('#webcapScaleGroup');
    els.formatGroup = $('#webcapFormatGroup');
    els.resSelect = $('#webcapResSelect');
    els.customRes = $('#webcapCustomRes');
    els.customResW = $('#webcapCustomResW');
    els.customResH = $('#webcapCustomResH');
    els.keepProps = $('#webcapKeepProps');
    els.idle = $('#webcapIdle');
    els.loading = $('#webcapLoading');
    els.container = $('#webcapContainer');
    els.image = $('#webcapImage');
    els.overlay = $('#webcapOverlay');
    els.selection = $('#webcapSelection');
    els.cropInfo = $('#webcapCropInfo');
    els.infoBar = $('#webcapInfoBar');
    els.exportPng = $('#webcapExportPng');
    els.exportJpg = $('#webcapExportJpg');
    els.previewBtn = $('#webcapPreviewBtn');
    els.previewModal = $('#webcapPreviewModal');
    els.previewClose = $('#webcapPreviewClose');
    els.previewCloseBtn = $('#webcapPreviewCloseBtn');
    els.previewCanvas = $('#webcapPreviewCanvas');
    els.previewDims = $('#webcapPreviewDims');
    els.pageInfo = $('#webcapPageInfo');
    els.infoGroup = $('#webcapInfoGroup');

    els.loadBtn.addEventListener('click', loadUrl);
    els.urlInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') loadUrl();
    });

    els.viewportSelect.addEventListener('change', function () {
      if (this.value === 'custom') {
        els.customViewport.classList.add('visible');
      } else {
        els.customViewport.classList.remove('visible');
        var parts = this.value.split('x');
        state.viewportW = parseInt(parts[0]);
        state.viewportH = parseInt(parts[1]);
      }
    });

    els.fullPageToggle.addEventListener('change', function () {
      state.fullPage = this.checked;
    });

    els.scaleGroup.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-scale]');
      if (!btn) return;
      els.scaleGroup.querySelectorAll('.control-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.scaleFactor = parseInt(btn.dataset.scale);
    });

    els.formatGroup.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-format]');
      if (!btn) return;
      els.formatGroup.querySelectorAll('.control-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      setFormat(btn.dataset.format);
    });

    els.resSelect.addEventListener('change', function () {
      state.outputRes = this.value;
      if (this.value === 'custom') {
        els.customRes.classList.add('visible');
      } else {
        els.customRes.classList.remove('visible');
      }
      updateOutputResolution();
    });

    els.customResW.addEventListener('input', updateOutputResolution);
    els.customResH.addEventListener('input', updateOutputResolution);

    els.keepProps.addEventListener('change', function () {
      state.keepProportions = this.checked;
      updateOutputResolution();
    });

    els.exportPng.addEventListener('click', function () { exportImage('png'); });
    els.exportJpg.addEventListener('click', function () { exportImage('jpg'); });

    els.previewBtn.addEventListener('click', showPreview);
    els.previewClose.addEventListener('click', hidePreview);
    els.previewCloseBtn.addEventListener('click', hidePreview);

    els.overlay.addEventListener('mousedown', onOverlayMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    window.addEventListener('resize', function () {
      if (state.loaded) updateLayout();
    });
  }

  function loadUrl() {
    var url = els.urlInput.value.trim();
    if (!url) return;

    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    els.urlInput.value = url;

    if (els.viewportSelect.value === 'custom') {
      state.viewportW = parseInt(els.customVpW.value) || 1920;
      state.viewportH = parseInt(els.customVpH.value) || 900;
    }

    els.idle.style.display = 'none';
    els.container.style.display = 'none';
    els.loading.style.display = 'flex';

    ipcRenderer.invoke('webcap-load-url', {
      url: url,
      viewportWidth: state.viewportW,
      viewportHeight: state.viewportH,
      fullPage: state.fullPage,
      scaleFactor: state.scaleFactor
    }).then(function (result) {
      els.loading.style.display = 'none';
      if (result.error) {
        alert('Error: ' + result.error);
        els.idle.style.display = 'flex';
        return;
      }
      showScreenshot(result);
    }).catch(function (err) {
      els.loading.style.display = 'none';
      alert('Error: ' + err.message);
      els.idle.style.display = 'flex';
    });
  }

  function showScreenshot(data) {
    state.imageBase64 = data.screenshot;
    state.imageWidth = data.width;
    state.imageHeight = data.height;
    state.loaded = true;

    els.image.src = 'data:image/png;base64,' + data.screenshot;
    els.image.onload = function () {
      els.container.style.display = 'block';
      els.idle.style.display = 'none';
      if (els.infoGroup) els.infoGroup.style.display = '';

      state.crop = { x: 0, y: 0, w: state.imageWidth, h: state.imageHeight };
      updateLayout();
      setFormat(state.format);
      els.selection.classList.add('active');

      if (els.pageInfo) els.pageInfo.textContent = data.width + ' \u00D7 ' + data.height + ' px (' + state.scaleFactor + 'x)';
    };
  }

  function updateLayout() {
    if (!state.loaded) return;

    var area = document.getElementById('webcapPreviewArea');
    if (!area) return;
    var rect = area.getBoundingClientRect();
    var pad = 30;
    var maxW = rect.width - pad * 2;
    var maxH = rect.height - pad * 2;

    var s = Math.min(maxW / state.imageWidth, maxH / state.imageHeight, 1);
    state.scale = s;

    var dw = Math.round(state.imageWidth * s);
    var dh = Math.round(state.imageHeight * s);
    state.displayWidth = dw;
    state.displayHeight = dh;

    els.container.style.width = dw + 'px';
    els.container.style.height = dh + 'px';

    updateSelectionDisplay();
  }

  function updateSelectionDisplay() {
    if (!state.loaded) return;

    var c = state.crop;
    var s = state.scale;

    var sl = els.selection.style;
    sl.left = Math.round(c.x * s) + 'px';
    sl.top = Math.round(c.y * s) + 'px';
    sl.width = Math.round(c.w * s) + 'px';
    sl.height = Math.round(c.h * s) + 'px';

    if (els.cropInfo) {
      els.cropInfo.textContent = Math.round(c.w) + ' \u00D7 ' + Math.round(c.h);
    }

    updateInfoBar();
  }

  function updateInfoBar() {
    if (!els.infoBar) return;
    var c = state.crop;
    var out = getEffectiveOutputSize();
    els.infoBar.innerHTML =
      '<span>Crop: ' + Math.round(c.w) + '\u00D7' + Math.round(c.h) + '</span>' +
      '<span>Pos: ' + Math.round(c.x) + ', ' + Math.round(c.y) + '</span>' +
      '<span>Output: ' + out.w + '\u00D7' + out.h + '</span>';
  }

  function setFormat(format) {
    state.format = format;
    state.aspectRatio = FORMAT_RATIOS[format] || null;

    if (state.loaded && state.aspectRatio) {
      fitCropToRatio();
    }

    updateOutputResolution();
    updateSelectionDisplay();
  }

  function fitCropToRatio() {
    var ratio = state.aspectRatio;
    if (!ratio || !state.loaded) return;

    var iw = state.imageWidth;
    var ih = state.imageHeight;
    var maxW = iw;
    var maxH = maxW / ratio;
    if (maxH > ih) {
      maxH = ih;
      maxW = maxH * ratio;
    }

    state.crop = {
      x: (iw - maxW) / 2,
      y: (ih - maxH) / 2,
      w: maxW,
      h: maxH
    };
  }

  function getEffectiveOutputSize() {
    var res = state.outputRes;
    var cropRatio = state.crop.w / Math.max(1, state.crop.h);

    if (res === 'custom') {
      var cw = parseInt(els.customResW.value) || 1920;
      var ch = parseInt(els.customResH.value) || 1080;
      if (state.keepProportions) {
        if (cw / cropRatio <= ch) {
          return { w: cw, h: Math.round(cw / cropRatio) };
        }
        return { w: Math.round(ch * cropRatio), h: ch };
      }
      return { w: cw, h: ch };
    }

    var base;
    if (res === '720p') base = 1280;
    else if (res === '1080p') base = 1920;
    else base = 3840;

    if (state.keepProportions) {
      if (cropRatio >= 1) {
        return { w: base, h: Math.round(base / cropRatio) };
      }
      return { h: base, w: Math.round(base * cropRatio) };
    }

    var ratio = state.aspectRatio;
    if (!ratio) {
      if (res === '720p') return { w: 1280, h: 720 };
      if (res === '1080p') return { w: 1920, h: 1080 };
      return { w: 3840, h: 2160 };
    }

    if (ratio >= 1) return { w: base, h: Math.round(base / ratio) };
    return { h: base, w: Math.round(base * ratio) };
  }

  function updateOutputResolution() {
    var out = getEffectiveOutputSize();
    state.outputWidth = out.w;
    state.outputHeight = out.h;
    updateInfoBar();
  }

  function renderCropToCanvas(canvas, format) {
    var img = new Image();
    img.onload = function () {
      var out = getEffectiveOutputSize();
      canvas.width = out.w;
      canvas.height = out.h;
      var ctx = canvas.getContext('2d');

      if (format === 'jpg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img,
        state.crop.x, state.crop.y, state.crop.w, state.crop.h,
        0, 0, out.w, out.h
      );
    };
    img.src = 'data:image/png;base64,' + state.imageBase64;
  }

  function showPreview() {
    if (!state.loaded || !state.imageBase64) return;

    updateOutputResolution();
    var out = getEffectiveOutputSize();
    els.previewDims.textContent = out.w + ' \u00D7 ' + out.h;

    renderCropToCanvas(els.previewCanvas, 'png');

    els.previewModal.style.display = 'flex';
  }

  function hidePreview() {
    els.previewModal.style.display = 'none';
  }

  function onOverlayMouseDown(e) {
    if (!state.loaded) return;
    e.preventDefault();

    var target = e.target;

    if (target.dataset && target.dataset.handle) {
      state.dragState = {
        type: 'resize',
        handle: target.dataset.handle,
        startCrop: { x: state.crop.x, y: state.crop.y, w: state.crop.w, h: state.crop.h },
        startMouseX: e.clientX,
        startMouseY: e.clientY
      };
    } else if (target === els.selection || els.selection.contains(target)) {
      state.dragState = {
        type: 'move',
        startCrop: { x: state.crop.x, y: state.crop.y, w: state.crop.w, h: state.crop.h },
        startMouseX: e.clientX,
        startMouseY: e.clientY
      };
    } else {
      var rect = els.overlay.getBoundingClientRect();
      var mx = (e.clientX - rect.left) / state.scale;
      var my = (e.clientY - rect.top) / state.scale;
      state.crop = { x: mx, y: my, w: 0, h: 0 };
      state.dragState = {
        type: 'create',
        startCrop: { x: mx, y: my, w: 0, h: 0 },
        startMouseX: e.clientX,
        startMouseY: e.clientY
      };
      updateSelectionDisplay();
    }
  }

  function onMouseMove(e) {
    if (!state.dragState) return;
    e.preventDefault();

    var ds = state.dragState;
    var dx = (e.clientX - ds.startMouseX) / state.scale;
    var dy = (e.clientY - ds.startMouseY) / state.scale;
    var sc = ds.startCrop;

    if (ds.type === 'create') {
      var x1 = sc.x;
      var y1 = sc.y;
      var x2 = sc.x + dx;
      var y2 = sc.y + dy;

      if (state.aspectRatio) {
        var ratio = state.aspectRatio;
        var cw = x2 - x1;
        var ch = y2 - y1;
        if (Math.abs(cw) / ratio > Math.abs(ch)) {
          ch = (Math.abs(cw) / ratio) * (ch < 0 ? -1 : 1);
        } else {
          cw = (Math.abs(ch) * ratio) * (cw < 0 ? -1 : 1);
        }
        x2 = x1 + cw;
        y2 = y1 + ch;
      }

      state.crop = {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        w: Math.abs(x2 - x1),
        h: Math.abs(y2 - y1)
      };
    } else if (ds.type === 'move') {
      state.crop.x = sc.x + dx;
      state.crop.y = sc.y + dy;
      state.crop.w = sc.w;
      state.crop.h = sc.h;
    } else if (ds.type === 'resize') {
      resizeCrop(ds.handle, dx, dy, sc);
    }

    constrainCrop();
    updateSelectionDisplay();
  }

  function resizeCrop(handle, dx, dy, sc) {
    var c = state.crop;
    c.x = sc.x; c.y = sc.y; c.w = sc.w; c.h = sc.h;

    switch (handle) {
      case 'se': c.w = sc.w + dx; c.h = sc.h + dy; break;
      case 'sw': c.x = sc.x + dx; c.w = sc.w - dx; c.h = sc.h + dy; break;
      case 'ne': c.w = sc.w + dx; c.y = sc.y + dy; c.h = sc.h - dy; break;
      case 'nw': c.x = sc.x + dx; c.w = sc.w - dx; c.y = sc.y + dy; c.h = sc.h - dy; break;
      case 'n': c.y = sc.y + dy; c.h = sc.h - dy; break;
      case 's': c.h = sc.h + dy; break;
      case 'e': c.w = sc.w + dx; break;
      case 'w': c.x = sc.x + dx; c.w = sc.w - dx; break;
    }

    c.w = Math.max(20, c.w);
    c.h = Math.max(20, c.h);

    if (state.aspectRatio) {
      applyAspectRatio(handle, sc);
    }
  }

  function applyAspectRatio(handle, sc) {
    var ratio = state.aspectRatio;
    var c = state.crop;

    switch (handle) {
      case 'se':
        if (c.w / ratio > c.h) c.h = c.w / ratio;
        else c.w = c.h * ratio;
        break;
      case 'ne':
        if (c.w / ratio > c.h) { c.h = c.w / ratio; }
        else { c.w = c.h * ratio; }
        c.y = sc.y + sc.h - c.h;
        break;
      case 'sw':
        if (c.w / ratio > c.h) { c.h = c.w / ratio; }
        else { c.w = c.h * ratio; }
        c.x = sc.x + sc.w - c.w;
        break;
      case 'nw':
        if (c.w / ratio > c.h) { c.h = c.w / ratio; }
        else { c.w = c.h * ratio; }
        c.x = sc.x + sc.w - c.w;
        c.y = sc.y + sc.h - c.h;
        break;
      case 'n':
      case 's':
        c.w = c.h * ratio;
        c.x = sc.x + (sc.w - c.w) / 2;
        if (handle === 'n') c.y = sc.y + sc.h - c.h;
        break;
      case 'e':
      case 'w':
        c.h = c.w / ratio;
        c.y = sc.y + (sc.h - c.h) / 2;
        if (handle === 'w') c.x = sc.x + sc.w - c.w;
        break;
    }
  }

  function constrainCrop() {
    var c = state.crop;
    var iw = state.imageWidth;
    var ih = state.imageHeight;

    if (c.w < 20) c.w = 20;
    if (c.h < 20) c.h = 20;
    if (c.x < 0) c.x = 0;
    if (c.y < 0) c.y = 0;
    if (c.x + c.w > iw) { c.x = Math.max(0, iw - c.w); }
    if (c.y + c.h > ih) { c.y = Math.max(0, ih - c.h); }
    if (c.w > iw) { c.w = iw; c.x = 0; }
    if (c.h > ih) { c.h = ih; c.y = 0; }
  }

  function onMouseUp() {
    if (!state.dragState) return;

    if (state.dragState.type === 'create' && (state.crop.w < 10 || state.crop.h < 10)) {
      if (state.aspectRatio) {
        fitCropToRatio();
      } else {
        state.crop = { x: 0, y: 0, w: state.imageWidth, h: state.imageHeight };
      }
      updateSelectionDisplay();
    }

    state.dragState = null;
    updateOutputResolution();
  }

  function exportImage(format) {
    if (!state.loaded || !state.imageBase64) return;

    updateOutputResolution();

    var ext = format === 'jpg' ? '.jpg' : '.png';
    var filterName = format === 'jpg' ? 'JPEG' : 'PNG';
    var filterExt = format === 'jpg' ? 'jpg' : 'png';

    ipcRenderer.invoke('save-dialog', {
      defaultName: 'webcap-' + Date.now() + ext,
      filters: [{ name: filterName, extensions: [filterExt] }]
    }).then(function (savePath) {
      if (!savePath) return;

      var img = new Image();
      img.onload = function () {
        var out = getEffectiveOutputSize();
        var canvas = document.createElement('canvas');
        canvas.width = out.w;
        canvas.height = out.h;
        var ctx = canvas.getContext('2d');

        if (format === 'jpg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img,
          state.crop.x, state.crop.y, state.crop.w, state.crop.h,
          0, 0, out.w, out.h
        );

        var dataUrl = format === 'jpg'
          ? canvas.toDataURL('image/jpeg', 0.95)
          : canvas.toDataURL('image/png');

        var base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        var buf = Buffer.from(base64, 'base64');
        fs.writeFileSync(savePath, buf);
      };
      img.src = 'data:image/png;base64,' + state.imageBase64;
    });
  }

  window.initWebcap = initWebcap;
  window.webcapActivate = function () {
    if (state.loaded) setTimeout(updateLayout, 50);
  };
})();
