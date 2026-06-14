(function () {
  'use strict';

  var ipcRenderer;
  try { ipcRenderer = require('electron').ipcRenderer; } catch (e) { console.error('[subtitles] require electron failed:', e); return; }

  var FONTS_LINK = '<link href="https://fonts.googleapis.com/css2?family=Bitter:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;0,900;1,400&family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@400;600;700;900&family=Lora:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;500;600;700;800&family=Merriweather:wght@400;700;900&family=Outfit:wght@400;500;600;700;800&family=Oswald:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Roboto+Slab:wght@400;700&family=Sora:wght@400;600;700;800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=Space+Grotesk:wght@400;600;700&family=Work+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">';

  var st = {
    filePath: null,
    fileName: null,
    audioPath: null,
    whisperSource: 'groq',
    groqApiKey: '',
    whisperModel: 'base',
    words: [],
    lines: [],
    format: '9:16',
    resolution: '1080p',
    bgMode: 'green',
    maxChars: 30,
    fontSize: 72,
    textColor: '#ffffff',
    highlightColor: '#facc15',
    fontFamily: 'Manrope',
    fontWeight: 800,
    positionY: 'bottom',
    textShadow: true,
    outlineWidth: 3,
    linesOnScreen: 1,
    animating: false,
    animGen: 0,
    transcribing: false,
    duration: 0,
    previewTime: 0
  };

  function getRes() {
    return RESOLUTIONS[st.format][st.resolution];
  }

  function updatePreviewSize() {
    var area = $('[data-tool="subtitles"] .preview-area');
    var canvas = $('#subPreviewCanvas');
    if (!area || !canvas) return;

    var res = getRes();
    var w = res[0], h = res[1];
    var areaW = area.clientWidth - 40;
    var areaH = area.clientHeight - 40;
    var scale = Math.min(areaW / w, areaH / h);
    var displayW = Math.round(w * scale);
    var displayH = Math.round(h * scale);

    var wrapper = $('#subPreviewWrapper');
    if (wrapper) {
      wrapper.style.width = displayW + 'px';
      wrapper.style.height = displayH + 'px';
    }

    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.style.transform = 'scale(' + scale + ')';
    canvas.style.transformOrigin = '0 0';

    var info = $('#subResolutionInfo');
    if (info) info.textContent = w + ' \u00D7 ' + h;
  }

  function isSentenceEnd(word) {
    return /[.!?…]$/.test(word);
  }

  function breakIntoLines(words, maxChars) {
    if (!words || !words.length) return [];
    var raw = [];
    var cur = [];
    var len = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      var wordLen = w.word.length;
      var addLen = wordLen + (cur.length > 0 ? 1 : 0);
      var endsSentence = isSentenceEnd(w.word);

      if (len + addLen > maxChars && cur.length > 0) {
        raw.push({ words: cur.slice(), start: cur[0].start, end: cur[cur.length - 1].end });
        cur = [];
        len = 0;
      }

      cur.push(w);
      len += wordLen + (cur.length > 1 ? 1 : 0);

      if (endsSentence && cur.length > 0) {
        raw.push({ words: cur.slice(), start: cur[0].start, end: cur[cur.length - 1].end });
        cur = [];
        len = 0;
      }
    }
    if (cur.length > 0) {
      raw.push({ words: cur.slice(), start: cur[0].start, end: cur[cur.length - 1].end });
    }

    var lines = [];
    for (var r = 0; r < raw.length; r++) {
      var seg = raw[r];
      var tmp = [];
      var tmpLen = 0;
      for (var j = 0; j < seg.words.length; j++) {
        var ww = seg.words[j];
        var wwLen = ww.word.length + (tmp.length > 0 ? 1 : 0);
        if (tmpLen + wwLen > maxChars && tmp.length > 0) {
          lines.push({ words: tmp.slice(), start: tmp[0].start, end: tmp[tmp.length - 1].end });
          tmp = [];
          tmpLen = 0;
        }
        tmp.push(ww);
        tmpLen += ww.word.length + (tmp.length > 1 ? 1 : 0);
      }
      if (tmp.length > 0) {
        lines.push({ words: tmp.slice(), start: tmp[0].start, end: tmp[tmp.length - 1].end });
      }
    }
    return lines;
  }

  function rebuildLines() {
    st.lines = breakIntoLines(st.words, st.maxChars);
    st.duration = st.lines.length > 0 ? st.lines[st.lines.length - 1].end + 0.5 : 0;
  }

  function getStateAtTime(t) {
    if (!st.lines.length) return null;
    for (var i = 0; i < st.lines.length; i++) {
      var line = st.lines[i];
      if (t >= line.start - 0.1 && t <= line.end + 0.15) {
        var activeWordIdx = -1;
        for (var j = 0; j < line.words.length; j++) {
          if (t >= line.words[j].start - 0.05 && t <= line.words[j].end + 0.05) {
            activeWordIdx = j;
            break;
          }
        }
        return { lineIdx: i, line: line, activeWordIdx: activeWordIdx };
      }
    }
    return null;
  }

  function getFrameStateKey(t) {
    for (var i = 0; i < st.lines.length; i++) {
      var line = st.lines[i];
      if (t >= line.start - 0.1 && t <= line.end + 0.15) {
        var active = [];
        for (var j = 0; j < line.words.length; j++) {
          if (t >= line.words[j].start - 0.05 && t <= line.words[j].end + 0.05) {
            active.push(j);
          }
        }
        return i + ':' + active.join(',');
      }
    }
    return 'blank';
  }

  function buildExportFrameSpecs(totalFrames, fps) {
    var specs = [];
    for (var i = 0; i < totalFrames; i++) {
      var time = i / fps;
      var key = getFrameStateKey(time);
      var last = specs[specs.length - 1];
      if (last && last.key === key) {
        last.duration++;
      } else {
        specs.push({
          key: key,
          time: time,
          duration: 1
        });
      }
    }
    return specs;
  }

  function makeShadowCSS(width) {
    if (!width || width <= 0) return '';
    var parts = [];
    for (var a = 0; a < 8; a++) {
      var angle = a * Math.PI / 4;
      parts.push(Math.round(Math.cos(angle) * width) + 'px ' + Math.round(Math.sin(angle) * width) + 'px 0 #000');
    }
    return 'text-shadow:' + parts.join(',') + ';';
  }

  function renderPreviewContent() {
    var canvas = $('#subPreviewCanvas');
    if (!canvas) return;

    var bgColor = st.bgMode === 'green' ? '#00FF00' : '#0000FF';

    var posCSS;
    if (st.positionY === 'bottom') posCSS = 'bottom:12%';
    else if (st.positionY === 'center') posCSS = 'top:50%;transform:translateY(-50%)';
    else posCSS = 'top:12%';

    var shadowStr = st.textShadow ? makeShadowCSS(st.outlineWidth) : '';
    var gap = Math.round(st.fontSize * 0.15) + 'px';
    var wordPad = Math.round(st.fontSize * 0.04) + 'px';

    var state = st.animating ? getStateAtTime(st.previewTime) : null;
    if (!state && st.lines.length > 0) {
      state = { lineIdx: 0, line: st.lines[0], activeWordIdx: 0 };
    }

    var html = '<div style="width:100%;height:100%;background:' + bgColor + ';position:relative;overflow:hidden">';
    html += '<div style="position:absolute;left:0;right:0;' + posCSS + ';display:flex;flex-direction:column;align-items:center;gap:' + gap + ';padding:0 5%">';

    if (state) {
      var startIdx = state.lineIdx;
      var endIdx = Math.min(startIdx + st.linesOnScreen, st.lines.length);
      for (var i = startIdx; i < endIdx; i++) {
        html += '<div style="display:flex;flex-wrap:wrap;justify-content:center">';
        for (var j = 0; j < st.lines[i].words.length; j++) {
          var isActive = (i === state.lineIdx && j === state.activeWordIdx);
          var color = isActive ? st.highlightColor : st.textColor;
          html += '<span style="font-family:\'' + st.fontFamily + '\',sans-serif;font-weight:' + st.fontWeight +
            ';font-size:' + st.fontSize + 'px;color:' + color +
            ';padding:0 ' + wordPad + ';white-space:pre;' + shadowStr + '">' +
            escapeHTML(st.lines[i].words[j].word) + '</span>';
        }
        html += '</div>';
      }
    } else {
      var demoWords = st.transcribing
        ? ['Transcribing...']
        : ['Hello', 'World', 'Demo'];
      html += '<div style="display:flex;flex-wrap:wrap;justify-content:center">';
      for (var d = 0; d < demoWords.length; d++) {
        var color = d === 0 ? st.highlightColor : st.textColor;
        html += '<span style="font-family:\'' + st.fontFamily + '\',sans-serif;font-weight:' + st.fontWeight +
          ';font-size:' + st.fontSize + 'px;color:' + color +
          ';padding:0 ' + wordPad + ';white-space:pre;' + shadowStr + '">' +
          demoWords[d] + '</span>';
      }
      html += '</div>';
      if (!st.transcribing) {
        html += '<div style="font-family:\'' + st.fontFamily + '\',sans-serif;font-size:' + Math.round(st.fontSize * 0.3) + 'px;color:' +
          (st.bgMode === 'green' ? '#005500' : '#000055') +
          ';margin-top:' + Math.round(st.fontSize * 0.4) + 'px">Upload audio/video and transcribe</div>';
      }
    }

    html += '</div></div>';
    canvas.innerHTML = html;
  }

  function playPreview() {
    if (st.animating || !st.lines.length) return;
    st.animating = true;
    var gen = ++st.animGen;
    var startTime = performance.now();

    function tick(now) {
      if (gen !== st.animGen) return;
      var elapsed = (now - startTime) / 1000;
      st.previewTime = elapsed;
      if (elapsed > st.duration) {
        st.animating = false;
        st.previewTime = 0;
        renderPreviewContent();
        return;
      }
      renderPreviewContent();
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function stopPreview() {
    st.animating = false;
    st.animGen++;
    st.previewTime = 0;
    renderPreviewContent();
  }

  function setStatus(text, type) {
    var el = $('#subStatus');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'sub-status' + (type ? ' ' + type : '');
  }

  async function transcribe() {
    if (!st.filePath) {
      setStatus('Select a file first', 'error');
      return;
    }
    if (st.whisperSource === 'groq' && !st.groqApiKey) {
      setStatus('Enter Groq API key', 'error');
      return;
    }

    st.transcribing = true;
    st.words = [];
    st.lines = [];
    setStatus('Extracting audio...', '');
    renderPreviewContent();

    try {
      var extractResult = await ipcRenderer.invoke('subtitles-extract-audio', { mediaPath: st.filePath });
      if (extractResult.error) {
        setStatus(extractResult.error, 'error');
        st.transcribing = false;
        return;
      }
      var audioPath = extractResult.audioPath;

      setStatus('Transcribing with ' + (st.whisperSource === 'groq' ? 'Groq API...' : 'Whisper (' + st.whisperModel + ')...'), '');

      var result;
      if (st.whisperSource === 'groq') {
        result = await ipcRenderer.invoke('subtitles-whisper-groq', { audioPath: audioPath, apiKey: st.groqApiKey });
      } else {
        result = await ipcRenderer.invoke('subtitles-whisper-local', { audioPath: audioPath, model: st.whisperModel });
      }

      if (result.error) {
        setStatus(result.error, 'error');
        st.transcribing = false;
        return;
      }

      if (!result.words || result.words.length === 0) {
        setStatus('No words detected', 'error');
        st.transcribing = false;
        return;
      }

      st.words = result.words;
      st.duration = result.duration || (st.words[st.words.length - 1].end + 0.5);
      rebuildLines();
      setStatus(st.words.length + ' words, ' + st.lines.length + ' lines (' + Math.round(st.duration) + 's)', 'success');
      renderPreviewContent();
    } catch (e) {
      setStatus('Error: ' + e.message, 'error');
    }
    st.transcribing = false;
  }

  function buildExportHTML() {
    var res = getRes();
    var w = res[0], h = res[1];
    var bgColor = st.bgMode === 'green' ? '#00FF00' : '#0000FF';

    var posCSS;
    if (st.positionY === 'bottom') posCSS = 'bottom:12%';
    else if (st.positionY === 'center') posCSS = 'top:50%;transform:translateY(-50%)';
    else posCSS = 'top:12%';

    var shadowStr = '';
    if (st.textShadow && st.outlineWidth > 0) {
      var sParts = [];
      for (var a = 0; a < 8; a++) {
        var angle = a * Math.PI / 4;
        sParts.push('' + Math.round(Math.cos(angle) * st.outlineWidth) + 'px ' + Math.round(Math.sin(angle) * st.outlineWidth) + 'px 0 #000');
      }
      shadowStr = sParts.join(',');
    }

    var gap = Math.round(st.fontSize * 0.15);
    var wordPad = Math.round(st.fontSize * 0.04);

    return '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      FONTS_LINK +
      '<style>' +
      '*{margin:0;padding:0;box-sizing:border-box}' +
      'html,body{width:' + w + 'px;height:' + h + 'px;overflow:hidden;background:' + bgColor + '}' +
      '#c{position:absolute;left:0;right:0;' + posCSS + ';display:flex;flex-direction:column;align-items:center;gap:' + gap + 'px;padding:0 5%}' +
      '.sl{display:flex;flex-wrap:wrap;justify-content:center}' +
      '.sw{font-family:\'' + st.fontFamily + '\',sans-serif;font-weight:' + st.fontWeight +
      ';font-size:' + st.fontSize + 'px;color:' + st.textColor +
      ';padding:0 ' + wordPad + 'px;white-space:pre;' +
      (shadowStr ? 'text-shadow:' + shadowStr + ';' : '') + '}' +
      '.sw.a{color:' + st.highlightColor + '}' +
      '</style></head><body>' +
      '<div id="c"></div>' +
      '<script>' +
      'var L=' + JSON.stringify(st.lines) + ';var LS=' + st.linesOnScreen + ';' +
      'window._seek=function(t){' +
        'var c=document.getElementById("c");c.innerHTML="";' +
        'var ci=-1;' +
        'for(var i=0;i<L.length;i++){if(t>=L[i].start-0.1&&t<=L[i].end+0.15){ci=i;break}}' +
        'if(ci<0)return;' +
        'var ei=Math.min(ci+LS,L.length);' +
        'for(var i=ci;i<ei;i++){' +
          'var d=document.createElement("div");d.className="sl";' +
          'for(var j=0;j<L[i].words.length;j++){' +
            'var s=document.createElement("span");s.className="sw";' +
            'if(i===ci&&t>=L[i].words[j].start-0.05&&t<=L[i].words[j].end+0.05)s.className="sw a";' +
            's.textContent=L[i].words[j].word;d.appendChild(s)' +
          '}' +
          'c.appendChild(d)' +
        '}' +
      '};' +
      '<\/script></body></html>';
  }

  async function exportSRT() {
    if (st.lines.length === 0) {
      setStatus('No subtitles to export', 'error');
      return;
    }

    var savePath = await ipcRenderer.invoke('save-dialog', {
      defaultName: 'subtitles.srt',
      filters: [{ name: 'SRT', extensions: ['srt'] }]
    });
    if (!savePath) return;

    var lines = [];
    for (var i = 0; i < st.lines.length; i++) {
      var line = st.lines[i];
      var sh = Math.floor(line.start / 3600);
      var sm = Math.floor((line.start % 3600) / 60);
      var ss = Math.floor(line.start % 60);
      var sms = Math.round((line.start % 1) * 1000);
      var eh = Math.floor(line.end / 3600);
      var em = Math.floor((line.end % 3600) / 60);
      var es = Math.floor(line.end % 60);
      var ems = Math.round((line.end % 1) * 1000);

      var text = line.words.map(function (w) { return w.word; }).join(' ');

      lines.push(String(i + 1));
      lines.push(pad(sh, 2) + ':' + pad(sm, 2) + ':' + pad(ss, 2) + ',' + pad(sms, 3) + ' --> ' + pad(eh, 2) + ':' + pad(em, 2) + ':' + pad(es, 2) + ',' + pad(ems, 3));
      lines.push(text);
      lines.push('');
    }

    var srtContent = lines.join('\r\n');
    await ipcRenderer.invoke('write-file-utf8', { path: savePath, content: srtContent });
    setStatus('Exported SRT: ' + st.lines.length + ' lines', 'success');
  }

  function pad(n, w) {
    return String(n).padStart(w, '0');
  }

  async function exportVideo(format) {
    if (st.lines.length === 0) {
      setStatus('No subtitles to export', 'error');
      return;
    }

    var ext = format === 'mov' ? 'mov' : format === 'webm' ? 'webm' : 'mp4';
    var savePath = await ipcRenderer.invoke('save-dialog', {
      defaultName: 'subtitles-' + Date.now() + '.' + ext,
      filters: [{ name: ext.toUpperCase(), extensions: [ext] }]
    });
    if (!savePath) return;

    var setExporting = makeSetExporting('sub');
    setExporting(true, 'Preparing...', 0);

    try {
      var res = getRes();
      var w = res[0], h = res[1];
      var fps = 30;
      var totalFrames = Math.ceil(st.duration * fps);

      var html = buildExportHTML();
      await ipcRenderer.invoke('bg-load-html', { html: html, width: w, height: h });
      await ipcRenderer.invoke('bg-eval', 'document.fonts.ready');
      setExporting(true, 'Rendering frames...', 5);

      var frameSpecs = buildExportFrameSpecs(totalFrames, fps);
      var BATCH_SIZE = 50;
      var frameData = [];
      for (var batchStart = 0; batchStart < frameSpecs.length; batchStart += BATCH_SIZE) {
        var batchEnd = Math.min(batchStart + BATCH_SIZE, frameSpecs.length);
        var frames = [];
        for (var i = batchStart; i < batchEnd; i++) {
          frames.push({
            js: 'window._seek(' + frameSpecs[i].time.toFixed(4) + ')',
            waitForPaint: true
          });
        }

        var batchData = await ipcRenderer.invoke('bg-eval-capture-batch', {
          frames: frames,
          format: format === 'mp4' ? 'jpeg' : 'png'
        });
        for (var j = 0; j < batchData.length; j++) {
          frameData.push(batchData[j]);
        }

        var pct = 5 + Math.round((batchEnd / frameSpecs.length) * 80);
        setExporting(true, 'State ' + batchEnd + '/' + frameSpecs.length, pct);
      }

      if (frameData.length === 0) {
        setStatus('Export failed - no frames captured', 'error');
        setExporting(false);
        await ipcRenderer.invoke('bg-cleanup');
        return;
      }

      var exportFrames = [];
      for (var k = 0; k < frameData.length; k++) {
        exportFrames.push({ data: frameData[k], duration: frameSpecs[k].duration });
      }
      exportFrames.push({ data: exportFrames[exportFrames.length - 1].data, duration: Math.round(fps * 0.5) });

      setExporting(true, 'Encoding ' + ext.toUpperCase() + '...', 90);

      var ipcMethod = format === 'mov' ? 'export-mov' : format === 'webm' ? 'export-webm' : 'export-mp4';
      await ipcRenderer.invoke(ipcMethod, { frames: exportFrames, savePath: savePath, fps: fps, width: w, height: h });
      await ipcRenderer.invoke('bg-cleanup');

      setExporting(false);
      setStatus('Exported: ' + ext.toUpperCase(), 'success');
    } catch (e) {
      console.error('[subtitles] export error:', e);
      setStatus('Export error: ' + e.message, 'error');
      setExporting(false);
      try { await ipcRenderer.invoke('bg-cleanup'); } catch (_) {}
    }
  }

  var controlsBound = false;

  function bindControls() {
    if (controlsBound) return;
    controlsBound = true;
    console.log('[subtitles] bindControls start');

    var browseBtn = document.getElementById('subBrowseFile');
    console.log('[subtitles] browseBtn:', browseBtn);
    if (browseBtn) {
      browseBtn.addEventListener('click', function () {
        console.log('[subtitles] browse clicked');
        ipcRenderer.invoke('subtitles-select-file').then(function (filePath) {
          if (filePath) {
            st.filePath = filePath;
            st.fileName = filePath.split(/[\\/]/).pop();
            document.getElementById('subFilePath').value = st.fileName;
          }
        });
      });
    }

    var whisperBtns = document.querySelectorAll('#subWhisperGroup .control-btn');
    console.log('[subtitles] whisperBtns:', whisperBtns.length);
    whisperBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        whisperBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.whisperSource = btn.dataset.source;
        var groqGroup = document.getElementById('subGroqGroup');
        var localGroup = document.getElementById('subLocalGroup');
        if (groqGroup) groqGroup.style.display = st.whisperSource === 'groq' ? '' : 'none';
        if (localGroup) localGroup.style.display = st.whisperSource === 'local' ? '' : 'none';
      });
    });

    var groqKey = document.getElementById('subGroqKey');
    if (groqKey) groqKey.addEventListener('input', function (e) { st.groqApiKey = e.target.value; });

    var whisperModel = document.getElementById('subWhisperModel');
    if (whisperModel) whisperModel.addEventListener('change', function (e) { st.whisperModel = e.target.value; });

    var transcribeBtn = document.getElementById('subTranscribeBtn');
    console.log('[subtitles] transcribeBtn:', transcribeBtn);
    if (transcribeBtn) transcribeBtn.addEventListener('click', function () { transcribe(); });

    var formatBtns = document.querySelectorAll('#subFormatGroup .control-btn');
    formatBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        formatBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.format = btn.dataset.format;
        updatePreviewSize();
        renderPreviewContent();
      });
    });

    var resSelect = document.getElementById('subResolutionSelect');
    if (resSelect) resSelect.addEventListener('change', function (e) {
      st.resolution = e.target.value;
      updatePreviewSize();
      renderPreviewContent();
    });

    var bgBtns = document.querySelectorAll('#subBgGroup .control-btn');
    bgBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        bgBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.bgMode = btn.dataset.bg;
        renderPreviewContent();
      });
    });

    var maxCharsEl = document.getElementById('subMaxChars');
    if (maxCharsEl) maxCharsEl.addEventListener('input', function (e) {
      st.maxChars = parseInt(e.target.value);
      var valEl = document.getElementById('subMaxCharsVal');
      if (valEl) valEl.textContent = st.maxChars;
      rebuildLines();
      renderPreviewContent();
    });

    var fontSizeEl = document.getElementById('subFontSize');
    if (fontSizeEl) fontSizeEl.addEventListener('input', function (e) {
      st.fontSize = parseInt(e.target.value);
      var valEl = document.getElementById('subFontSizeVal');
      if (valEl) valEl.textContent = st.fontSize + 'px';
      renderPreviewContent();
    });

    var fontFam = document.getElementById('subFontFamily');
    if (fontFam) fontFam.addEventListener('change', function (e) {
      st.fontFamily = e.target.value;
      renderPreviewContent();
    });

    var textCol = document.getElementById('subTextColor');
    if (textCol) textCol.addEventListener('input', function (e) { st.textColor = e.target.value; renderPreviewContent(); });

    var hlCol = document.getElementById('subHighlightColor');
    if (hlCol) hlCol.addEventListener('input', function (e) { st.highlightColor = e.target.value; renderPreviewContent(); });

    var posBtns = document.querySelectorAll('#subPositionGroup .control-btn');
    posBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        posBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.positionY = btn.dataset.pos;
        renderPreviewContent();
      });
    });

    var linesEl = document.getElementById('subLinesOnScreen');
    if (linesEl) linesEl.addEventListener('input', function (e) {
      st.linesOnScreen = parseInt(e.target.value);
      var valEl = document.getElementById('subLinesOnScreenVal');
      if (valEl) valEl.textContent = st.linesOnScreen;
      renderPreviewContent();
    });

    var shadowEl = document.getElementById('subTextShadow');
    if (shadowEl) shadowEl.addEventListener('change', function (e) { st.textShadow = e.target.checked; renderPreviewContent(); });

    var outlineEl = document.getElementById('subOutlineWidth');
    if (outlineEl) outlineEl.addEventListener('input', function (e) {
      st.outlineWidth = parseInt(e.target.value);
      var valEl = document.getElementById('subOutlineWidthVal');
      if (valEl) valEl.textContent = st.outlineWidth;
      renderPreviewContent();
    });

    var playBtn = document.getElementById('subPlayBtn');
    if (playBtn) playBtn.addEventListener('click', function () {
      if (st.animating) stopPreview(); else playPreview();
    });

    var stopBtn = document.getElementById('subStopBtn');
    if (stopBtn) stopBtn.addEventListener('click', function () { stopPreview(); });

    var exportMp4 = document.getElementById('subExportMp4');
    if (exportMp4) exportMp4.addEventListener('click', function () { exportVideo('mp4'); });

    var exportMov = document.getElementById('subExportMov');
    if (exportMov) exportMov.addEventListener('click', function () { exportVideo('mov'); });

  var exportWebm = document.getElementById('subExportWebm');
  if (exportWebm) exportWebm.addEventListener('click', function () { exportVideo('webm'); });

  var exportSrt = document.getElementById('subExportSrt');
  if (exportSrt) exportSrt.addEventListener('click', function () { exportSRT(); });

    console.log('[subtitles] bindControls done');
  }

  function loadEnvApiKey() {
    ipcRenderer.invoke('get-env', 'GROQ_API_KEY').then(function (key) {
      if (key && !st.groqApiKey) {
        st.groqApiKey = key;
        var el = document.getElementById('subGroqKey');
        if (el) el.value = key;
      }
    });
  }

  window.initSubtitlesTool = function () {
    bindControls();
    loadEnvApiKey();
    updatePreviewSize();
    renderPreviewContent();
  };

  window.subtitlesActivate = function () {
    try { bindControls(); loadEnvApiKey(); } catch (e) { console.error('[subtitles] activate bindControls:', e); }
    setTimeout(function () {
      updatePreviewSize();
      renderPreviewContent();
    }, 150);
  };
})();
