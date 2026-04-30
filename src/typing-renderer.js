/* ═══════════════════════════════════════
   TYPING ANIMATION TOOL
   ═══════════════════════════════════════ */

const typingState = {
  format: '16:9',
  resolution: '1080p',
  theme: 'editor',
  sequences: [
    { action: 'type', text: 'Cześć!' },
    { action: 'pause', duration: 600 },
    { action: 'newline' },
    { action: 'newline' },
    { action: 'type', text: 'Jak się masz?' },
    { action: 'pause', duration: 800 },
    { action: 'delete', count: 7 },
    { action: 'pause', duration: 400 },
    { action: 'type', text: 'świetnie!' },
  ],
  typeSpeed: 80,
  delSpeed: 40,
  fontSize: 20,
  bgColor: '#1e1e2e',
  textColor: '#cdd6f4',
  cursorColor: '#f5e0dc',
  startDelay: 500,
  endDelay: 1500,
  cursorBlink: true,
  playing: false,
  themeFields: {
    editor: { title: 'untitled.txt' },
    terminal: { title: 'Terminal', prompt: 'user@machine:~$' },
    email: { title: 'New Message', to: 'jan@example.com', subject: 'Ważna wiadomość' },
    sms: { avatar: 'J', contactName: 'Jan', status: 'online', bubbleColor: '#6366f1', timestamp: '14:32' },
    generic: {},
  },
};

let typingAnimId = null;

function typingGetResolution() {
  return RESOLUTIONS[typingState.format][typingState.resolution];
}

function typingUpdatePreviewSize() {
  const [w, h] = typingGetResolution();
  const area = $('#typingPreviewArea');
  if (!area) return;
  const areaW = area.clientWidth - 60;
  const areaH = area.clientHeight - 60;
  const scale = Math.min(areaW / w, areaH / h, 1);
  const displayW = Math.round(w * scale);
  const displayH = Math.round(h * scale);

  const wrapper = $('#typingPreviewWrapper');
  wrapper.style.width = displayW + 'px';
  wrapper.style.height = displayH + 'px';

  const canvas = $('#typingPreviewCanvas');
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.style.zoom = scale;
  canvas.style.transform = '';
  canvas.style.transformOrigin = '';

  const [fullW, fullH] = typingGetResolution();
  $('#globalResInfo').textContent = `${fullW}x${fullH}`;
}

function typingEscapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

function typingBuildTimeline() {
  const states = [];
  const pauses = [];
  let time = 0;
  let text = '';

  for (const seq of typingState.sequences) {
    const tSpeed = seq.speed ?? typingState.typeSpeed;
    const dSpeed = seq.speed ?? typingState.delSpeed;

    switch (seq.action) {
      case 'type':
        if (seq.text) {
          for (const ch of seq.text) {
            text += ch;
            states.push({ time, text });
            time += tSpeed;
          }
        }
        break;
      case 'delete': {
        const count = Math.min(seq.count ?? 1, text.length);
        for (let i = 0; i < count; i++) {
          text = text.slice(0, -1);
          states.push({ time, text });
          time += dSpeed;
        }
        break;
      }
      case 'deleteAll':
        while (text.length > 0) {
          text = text.slice(0, -1);
          states.push({ time, text });
          time += dSpeed;
        }
        break;
      case 'pause': {
        const dur = seq.duration ?? 500;
        pauses.push({ start: time, end: time + dur });
        time += dur;
        break;
      }
      case 'newline':
        text += '\n';
        states.push({ time, text });
        time += tSpeed;
        break;
    }
  }

  return { states, pauses, totalDuration: time, finalText: text };
}

function typingGetTextAtTime(timeline, T) {
  let text = '';
  for (const s of timeline.states) {
    if (s.time > T) break;
    text = s.text;
  }
  return text;
}

function typingIsInPause(pauses, T) {
  for (const p of pauses) {
    if (T >= p.start && T < p.end) return true;
  }
  return false;
}

