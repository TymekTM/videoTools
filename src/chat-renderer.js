/* ═══════════════════════════════════════
   CHAT TOOL
   ═══════════════════════════════════════ */

const chatState = {
  platform: 'imessage',
  format: '16:9',
  resolution: '1080p',
  animSpeed: 600,
  hideTime: false,
  fontScale: 100,
  contacts: [
    { name: 'Jan', color: '#007AFF', avatar: null },
    { name: 'Anna', color: '#34C759', avatar: null }
  ],
  customTheme: {
    bg: '#1a1a2e',
    headerBg: '#16213e',
    bubbleL: '#2a2a4a',
    bubbleR: '#6366f1',
    text: '#e4e4e7'
  },
  messages: [
    { sender: 0, text: 'Hej, widziałeś to?' },
    { sender: 1, text: 'Co dokładnie?' },
    { sender: 0, text: 'Ten nowy film dokumentalny o sztuce' },
    { sender: 1, text: 'O tak, słyszałam o nim! Podobno świetny' },
    { sender: 0, text: 'Dokładnie, musimy go obejrzeć' }
  ]
};

function chatGetResolution() {
  return RESOLUTIONS[chatState.format][chatState.resolution];
}

function chatUpdatePreviewSize() {
  const [w, h] = chatGetResolution();
  const area = $('#chatPreviewArea');
  if (!area) return;
  const areaW = area.clientWidth - 40;
  const areaH = area.clientHeight - 40;
  const scale = Math.min(areaW / w, areaH / h);
  const displayW = Math.round(w * scale);
  const displayH = Math.round(h * scale);

  const wrapper = $('#chatPreviewWrapper');
  wrapper.style.width = displayW + 'px';
  wrapper.style.height = displayH + 'px';

  const base = Math.min(w, h) / 15 * chatState.fontScale / 100;
  const canvas = $('#chatPreviewCanvas');
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.style.fontSize = base + 'px';
  canvas.style.transform = `scale(${scale})`;
  canvas.style.transformOrigin = '0 0';
  canvas.style.zoom = '';

  const si = $('#chatScaleVal');
  if (si) si.textContent = chatState.fontScale + '%';
  $('#globalResInfo').textContent = `${w}x${h}`;
}

function chatAvatarHTML(contact, size) {
  const initial = contact.name.charAt(0).toUpperCase();
  if (contact.avatar) {
    return `<div class="chat-render-avatar" style="background:${contact.color};width:${size};height:${size}"><img src="${contact.avatar}" alt=""></div>`;
  }
  return `<div class="chat-render-avatar" style="background:${contact.color};width:${size};height:${size}">${initial}</div>`;
}

function chatTimeStr(i) {
  return `${14 + Math.floor(i / 3)}:${String(i * 7 % 60).padStart(2, '0')}`;
}

let chatAnimTimer = null;
let chatAnimGen = 0;

function chatBubbleHTML(msg, i, p, bubbleLStyle, bubbleRStyle, animateBubble) {
  const contact = chatState.contacts[msg.sender];
  const isRight = msg.sender === 0;
  const time = chatState.hideTime ? '' : chatTimeStr(i);
  const animCls = animateBubble ? ' chat-bubble-animate' : '';

  if (p === 'discord') {
    const discAvatar = chatAvatarHTML(contact, '2.25em');
    return `
      <div class="chat-bubble ${isRight ? 'chat-bubble-right' : 'chat-bubble-left'}${animCls}">
        ${discAvatar}
        <div class="chat-bubble-content">
          <div class="chat-bubble-meta">
            <span class="chat-bubble-author" style="color:${contact.color}">${contact.name}</span>
            ${time ? `<span class="chat-bubble-time">${time}</span>` : ''}
          </div>
          <div class="chat-bubble-text">${msg.text}</div>
        </div>
      </div>`;
  }

  let bubbleStyle = isRight ? bubbleRStyle : bubbleLStyle;
  let styleAttr = bubbleStyle ? `style="${bubbleStyle}"` : '';

  return `
    <div class="chat-bubble ${isRight ? 'chat-bubble-right' : 'chat-bubble-left'}${animCls}" ${styleAttr}>
      ${msg.text}
      ${time ? `<div class="chat-bubble-time">${time}</div>` : ''}
    </div>`;
}

