const { createPage, loadHtml, waitForFonts, evalAndCapture, closePage } = require('../lib/browser');
const { encode } = require('../lib/encoder');
const { getResolution } = require('../registry');

const FONTS_LINK = '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">';

const CHAT_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden}
.chat-render{width:100%;height:100%;display:flex;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;overflow:hidden}
.chat-render-header{display:flex;align-items:center;gap:0.5em;padding:0.5em 0.8em;border-bottom:1px solid rgba(0,0,0,0.08);flex-shrink:0}
.chat-render-back{opacity:0.4}
.chat-render-avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.85em;flex-shrink:0;overflow:hidden}
.chat-render-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
.chat-render-info{flex:1;min-width:0}
.chat-render-name{font-weight:600;font-size:0.85em}
.chat-render-status{font-size:0.6em;color:#888}
.chat-render-body{flex:1;overflow:hidden;padding:0.5em;display:flex;flex-direction:column;gap:0.3em}

.chat-platform-imessage{background:#fff;color:#000}
.chat-platform-imessage .chat-render-header{background:#f6f6f6}
.chat-platform-imessage .chat-bubble-left{background:#e9e9eb;color:#000;border-radius:1em 1em 1em 0.2em;padding:0.5em 0.8em;max-width:72%;align-self:flex-start;font-size:0.85em;line-height:1.35}
.chat-platform-imessage .chat-bubble-right{background:#007AFF;color:#fff;border-radius:1em 1em 0.2em 1em;padding:0.5em 0.8em;max-width:72%;align-self:flex-end;font-size:0.85em;line-height:1.35}
.chat-platform-imessage .chat-bubble-time{font-size:0.6em;opacity:0.5;margin-top:0.2em;text-align:right}

.chat-platform-whatsapp{background:#ece5dd;color:#000}
.chat-platform-whatsapp .chat-render-header{background:#075e54;color:#fff}
.chat-platform-whatsapp .chat-render-name,.chat-platform-whatsapp .chat-render-status{color:#fff}
.chat-platform-whatsapp .chat-bubble-left{background:#fff;color:#000;border-radius:0.5em;padding:0.5em 0.7em;max-width:72%;align-self:flex-start;font-size:0.85em;line-height:1.35}
.chat-platform-whatsapp .chat-bubble-right{background:#dcf8c6;color:#000;border-radius:0.5em;padding:0.5em 0.7em;max-width:72%;align-self:flex-end;font-size:0.85em;line-height:1.35}

.chat-platform-discord{background:#36393f;color:#dcddde}
.chat-platform-discord .chat-render-header{background:#2f3136}
.chat-platform-discord .chat-render-name,.chat-platform-discord .chat-render-status{color:#fff}
.chat-platform-discord .chat-bubble{display:flex;gap:0.4em;max-width:88%}
.chat-platform-discord .chat-bubble-left,.chat-platform-discord .chat-bubble-right{background:none;color:#dcddde;padding:0;border-radius:0;max-width:100%;align-self:auto;font-size:0.85em;line-height:1.35}
.chat-platform-discord .chat-bubble-content{flex:1}
.chat-platform-discord .chat-bubble-author{font-weight:600;font-size:0.8em}
.chat-platform-discord .chat-bubble-time{font-size:0.6em;color:#666;margin-left:0.5em}
.chat-platform-discord .chat-bubble-text{margin-top:0.1em}
.chat-platform-discord .chat-bubble-meta{display:flex;align-items:baseline}

.chat-platform-messenger{background:#fff;color:#000}
.chat-platform-messenger .chat-render-header{background:#0084ff;color:#fff}
.chat-platform-messenger .chat-render-name,.chat-platform-messenger .chat-render-status{color:#fff}
.chat-platform-messenger .chat-bubble-left{background:#f0f0f0;color:#000;border-radius:1.2em;padding:0.5em 0.8em;max-width:72%;align-self:flex-start;font-size:0.85em;line-height:1.35}
.chat-platform-messenger .chat-bubble-right{background:#0084ff;color:#fff;border-radius:1.2em;padding:0.5em 0.8em;max-width:72%;align-self:flex-end;font-size:0.85em;line-height:1.35}

.chat-typing-indicator{display:flex;gap:0.25em;padding:0.5em 0.8em;align-self:flex-start}
.chat-typing-dot{width:0.45em;height:0.45em;border-radius:50%;background:#999;animation:typingBounce 1.2s infinite}
.chat-typing-dot:nth-child(2){animation-delay:0.2s}
.chat-typing-dot:nth-child(3){animation-delay:0.4s}
@keyframes typingBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-3px)}}
`;

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

function buildChatHtml(platform, contacts, messages, upTo, showTypingFrom, customTheme, hideTime, fontScale) {
  const c1 = contacts[0] || { name: 'You', color: '#007AFF' };
  const c2 = contacts[1] || { name: 'Contact', color: '#34C759' };
  const headerContact = c2;

  let headerStyle = '';
  let bodyStyle = '';
  let bubbleLStyle = '';
  let bubbleRStyle = '';
  let textStyle = '';

  if (platform === 'custom') {
    const t = customTheme || {};
    headerStyle = `background:${t.headerBg || '#16213e'}`;
    bodyStyle = `background:${t.bg || '#1a1a2e'}`;
    bubbleLStyle = `background:${t.bubbleL || '#2a2a4a'};color:${t.text || '#e4e4e7'}`;
    bubbleRStyle = `background:${t.bubbleR || '#6366f1'};color:#fff`;
    textStyle = `color:${t.text || '#e4e4e7'}`;
  }

  const avatar = chatAvatarHTML(headerContact, '1.7em');
  const statuses = { imessage: 'iMessage', whatsapp: 'online', discord: '', messenger: 'Active now', custom: 'online' };

  const headerHTML = `<div class="chat-render-header" ${headerStyle ? `style="${headerStyle}"` : ''}>
<div class="chat-render-back"><svg width="0.56em" height="0.56em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></div>
${avatar}<div class="chat-render-info"><div class="chat-render-name">${headerContact.name}</div><div class="chat-render-status">${statuses[platform] || ''}</div></div></div>`;

  const limit = typeof upTo === 'number' ? upTo : messages.length;
  let messagesHTML = '';
  for (let i = 0; i < limit; i++) {
    const msg = messages[i];
    const contact = contacts[msg.sender] || c1;
    const isRight = msg.sender === 0;
    const time = hideTime ? '' : chatTimeStr(i);

    if (platform === 'discord') {
      const discAvatar = chatAvatarHTML(contact, '2.25em');
      messagesHTML += `<div class="chat-bubble ${isRight ? 'chat-bubble-right' : 'chat-bubble-left'}">${discAvatar}<div class="chat-bubble-content"><div class="chat-bubble-meta"><span class="chat-bubble-author" style="color:${contact.color}">${contact.name}</span>${time ? `<span class="chat-bubble-time">${time}</span>` : ''}</div><div class="chat-bubble-text">${msg.text}</div></div></div>`;
    } else {
      const bubbleStyle = isRight ? bubbleRStyle : bubbleLStyle;
      messagesHTML += `<div class="chat-bubble ${isRight ? 'chat-bubble-right' : 'chat-bubble-left'}" ${bubbleStyle ? `style="${bubbleStyle}"` : ''}>${msg.text}${time ? `<div class="chat-bubble-time">${time}</div>` : ''}</div>`;
    }
  }

  let typingHTML = '';
  if (typeof showTypingFrom === 'number' && showTypingFrom < messages.length) {
    const sender = messages[showTypingFrom].sender;
    const isRight = sender === 0;
    const align = isRight ? 'align-self:flex-end' : '';
    if (platform === 'discord') {
      const contact = contacts[sender] || c1;
      typingHTML = `<div class="chat-typing-indicator"><span class="chat-discord-typing-name" style="color:${contact.color}">${contact.name}</span><span>pisze</span><span style="display:flex;gap:0.15em"><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span></span></div>`;
    } else {
      typingHTML = `<div class="chat-typing-indicator" style="${align}"><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span></div>`;
    }
  }

  const baseFontSize = Math.min(1920, 1080) / 15 * (fontScale || 100) / 100;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONTS_LINK}<style>${CHAT_CSS}</style></head><body>
<div class="chat-render chat-platform-${platform}" style="font-size:${baseFontSize}px;${textStyle ? `color:${textStyle};` : ''}">
${headerHTML}
<div class="chat-render-body" ${bodyStyle ? `style="${bodyStyle}"` : ''}>
${messagesHTML}
${typingHTML}
</div></div></body></html>`;
}

async function generate(params, outputPath, format) {
  const p = {
    platform: 'imessage',
    format: '9:16',
    resolution: '1080p',
    fps: 30,
    animSpeed: 600,
    fontScale: 100,
    hideTime: false,
    contacts: [{ name: 'Jan', color: '#007AFF', avatar: null }, { name: 'Anna', color: '#34C759', avatar: null }],
    messages: [
      { sender: 0, text: 'Hej, widziałeś to?' },
      { sender: 1, text: 'Co dokładnie?' },
      { sender: 0, text: 'Ten nowy film dokumentalny o sztuce' },
      { sender: 1, text: 'O tak, słyszałam o nim!' },
      { sender: 0, text: 'Dokładnie, musimy go obejrzeć' },
    ],
    customTheme: null,
    ...params,
  };

  const [width, height] = getResolution(p.format, p.resolution);
  const fps = p.fps;
  const frames = [];
  const page = await createPage(width, height);

  for (let i = 0; i < p.messages.length; i++) {
    if (p.animSpeed > 0) {
      const typingHtml = buildChatHtml(p.platform, p.contacts, p.messages, i, i + 1, p.customTheme, p.hideTime, p.fontScale);
      await loadHtml(page, typingHtml);
      await waitForFonts(page);
      const typingFrames = Math.max(1, Math.round((p.animSpeed * 0.6 / 1000) * fps));
      const d = await evalAndCapture(page, null);
      for (let f = 0; f < typingFrames; f++) frames.push({ data: d, duration: 1 });
    }

    const msgHtml = buildChatHtml(p.platform, p.contacts, p.messages, i + 1, null, p.customTheme, p.hideTime, p.fontScale);
    await loadHtml(page, msgHtml);
    await waitForFonts(page);
    const msgFrames = Math.max(1, Math.round((p.animSpeed / 1000) * fps));
    const d = await evalAndCapture(page, null);
    for (let f = 0; f < msgFrames; f++) frames.push({ data: d, duration: 1 });
  }

  const endHtml = buildChatHtml(p.platform, p.contacts, p.messages, p.messages.length, null, p.customTheme, p.hideTime, p.fontScale);
  await loadHtml(page, endHtml);
  await waitForFonts(page);
  const endFrames = Math.round(fps * 1.5);
  const d = await evalAndCapture(page, null);
  for (let f = 0; f < endFrames; f++) frames.push({ data: d, duration: 1 });

  await closePage(page);
  await encode(frames, outputPath, fps, width, height, format || 'mp4');

  const fs = require('fs');
  const stat = fs.statSync(outputPath);
  return {
    success: true,
    filePath: outputPath,
    fileSize: stat.size,
    duration: frames.length / fps,
    frames: frames.length,
  };
}

module.exports = { generate };