function typingCursorHTML(visible, solidCursor) {
  if (!visible) return '';
  const s = `display:inline-block;width:2px;height:1.1em;vertical-align:text-bottom;margin-left:1px;background:${typingState.cursorColor}`;
  if (typingState.cursorBlink && !solidCursor) {
    return `<span class="typing-cursor" style="${s}"></span>`;
  }
  return `<span style="${s}"></span>`;
}

function typingRenderTheme(theme, contentHTML) {
  const bg = typingState.bgColor;
  const fg = typingState.textColor;
  const fs = typingState.fontSize;
  const f = typingState.themeFields[theme] || {};
  switch (theme) {
    case 'editor': return typingThemeEditor(contentHTML, bg, fg, fs, f);
    case 'terminal': return typingThemeTerminal(contentHTML, bg, fg, fs, f);
    case 'email': return typingThemeEmail(contentHTML, bg, fg, fs, f);
    case 'sms': return typingThemeSMS(contentHTML, bg, fg, fs, f);
    default: return typingThemeGeneric(contentHTML, bg, fg, fs);
  }
}

function typingThemeEditor(html, bg, fg, fs, f) {
  const title = typingEscapeHTML(f.title || '');
  return `<div class="typing-render" style="width:100%;height:100%;display:flex;flex-direction:column;background:${bg};color:${fg};font-size:${fs}px;font-family:'JetBrains Mono','Courier New',monospace">
    <div style="flex-shrink:0;display:flex;align-items:center;gap:8px;background:${bg};border-bottom:1px solid rgba(255,255,255,0.08);padding:clamp(8px,1.2vw,14px) clamp(12px,2vw,20px)">
      <div style="display:flex;gap:6px"><div style="width:12px;height:12px;border-radius:50%;background:#f38ba8"></div><div style="width:12px;height:12px;border-radius:50%;background:#f9e2af"></div><div style="width:12px;height:12px;border-radius:50%;background:#a6e3a1"></div></div>
      <div style="flex:1;text-align:center;font-size:clamp(10px,1.1vw,13px);opacity:0.4">${title}</div>
    </div>
    <div style="flex:1;overflow:hidden;padding:clamp(16px,3vw,40px)"><div class="typing-text">${html}</div></div>
  </div>`;
}

function typingThemeTerminal(html, bg, fg, fs, f) {
  const title = typingEscapeHTML(f.title || '');
  const prompt = typingEscapeHTML(f.prompt || '');
  return `<div class="typing-render" style="width:100%;height:100%;display:flex;flex-direction:column;background:${bg};color:${fg};font-size:${fs}px;font-family:'JetBrains Mono','Courier New',monospace">
    <div style="flex-shrink:0;display:flex;align-items:center;gap:8px;background:${bg};border-bottom:1px solid rgba(255,255,255,0.08);padding:clamp(8px,1.2vw,14px) clamp(12px,2vw,20px)">
      <div style="display:flex;gap:6px"><div style="width:12px;height:12px;border-radius:50%;background:#f38ba8"></div><div style="width:12px;height:12px;border-radius:50%;background:#f9e2af"></div><div style="width:12px;height:12px;border-radius:50%;background:#a6e3a1"></div></div>
      <div style="flex:1;text-align:center;font-size:clamp(10px,1.1vw,13px);opacity:0.4">${title}</div>
    </div>
    <div style="flex:1;overflow:hidden;padding:clamp(16px,3vw,40px)"><div class="typing-text"><span style="color:#a6e3a1;font-weight:600">${prompt}&nbsp;</span>${html}</div></div>
  </div>`;
}