function chatTypingHTML(sender) {
  const contact = chatState.contacts[sender];
  const p = chatState.platform;
  const isRight = sender === 0;

  if (p === 'discord') {
    return `
      <div class="chat-typing-indicator chat-discord-typing">
        <span class="chat-discord-typing-name" style="color:${contact.color}">${contact.name}</span>
        <span class="chat-discord-typing-text">${t('chatTypingText')}</span>
        <span class="chat-discord-typing-dots">
          <span class="chat-typing-dot"></span>
          <span class="chat-typing-dot"></span>
          <span class="chat-typing-dot"></span>
        </span>
      </div>`;
  }

  const align = isRight ? 'align-self:flex-end' : '';
  return `
    <div class="chat-typing-indicator" style="${align}">
      <div class="chat-typing-dot"></div>
      <div class="chat-typing-dot"></div>
      <div class="chat-typing-dot"></div>
    </div>`;
}

function chatRenderPreview(animate, upTo, showTypingFrom) {
  if (chatAnimTimer) { clearTimeout(chatAnimTimer); chatAnimTimer = null; }
  chatAnimGen++;

  const canvas = $('#chatPreviewCanvas');
  const p = chatState.platform;
  const c1 = chatState.contacts[0];
  const c2 = chatState.contacts[1];
  const headerContact = c2;

  let headerStyle = '';
  let bodyStyle = '';
  let bubbleLStyle = '';
  let bubbleRStyle = '';
  let textStyle = '';

  if (p === 'custom') {
    const t = chatState.customTheme;
    headerStyle = `background:${t.headerBg}`;
    bodyStyle = `background:${t.bg}`;
    bubbleLStyle = `background:${t.bubbleL};color:${t.text}`;
    bubbleRStyle = `background:${t.bubbleR};color:#fff`;
    textStyle = `color:${t.text}`;
  }

  const avatarSize = '1.7em';
  const avatar = chatAvatarHTML(headerContact, avatarSize);

  const statuses = {
    imessage: 'iMessage',
    whatsapp: 'online',
    discord: '',
    messenger: 'Active now',
    custom: 'online'
  };

  const headerHTML = `
    <div class="chat-render-header" ${headerStyle ? `style="${headerStyle}"` : ''}>
      <div class="chat-render-back">
        <svg width="${p === 'discord' ? '0.72em' : '0.56em'}" height="${p === 'discord' ? '0.72em' : '0.56em'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </div>
      ${avatar}
      <div class="chat-render-info">
        <div class="chat-render-name">${headerContact.name}</div>
        <div class="chat-render-status">${statuses[p] || ''}</div>
      </div>
    </div>`;

  const animClass = animate ? ' chat-animate' : '';
  const limit = typeof upTo === 'number' ? upTo : chatState.messages.length;
  const startEmpty = animate && typeof upTo === 'undefined';

  let messagesHTML = '';
  const renderCount = startEmpty ? 0 : limit;
  for (let i = 0; i < renderCount; i++) {
    const isLast = animate && i === renderCount - 1;
    messagesHTML += chatBubbleHTML(chatState.messages[i], i, p, bubbleLStyle, bubbleRStyle, isLast);
  }

  let typingHTML = '';
  if (typeof showTypingFrom === 'number' && showTypingFrom < chatState.messages.length) {
    typingHTML = chatTypingHTML(chatState.messages[showTypingFrom].sender);
  }

  canvas.innerHTML = `
    <div class="chat-render chat-platform-${p}${animClass}" ${textStyle ? `style="${textStyle}"` : ''}>
      ${headerHTML}
      <div class="chat-render-body" ${bodyStyle ? `style="${bodyStyle}"` : ''}>
        ${messagesHTML}
        ${typingHTML}
      </div>
    </div>`;

  if (animate && chatState.animSpeed > 0 && startEmpty) {
    chatRunAnimation(0, p, bubbleLStyle, bubbleRStyle, bodyStyle, textStyle, headerHTML);
  }
}