function typingThemeEmail(html, bg, fg, fs, f) {
  const title = typingEscapeHTML(f.title || '');
  const to = typingEscapeHTML(f.to || '');
  const subject = typingEscapeHTML(f.subject || '');
  return `<div class="typing-render" style="width:100%;height:100%;display:flex;flex-direction:column;background:${bg};color:${fg};font-size:${fs}px;font-family:'JetBrains Mono','Courier New',monospace">
    <div style="flex-shrink:0;display:flex;flex-direction:column;gap:clamp(4px,0.6vw,8px);background:${bg};border-bottom:1px solid rgba(255,255,255,0.08);padding:clamp(10px,1.5vw,18px) clamp(14px,2vw,28px)">
      <div style="font-weight:700;font-size:clamp(13px,1.5vw,18px)">${title}</div>
      <div style="display:flex;gap:8px;font-size:clamp(10px,1.1vw,13px)"><span style="opacity:0.4;min-width:50px">To:</span><span style="opacity:0.6">${to}</span></div>
      <div style="display:flex;gap:8px;font-size:clamp(10px,1.1vw,13px)"><span style="opacity:0.4;min-width:50px">Subject:</span><span style="opacity:0.6">${subject}</span></div>
    </div>
    <div style="flex:1;overflow:hidden;padding:clamp(16px,3vw,40px)"><div class="typing-text">${html}</div></div>
  </div>`;
}

function typingThemeSMS(html, bg, fg, fs, f) {
  const avatar = typingEscapeHTML(f.avatar || '');
  const contactName = typingEscapeHTML(f.contactName || '');
  const status = typingEscapeHTML(f.status || '');
  const bubbleColor = f.bubbleColor || '#6366f1';
  const timestamp = typingEscapeHTML(f.timestamp || '');
  return `<div class="typing-render" style="width:100%;height:100%;display:flex;flex-direction:column;background:${bg};color:${fg};font-size:${fs}px;font-family:'JetBrains Mono','Courier New',monospace">
    <div style="flex-shrink:0;display:flex;align-items:center;gap:clamp(8px,1vw,14px);background:${bg};border-bottom:1px solid rgba(255,255,255,0.08);padding:clamp(10px,1.5vw,18px) clamp(14px,2vw,28px)">
      <div style="width:clamp(28px,3vw,36px);height:clamp(28px,3vw,36px);border-radius:50%;background:${bubbleColor};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:clamp(11px,1.2vw,14px);color:#fff;flex-shrink:0">${avatar}</div>
      <div><div style="font-weight:700;font-size:clamp(12px,1.4vw,16px)">${contactName}</div><div style="font-size:clamp(8px,0.8vw,11px);opacity:0.4">${status}</div></div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(12px,2vw,24px)">
      <div style="max-width:80%;align-self:flex-end;background:${bubbleColor};color:#fff;padding:clamp(10px,1.3vw,16px) clamp(12px,1.5vw,20px);border-radius:clamp(16px,2vw,24px);border-bottom-right-radius:clamp(4px,0.5vw,8px);line-height:1.5;font-size:clamp(12px,1.4vw,16px);white-space:pre-wrap;word-break:break-all">${html}</div>
      <div style="font-size:clamp(8px,0.8vw,11px);opacity:0.3;margin-top:6px;text-align:right">${timestamp}</div>
    </div>
  </div>`;
}

function typingThemeGeneric(html, bg, fg, fs) {
  return `<div class="typing-render" style="width:100%;height:100%;display:flex;flex-direction:column;background:${bg};color:${fg};font-size:${fs}px;font-family:'JetBrains Mono','Courier New',monospace">
    <div style="flex:1;overflow:hidden;padding:clamp(24px,5vw,60px)"><div class="typing-text">${html}</div></div>
  </div>`;
}

function typingShowFrame(text, cursorVisible, solidCursor) {
  const canvas = $('#typingPreviewCanvas');
  if (!canvas) return;
  const escaped = typingEscapeHTML(text);
  const cursor = typingCursorHTML(cursorVisible, solidCursor);
  canvas.innerHTML = typingRenderTheme(typingState.theme, escaped + cursor);
}

function typingRefreshPreview() {
  if (typingState.playing) return;
  const timeline = typingBuildTimeline();
  typingShowFrame(timeline.finalText, true, false);
}

function typingPlay() {
  if (typingState.playing) return;
  typingState.playing = true;
  const timeline = typingBuildTimeline();
  const startTime = performance.now();
  const totalDuration = typingState.startDelay + timeline.totalDuration + typingState.endDelay;

  function frame(now) {
    const elapsed = now - startTime;
    if (elapsed >= totalDuration || !typingState.playing) {
      typingShowFrame(timeline.finalText, true, false);
      typingState.playing = false;
      typingUpdatePlayBtn();
      return;
    }

    const t = elapsed - typingState.startDelay;

    if (t < 0) {
      typingShowFrame('', true, false);
    } else if (t >= timeline.totalDuration) {
      typingShowFrame(timeline.finalText, true, false);
    } else {
      const text = typingGetTextAtTime(timeline, t);
      const inPause = typingIsInPause(timeline.pauses, t);
      typingShowFrame(text, true, !inPause);
    }

    typingAnimId = requestAnimationFrame(frame);
  }

  typingAnimId = requestAnimationFrame(frame);
  typingUpdatePlayBtn();
}

function typingStop() {
  typingState.playing = false;
  if (typingAnimId) { cancelAnimationFrame(typingAnimId); typingAnimId = null; }
  typingRefreshPreview();
  typingUpdatePlayBtn();
}

function typingUpdatePlayBtn() {
  const btn = $('#typingPlayBtn');
  if (!btn) return;
  if (typingState.playing) {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor"/></svg><span>Pause</span>`;
  } else {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14"><polygon points="2,0 14,7 2,14" fill="currentColor"/></svg><span>Play</span>`;
  }
}

function typingRenderSeqList() {
  const list = $('#typingSeqList');
  list.innerHTML = typingState.sequences.map((seq, i) => {
    let badge, content;

    switch (seq.action) {
      case 'type':
        badge = '<span class="typing-seq-badge type">Tekst</span>';
        content = `<input type="text" class="typing-seq-input" value="${(seq.text || '').replace(/"/g, '&quot;')}" data-idx="${i}" data-field="text">`;
        break;
      case 'delete':
        badge = '<span class="typing-seq-badge delete">Usuń</span>';
        content = `<span class="typing-seq-label">znaków:</span><input type="number" class="typing-seq-input typing-seq-num" value="${seq.count ?? 1}" min="1" data-idx="${i}" data-field="count">`;
        break;
      case 'pause':
        badge = '<span class="typing-seq-badge pause">Pauza</span>';
        content = `<span class="typing-seq-label">ms:</span><input type="number" class="typing-seq-input typing-seq-num" value="${seq.duration ?? 500}" min="50" step="50" data-idx="${i}" data-field="duration">`;
        break;
      case 'newline':
        badge = '<span class="typing-seq-badge newline">Linia</span>';
        content = '';
        break;
    }

    const moveUp = i > 0 ? `<button class="typing-seq-move" data-idx="${i}" data-dir="up" title="Góra">&#9650;</button>` : '<span style="width:14px"></span>';
    const moveDown = i < typingState.sequences.length - 1 ? `<button class="typing-seq-move" data-idx="${i}" data-dir="down" title="Dół">&#9660;</button>` : '<span style="width:14px"></span>';

    return `<div class="typing-seq-item" data-idx="${i}">
      ${badge}${content}
      ${moveUp}${moveDown}
      <button class="typing-seq-delete" data-idx="${i}" title="Usuń">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l8 8M11 3l-8 8"/></svg>
      </button>
    </div>`;
  }).join('');

  list.querySelectorAll('.typing-seq-input').forEach(input => {
    input.addEventListener('input', () => {
      const idx = parseInt(input.dataset.idx);
      const field = input.dataset.field;
      if (field === 'text') typingState.sequences[idx].text = input.value;
      else if (field === 'count') typingState.sequences[idx].count = parseInt(input.value) || 1;
      else if (field === 'duration') typingState.sequences[idx].duration = parseInt(input.value) || 500;
      typingRefreshPreview();
    });
    input.addEventListener('click', e => e.stopPropagation());
  });

  list.querySelectorAll('.typing-seq-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      typingState.sequences.splice(idx, 1);
      typingRenderSeqList();
      typingRefreshPreview();
    });
  });

  list.querySelectorAll('.typing-seq-move').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      const dir = btn.dataset.dir;
      const newIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= typingState.sequences.length) return;
      [typingState.sequences[idx], typingState.sequences[newIdx]] = [typingState.sequences[newIdx], typingState.sequences[idx]];
      typingRenderSeqList();
      typingRefreshPreview();
    });
  });
}