function chatRunAnimation(from, p, bubbleLStyle, bubbleRStyle, bodyStyle, textStyle, headerHTML, onDone) {
  if (chatAnimTimer) { clearTimeout(chatAnimTimer); chatAnimTimer = null; }
  if (from >= chatState.messages.length) return;

  const gen = ++chatAnimGen;
  const speed = chatState.animSpeed;
  const typingDuration = Math.min(speed * 0.6, 800);
  const bubbleGap = speed;

  const stale = () => gen !== chatAnimGen;

  const addBubble = (i, cb) => {
    if (stale()) return;
    const nextBubble = chatBubbleHTML(chatState.messages[i], i, p, bubbleLStyle, bubbleRStyle, true);
    const canvas = $('#chatPreviewCanvas');
    const body = canvas.querySelector('.chat-render-body');

    const temp = document.createElement('div');
    temp.innerHTML = nextBubble.trim();
    const bubble = temp.firstChild;

    const typingEl = body.querySelector('.chat-typing-indicator');
    if (typingEl) {
      typingEl.classList.add('chat-typing-hide');
      typingEl.insertAdjacentElement('beforebegin', bubble);
      setTimeout(() => { if (!stale()) typingEl.remove(); }, 200);
    } else {
      body.appendChild(bubble);
    }
    if (cb) cb();
  };

  const showTyping = (i, cb) => {
    if (stale()) return;
    const canvas = $('#chatPreviewCanvas');
    const body = canvas.querySelector('.chat-render-body');
    const typing = chatTypingHTML(chatState.messages[i].sender);
    const temp = document.createElement('div');
    temp.innerHTML = typing.trim();
    body.appendChild(temp.firstChild);
    cb();
  };

  const step = (i) => {
    if (stale()) return;
    if (i >= chatState.messages.length) { if (onDone) onDone(); return; }
    chatAnimTimer = setTimeout(() => {
      if (stale()) return;
      addBubble(i, () => {
        if (stale()) return;
        if (i + 1 < chatState.messages.length) {
          chatAnimTimer = setTimeout(() => {
            showTyping(i + 1, () => step(i + 1));
          }, bubbleGap);
        } else {
          if (onDone) onDone();
        }
      });
    }, typingDuration);
  };

  chatAnimTimer = setTimeout(() => {
    showTyping(from, () => step(from));
  }, 400);
}

function chatRenderMessageList() {
  const list = $('#chatMessagesList');
  list.innerHTML = chatState.messages.map((msg, i) => {
    const contact = chatState.contacts[msg.sender];
    return `
      <div class="chat-msg-item" data-idx="${i}">
        <span class="chat-msg-dot" style="background:${contact.color}"></span>
        <span class="chat-msg-text">${contact.name}: ${msg.text}</span>
        <button class="chat-msg-delete" data-idx="${i}" title="${t('delete')}">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l8 8M11 3l-8 8"/></svg>
        </button>
      </div>`;
  }).join('');

  list.querySelectorAll('.chat-msg-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      chatState.messages.splice(parseInt(btn.dataset.idx), 1);
      chatRenderMessageList();
      chatRenderPreview();
    });
  });
}

function chatUpdateSenderDropdown() {
  const sel = $('#chatAddSender');
  sel.innerHTML = chatState.contacts.map((c, i) =>
    `<option value="${i}">${c.name}</option>`
  ).join('');
}

function chatUpdateAvatarUI(idx) {
  const contact = chatState.contacts[idx];
  const img = $(`#chatAvatar${idx + 1}Img`);
  const initial = $(`#chatAvatar${idx + 1}Initial`);
  if (contact.avatar) {
    img.src = contact.avatar;
    img.style.display = 'block';
    initial.style.display = 'none';
  } else {
    img.src = '';
    img.style.display = 'none';
    initial.style.display = 'block';
    initial.textContent = contact.name.charAt(0).toUpperCase();
  }
}