const TYPING_THEME_FIELD_DEFS = {
  editor: [
    { key: 'title', label: 'Tytuł', type: 'text' },
  ],
  terminal: [
    { key: 'title', label: 'Tytuł', type: 'text' },
    { key: 'prompt', label: 'Prompt', type: 'text' },
  ],
  email: [
    { key: 'title', label: 'Tytuł', type: 'text' },
    { key: 'to', label: 'Do', type: 'text' },
    { key: 'subject', label: 'Temat', type: 'text' },
  ],
  sms: [
    { key: 'avatar', label: 'Awatar', type: 'text' },
    { key: 'contactName', label: 'Kontakt', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'bubbleColor', label: 'Kolor bąbla', type: 'color' },
    { key: 'timestamp', label: 'Godzina', type: 'text' },
  ],
  generic: [],
};

function typingRenderThemeFields() {
  const container = $('#typingThemeFields');
  const inner = $('#typingThemeFieldsInner');
  if (!container || !inner) return;

  const defs = TYPING_THEME_FIELD_DEFS[typingState.theme] || [];
  if (defs.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = '';
  const fields = typingState.themeFields[typingState.theme] || {};

  inner.innerHTML = defs.map(def => {
    const val = fields[def.key] || '';
    if (def.type === 'color') {
      return `<div class="typing-field-row">
        <span class="typing-field-label">${def.label}</span>
        <input type="color" class="typing-field-color" data-key="${def.key}" value="${val}">
      </div>`;
    }
    return `<div class="typing-field-row">
      <span class="typing-field-label">${def.label}</span>
      <input type="text" class="typing-field-input" data-key="${def.key}" value="${val}" placeholder="${def.label}">
    </div>`;
  }).join('');

  inner.querySelectorAll('.typing-field-input').forEach(input => {
    input.addEventListener('input', () => {
      typingState.themeFields[typingState.theme][input.dataset.key] = input.value;
      typingRefreshPreview();
    });
  });

  inner.querySelectorAll('.typing-field-color').forEach(input => {
    input.addEventListener('input', () => {
      typingState.themeFields[typingState.theme][input.dataset.key] = input.value;
      typingRefreshPreview();
    });
  });
}

function initTyping() {
  typingRefreshPreview();
  typingUpdatePreviewSize();
  typingRenderSeqList();
  typingRenderThemeFields();

  $$('#typingThemeGroup .control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#typingThemeGroup .control-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      typingState.theme = btn.dataset.theme;
      typingRenderThemeFields();
      typingRefreshPreview();
    });
  });

  $$('#typingFormatGroup .control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#typingFormatGroup .control-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      typingState.format = btn.dataset.format;
      typingUpdatePreviewSize();
    });
  });

  $('#typingResolutionSelect').addEventListener('change', (e) => {
    typingState.resolution = e.target.value;
    typingUpdatePreviewSize();
  });

  $$('#typingSeqAdd .typing-seq-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.add;
      switch (action) {
        case 'type': typingState.sequences.push({ action: 'type', text: '' }); break;
        case 'delete': typingState.sequences.push({ action: 'delete', count: 1 }); break;
        case 'pause': typingState.sequences.push({ action: 'pause', duration: 500 }); break;
        case 'newline': typingState.sequences.push({ action: 'newline' }); break;
      }
      typingRenderSeqList();
      const list = $('#typingSeqList');
      list.scrollTop = list.scrollHeight;
    });
  });

  $('#typingSpeed').addEventListener('input', (e) => {
    typingState.typeSpeed = parseInt(e.target.value);
    $('#typingSpeedVal').textContent = typingState.typeSpeed + 'ms';
  });

  $('#typingDelSpeed').addEventListener('input', (e) => {
    typingState.delSpeed = parseInt(e.target.value);
    $('#typingDelSpeedVal').textContent = typingState.delSpeed + 'ms';
  });

  $('#typingFontSize').addEventListener('input', (e) => {
    typingState.fontSize = parseInt(e.target.value);
    $('#typingFontSizeVal').textContent = typingState.fontSize + 'px';
    typingRefreshPreview();
  });

  ['typingBgColor', 'typingTextColor', 'typingCursorColor'].forEach(id => {
    $(`#${id}`).addEventListener('input', (e) => {
      const map = { typingBgColor: 'bgColor', typingTextColor: 'textColor', typingCursorColor: 'cursorColor' };
      typingState[map[id]] = e.target.value;
      typingRefreshPreview();
    });
  });

  $('#typingStartDelay').addEventListener('input', (e) => {
    typingState.startDelay = parseInt(e.target.value);
    $('#typingStartDelayVal').textContent = typingState.startDelay + 'ms';
  });

  $('#typingEndDelay').addEventListener('input', (e) => {
    typingState.endDelay = parseInt(e.target.value);
    $('#typingEndDelayVal').textContent = typingState.endDelay + 'ms';
  });

  $('#typingCursorBlink').addEventListener('change', (e) => {
    typingState.cursorBlink = e.target.checked;
  });

  $('#typingPlayBtn').addEventListener('click', () => {
    if (typingState.playing) typingStop();
    else typingPlay();
  });

  $('#typingStopBtn').addEventListener('click', () => {
    typingStop();
  });

  document.querySelectorAll('#typingPreviewArea ~ aside .control-range[data-default]').forEach(slider => {
    slider.addEventListener('dblclick', () => {
      slider.value = slider.dataset.default;
      slider.dispatchEvent(new Event('input'));
    });
  });

  const setExporting = (active, label) => {
    const prog = $('#typingExportProgress');
    if (!prog) return;
    prog.style.display = active ? 'flex' : 'none';
    if (active) $('#typingExportLabel').textContent = label || '';
    $('#typingExportBarFill').style.width = active ? '0%' : '';
  };

  $('#typingExportMp4Btn').addEventListener('click', async () => {
    const { ipcRenderer } = require('electron');
    const savePath = await ipcRenderer.invoke('save-dialog', {
      defaultName: `typing-${Date.now()}.mp4`,
      filters: [{ name: 'MP4', extensions: ['mp4'] }]
    });
    if (!savePath) return;

    if (typingState.playing) typingStop();

    const [w, h] = typingGetResolution();
    const fps = 30;
    const timeline = typingBuildTimeline();
    const totalDuration = typingState.startDelay + timeline.totalDuration + typingState.endDelay;
    const totalFrames = Math.max(1, Math.ceil(totalDuration / 1000 * fps));

    setExporting(true, 'Inicjalizacja...');
    await ipcRenderer.invoke('bg-init', { width: w, height: h, css: loadExportCss() });

    const frames = [];
    let prevHtml = null;
    let prevData = null;
    for (let i = 0; i < totalFrames; i++) {
      const T = i / fps * 1000;
      const t = T - typingState.startDelay;
      const blinkOn = typingState.cursorBlink ? (Math.floor(T / 530) % 2 === 0) : true;

      let text = '';
      if (t < 0) {
        text = '';
      } else if (t >= timeline.totalDuration) {
        text = timeline.finalText;
      } else {
        text = typingGetTextAtTime(timeline, t);
      }

      const escaped = typingEscapeHTML(text);
      const cursor = typingCursorHTML(blinkOn, false);
      const html = typingRenderTheme(typingState.theme, escaped + cursor);

      let data;
      if (html === prevHtml && prevData) {
        data = prevData;
      } else {
        data = await ipcRenderer.invoke('bg-render', { html });
        prevHtml = html;
        prevData = data;
      }
      frames.push({ data, duration: 1 });

      if (i % 5 === 0) {
        const pct = Math.round((i + 1) / totalFrames * 100);
        $('#typingExportBarFill').style.width = pct + '%';
        $('#typingExportLabel').textContent = `Klatka ${i + 1}/${totalFrames}`;
      }
    }

    setExporting(true, 'Koduję MP4...');
    $('#typingExportBarFill').style.width = '100%';

    await ipcRenderer.invoke('export-mp4', { frames, savePath, fps, width: w, height: h });
    await ipcRenderer.invoke('bg-cleanup');
    setExporting(false);
    typingRefreshPreview();
  });
}