function initChat() {
  const chatRefresh = () => { chatUpdatePreviewSize(); chatRenderPreview(chatState.animSpeed > 0); };
  chatUpdatePreviewSize();
  chatRenderPreview(chatState.animSpeed > 0);
  chatRenderMessageList();
  chatUpdateAvatarUI(0);
  chatUpdateAvatarUI(1);

  $$('#chatPlatformGroup .control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#chatPlatformGroup .control-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chatState.platform = btn.dataset.platform;
      const customPanel = $('#chatCustomTheme');
      customPanel.style.display = chatState.platform === 'custom' ? 'flex' : 'none';
      chatRefresh();
    });
  });

  $$('#chatFormatGroup .control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#chatFormatGroup .control-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chatState.format = btn.dataset.format;
      chatUpdatePreviewSize();
      chatRefresh();
    });
  });

  $('#chatResolutionSelect').addEventListener('change', (e) => {
    chatState.resolution = e.target.value;
    chatUpdatePreviewSize();
    chatRenderPreview(chatState.animSpeed > 0);
  });

  $('#chatScaleRange').addEventListener('input', (e) => {
    chatState.fontScale = parseInt(e.target.value);
    chatUpdatePreviewSize();
    chatRenderPreview(chatState.animSpeed > 0);
  });

  const addMsg = () => {
    const text = $('#chatAddText').value.trim();
    if (!text) return;
    const sender = parseInt($('#chatAddSender').value);
    chatState.messages.push({ sender, text });
    $('#chatAddText').value = '';
    chatRenderMessageList();
    chatRefresh();
    const list = $('#chatMessagesList');
    list.scrollTop = list.scrollHeight;
  };

  $('#chatAddBtn').addEventListener('click', addMsg);
  $('#chatAddText').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addMsg();
  });

  $('#chatClearBtn').addEventListener('click', () => {
    chatState.messages = [];
    chatRenderMessageList();
    chatRefresh();
  });

  let chatPreviewing = false;

  $('#chatPreviewAnimBtn').addEventListener('click', () => {
    if (chatPreviewing) return;
    if (chatState.messages.length === 0) return;
    if (chatState.animSpeed <= 0) return;
    chatPreviewing = true;

    const btn = $('#chatPreviewAnimBtn');
    btn.classList.add('btn-primary');
    btn.classList.remove('btn-secondary');

    const p = chatState.platform;
    let headerStyle = '', bodyStyle = '', bubbleLStyle = '', bubbleRStyle = '', textStyle = '';
    if (p === 'custom') {
      const t = chatState.customTheme;
      headerStyle = `background:${t.headerBg}`;
      bodyStyle = `background:${t.bg}`;
      bubbleLStyle = `background:${t.bubbleL};color:${t.text}`;
      bubbleRStyle = `background:${t.bubbleR};color:#fff`;
      textStyle = `color:${t.text}`;
    }
    const avatarSize = '1.7em';
    const headerContact = chatState.contacts[1];
    const avatar = chatAvatarHTML(headerContact, avatarSize);
    const statuses = { imessage:'iMessage', whatsapp:'online', discord:'', messenger:'Active now', custom:'online' };
    const headerHTML = `<div class="chat-render-header" ${headerStyle?`style="${headerStyle}"`:''}><div class="chat-render-back"><svg width="${p==='discord'?'0.72em':'0.56em'}" height="${p==='discord'?'0.72em':'0.56em'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></div>${avatar}<div class="chat-render-info"><div class="chat-render-name">${headerContact.name}</div><div class="chat-render-status">${statuses[p]||''}</div></div></div>`;

    const canvas = $('#chatPreviewCanvas');
    canvas.innerHTML = `<div class="chat-render chat-platform-${p} chat-animate" ${textStyle?`style="${textStyle}"`:''}>${headerHTML}<div class="chat-render-body" ${bodyStyle?`style="${bodyStyle}"`:''}></div></div>`;

    chatRunAnimation(0, p, bubbleLStyle, bubbleRStyle, bodyStyle, textStyle, headerHTML, () => {
      chatPreviewing = false;
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
    });
  });

  const updateContact = (idx) => {
    const nameInput = $(`#chatContact${idx + 1}Name`);
    const colorInput = $(`#chatContact${idx + 1}Color`);
    const fileInput = $(`#chatAvatar${idx + 1}File`);

    nameInput.addEventListener('input', () => {
      chatState.contacts[idx].name = nameInput.value || `${t('chatContacts')} ${idx + 1}`;
      chatUpdateAvatarUI(idx);
      chatUpdateSenderDropdown();
      chatRenderMessageList();
      chatRefresh();
    });

    colorInput.addEventListener('input', () => {
      chatState.contacts[idx].color = colorInput.value;
      chatUpdateAvatarUI(idx);
      chatRenderMessageList();
      chatRefresh();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        chatState.contacts[idx].avatar = ev.target.result;
        chatUpdateAvatarUI(idx);
        chatRefresh();
      };
      reader.readAsDataURL(file);
    });
  };

  updateContact(0);
  updateContact(1);

  ['chatCustomBg', 'chatCustomHeaderBg', 'chatCustomBubbleL', 'chatCustomBubbleR', 'chatCustomText'].forEach(id => {
    $(`#${id}`).addEventListener('input', (e) => {
      const map = {
        chatCustomBg: 'bg',
        chatCustomHeaderBg: 'headerBg',
        chatCustomBubbleL: 'bubbleL',
        chatCustomBubbleR: 'bubbleR',
        chatCustomText: 'text'
      };
      chatState.customTheme[map[id]] = e.target.value;
      chatRenderPreview(chatState.animSpeed > 0);
    });
  });

  $$('#chatAnimSpeedGroup .control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#chatAnimSpeedGroup .control-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chatState.animSpeed = parseInt(btn.dataset.speed);
      chatRenderPreview(chatState.animSpeed > 0);
    });
  });

  $('#chatHideTime').addEventListener('change', (e) => {
    chatState.hideTime = e.target.checked;
    chatRenderPreview(chatState.animSpeed > 0);
  });

  const setExporting = (active, label) => {
    const prog = $('#chatExportProgress');
    if (!prog) return;
    prog.classList.toggle('active', active);
    if (active) $('#chatExportLabel').textContent = label || '';
    $('#chatExportBarFill').style.width = active ? '0%' : '';
  };

  $('#chatExportBtn').addEventListener('click', async () => {
    const { ipcRenderer } = require('electron');
    const savePath = await ipcRenderer.invoke('save-dialog', {
      defaultName: `chat-${chatState.platform}-${Date.now()}.png`
    });
    if (!savePath) return;

    const [w, h] = chatGetResolution();

    setExporting(true, t('chatExportingPng'));
    await ipcRenderer.invoke('bg-init', {
      width: w, height: h,
      css: loadExportCss()
    });

    const p = chatState.platform;
    let headerStyle = '', bodyStyle = '', bubbleLStyle = '', bubbleRStyle = '', textStyle = '';
    if (p === 'custom') {
      const t = chatState.customTheme;
      headerStyle = `background:${t.headerBg}`;
      bodyStyle = `background:${t.bg}`;
      bubbleLStyle = `background:${t.bubbleL};color:${t.text}`;
      bubbleRStyle = `background:${t.bubbleR};color:#fff`;
      textStyle = `color:${t.text}`;
    }
    const avatarSize = '1.7em';
    const headerContact = chatState.contacts[1];
    const avatar = chatAvatarHTML(headerContact, avatarSize);
    const statuses = { imessage:'iMessage', whatsapp:'online', discord:'', messenger:'Active now', custom:'online' };
    const headerHTML = `<div class="chat-render-header" ${headerStyle?`style="${headerStyle}"`:''}><div class="chat-render-back"><svg width="${p==='discord'?'0.72em':'0.56em'}" height="${p==='discord'?'0.72em':'0.56em'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></div>${avatar}<div class="chat-render-info"><div class="chat-render-name">${headerContact.name}</div><div class="chat-render-status">${statuses[p]||''}</div></div></div>`;

    let msgHTML = '';
    for (let i = 0; i < chatState.messages.length; i++) {
      msgHTML += chatBubbleHTML(chatState.messages[i], i, p, bubbleLStyle, bubbleRStyle, false);
    }
    const bodyStyleFull = (bodyStyle ? bodyStyle + ';' : '') + 'overflow:visible';
    const html = `<div style="font-size:${Math.min(w,h)/15*chatState.fontScale/100}px;width:100%;height:100%"><div class="chat-render chat-platform-${p}" ${textStyle?`style="${textStyle}"`:''}>${headerHTML}<div class="chat-render-body" style="${bodyStyleFull}">${msgHTML}</div></div></div>`;

    const pngData = await ipcRenderer.invoke('bg-render-png', { html });
    await ipcRenderer.invoke('bg-cleanup');

    const buffer = Buffer.from(pngData, 'base64');
    require('fs').writeFileSync(savePath, buffer);

    chatRenderPreview(chatState.animSpeed > 0);
    setExporting(false);
  });

  $('#chatExportMp4Btn').addEventListener('click', async () => {
    const { ipcRenderer } = require('electron');
    const savePath = await ipcRenderer.invoke('save-dialog', {
      defaultName: `chat-${chatState.platform}-${Date.now()}.mp4`,
      filters: [{ name: 'MP4', extensions: ['mp4'] }]
    });
    if (!savePath) return;

    const [w, h] = chatGetResolution();
    const fps = 30;
    const msgCount = chatState.messages.length;
    const speed = chatState.animSpeed > 0 ? chatState.animSpeed : 600;
    const typingMs = Math.min(speed * 0.6, 800);
    const pauseMs = 600;
    const framesPerTyping = Math.round((typingMs / 1000) * fps);
    const framesPerBubble = Math.round((350 / 1000) * fps);
    const framesPerPause = Math.round((pauseMs / 1000) * fps);
    const framesEnd = Math.round(1.5 * fps);

    setExporting(true, t('chatPreparing'));
    await ipcRenderer.invoke('bg-init', {
      width: w, height: h,
      css: loadExportCss()
    });

    const p = chatState.platform;
    let headerStyle = '', bodyStyle = '', bubbleLStyle = '', bubbleRStyle = '', textStyle = '';
    if (p === 'custom') {
      const t = chatState.customTheme;
      headerStyle = `background:${t.headerBg}`;
      bodyStyle = `background:${t.bg}`;
      bubbleLStyle = `background:${t.bubbleL};color:${t.text}`;
      bubbleRStyle = `background:${t.bubbleR};color:#fff`;
      textStyle = `color:${t.text}`;
    }
    const avatarSize = '1.7em';
    const headerContact = chatState.contacts[1];
    const avatar = chatAvatarHTML(headerContact, avatarSize);
    const statuses = { imessage:'iMessage', whatsapp:'online', discord:'', messenger:'Active now', custom:'online' };
    const headerHTML = `<div class="chat-render-header" ${headerStyle?`style="${headerStyle}"`:''}><div class="chat-render-back"><svg width="${p==='discord'?'0.72em':'0.56em'}" height="${p==='discord'?'0.72em':'0.56em'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></div>${avatar}<div class="chat-render-info"><div class="chat-render-name">${headerContact.name}</div><div class="chat-render-status">${statuses[p]||''}</div></div></div>`;

    const buildFrame = (limit, showTypingFrom, animateLast) => {
      let msgHTML = '';
      for (let i = 0; i < limit; i++) {
        const isLast = animateLast && i === limit - 1;
        msgHTML += chatBubbleHTML(chatState.messages[i], i, p, bubbleLStyle, bubbleRStyle, isLast);
      }
      let typingHTML = '';
      if (typeof showTypingFrom === 'number' && showTypingFrom < chatState.messages.length) {
        typingHTML = chatTypingHTML(chatState.messages[showTypingFrom].sender);
      }
      const animClass = animateLast ? ' chat-animate' : '';
      const bodyStyleFull = (bodyStyle ? bodyStyle + ';' : '') + 'overflow:visible';
      return `<div style="font-size:${Math.min(w,h)/15*chatState.fontScale/100}px;width:100%;height:100%"><div class="chat-render chat-platform-${p}${animClass}" ${textStyle?`style="${textStyle}"`:''}>${headerHTML}<div class="chat-render-body" style="${bodyStyleFull}">${msgHTML}${typingHTML}</div></div></div>`;
    };

    const capture = async (html, delay) => {
      return await ipcRenderer.invoke('bg-render', { html, delay });
    };

    const frames = [];

    const emptyData = await capture(buildFrame(0));
    frames.push({ data: emptyData, duration: framesPerPause });

    let total = framesPerPause + (framesPerTyping + framesPerBubble + framesPerPause) * msgCount + framesEnd;
    let done = 0;

    let prevFrameHtml = null;
    let prevFrameData = null;

    for (let i = 0; i < msgCount; i++) {
      const typingStep = Math.max(1, Math.round(typingMs / framesPerTyping));
      const typingHtml = buildFrame(i, i);
      let typingData;
      if (typingHtml === prevFrameHtml && prevFrameData) {
        typingData = prevFrameData;
      } else {
        typingData = await capture(typingHtml, typingStep);
        prevFrameHtml = typingHtml;
        prevFrameData = typingData;
      }
      for (let t = 0; t < framesPerTyping; t++) {
        frames.push({ data: typingData, duration: 1 });
      }
      done += framesPerTyping;

      const bubbleHtml = buildFrame(i + 1, undefined, true);
      let bubbleData;
      if (bubbleHtml === prevFrameHtml && prevFrameData) {
        bubbleData = prevFrameData;
      } else {
        bubbleData = await capture(bubbleHtml, 450);
        prevFrameHtml = bubbleHtml;
        prevFrameData = bubbleData;
      }
      frames.push({ data: bubbleData, duration: framesPerBubble + framesPerPause });
      done += framesPerBubble + framesPerPause;

      const pct = Math.round((done / total) * 80);
      $('#chatExportBarFill').style.width = pct + '%';
      $('#chatExportLabel').textContent = `${t('chatMessage')} ${i + 1}/${msgCount}`;
    }

    frames.push({ data: frames[frames.length - 1].data, duration: framesEnd });

    setExporting(true, t('chatEncodingMp4'));
    $('#chatExportBarFill').style.width = '100%';

    await ipcRenderer.invoke('export-mp4', { frames, savePath, fps, width: w, height: h });
    await ipcRenderer.invoke('bg-cleanup');

    chatRenderPreview(chatState.animSpeed > 0);
    setExporting(false);
  });
}
