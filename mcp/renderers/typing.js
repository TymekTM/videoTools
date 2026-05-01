const { createPage, loadHtml, waitForFonts, evalAndCapture, closePage } = require('../lib/browser');
const { encode } = require('../lib/encoder');
const { getResolution } = require('../registry');

const FONTS_LINK = '<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">';

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildTypingHtml(theme, text, cursorVisible, bgColor, textColor, cursorColor, fontSize, title, prompt, width, height) {
  const cursor = cursorVisible ? '<span style="background:' + textColor + ';color:' + textColor + ';animation:blink 1s step-end infinite">&#8203;</span>' : '';
  const escaped = escapeHtml(text);

  let content = '';
  let header = '';

  if (theme === 'editor') {
    header = `<div style="background:#181825;padding:6px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #313244"><div style="display:flex;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:#f38ba8"></span><span style="width:10px;height:10px;border-radius:50%;background:#f9e2af"></span><span style="width:10px;height:10px;border-radius:50%;background:#a6e3a1"></span></div><span style="color:#6c7086;font-size:11px;font-family:'JetBrains Mono',monospace">${escapeHtml(title || 'untitled.txt')}</span></div>`;
    content = `<div style="padding:16px;font-family:'JetBrains Mono',monospace;white-space:pre-wrap;word-break:break-all;line-height:1.5"><span>${escaped}</span>${cursor}</div>`;
  } else if (theme === 'terminal') {
    content = `<div style="padding:16px;font-family:'JetBrains Mono',monospace;white-space:pre-wrap;word-break:break-all;line-height:1.5"><span style="color:#a6e3a1">${escapeHtml(prompt || 'user@machine:~$')}</span> <span>${escaped}</span>${cursor}</div>`;
  } else if (theme === 'email') {
    header = `<div style="background:#2a2a3a;padding:8px 16px;border-bottom:1px solid #444"><div style="color:#888;font-size:11px;font-family:sans-serif;margin-bottom:2px">To: recipient@example.com</div><div style="color:#888;font-size:11px;font-family:sans-serif">Subject: ${escapeHtml(title || 'Message')}</div></div>`;
    content = `<div style="padding:16px;font-family:'JetBrains Mono',monospace;white-space:pre-wrap;word-break:break-all;line-height:1.5"><span>${escaped}</span>${cursor}</div>`;
  } else if (theme === 'sms') {
    content = `<div style="display:flex;flex-direction:column;justify-content:flex-end;height:100%;padding:20px"><div style="background:#6366f1;color:#fff;padding:12px 16px;border-radius:18px 18px 4px 18px;max-width:80%;align-self:flex-end;font-family:-apple-system,sans-serif;font-size:${fontSize * 0.9}px;line-height:1.4"><span>${escaped}</span>${cursor}</div></div>`;
  } else {
    content = `<div style="padding:16px;font-family:'JetBrains Mono',monospace;white-space:pre-wrap;word-break:break-all;line-height:1.5"><span>${escaped}</span>${cursor}</div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONTS_LINK}
<style>@keyframes blink{50%{opacity:0}}*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden}</style>
</head><body style="background:${bgColor};color:${textColor};font-size:${fontSize}px;width:${width}px;height:${height}px">
${header}${content}</body></html>`;
}

async function generate(params, outputPath, format) {
  const p = {
    theme: 'editor',
    format: '16:9',
    resolution: '1080p',
    fps: 30,
    typeSpeed: 80,
    delSpeed: 40,
    fontSize: 20,
    bgColor: '#1e1e2e',
    textColor: '#cdd6f4',
    cursorColor: '#f5e0dc',
    startDelay: 500,
    endDelay: 1500,
    cursorBlink: true,
    sequences: [
      { action: 'type', text: 'const video = await generate();' },
      { action: 'pause', duration: 500 },
      { action: 'newline' },
      { action: 'type', text: 'console.log(video);' },
    ],
    title: 'untitled.txt',
    prompt: 'user@machine:~$',
    ...params,
  };

  const [width, height] = getResolution(p.format, p.resolution);
  const fps = p.fps;
  const frames = [];
  const page = await createPage(width, height);

  let text = '';
  const frameActions = [];

  if (p.startDelay > 0) {
    const count = Math.round(p.startDelay / 1000 * fps);
    for (let i = 0; i < count; i++) frameActions.push({ text: '', cursor: true });
  }

  for (const seq of p.sequences) {
    if (seq.action === 'type' && seq.text) {
      for (const ch of seq.text) {
        text += ch;
        frameActions.push({ text, cursor: true });
      }
    } else if (seq.action === 'delete' && seq.count) {
      for (let i = 0; i < seq.count && text.length > 0; i++) {
        text = text.slice(0, -1);
        frameActions.push({ text, cursor: true });
      }
    } else if (seq.action === 'pause' && seq.duration) {
      const count = Math.round(seq.duration / 1000 * fps);
      for (let i = 0; i < count; i++) frameActions.push({ text, cursor: p.cursorBlink ? i % (fps / 2) < fps / 4 : true });
    } else if (seq.action === 'newline') {
      text += '\n';
      frameActions.push({ text, cursor: true });
    }
  }

  if (p.endDelay > 0) {
    const count = Math.round(p.endDelay / 1000 * fps);
    for (let i = 0; i < count; i++) frameActions.push({ text, cursor: p.cursorBlink ? i % (fps / 2) < fps / 4 : true });
  }

  let prevData = null;
  for (let i = 0; i < frameActions.length; i++) {
    const fa = frameActions[i];
    const isSameAsPrev = i > 0 && fa.text === frameActions[i - 1].text;

    if (isSameAsPrev && prevData) {
      frames.push({ data: prevData, duration: 1 });
      continue;
    }

    const html = buildTypingHtml(p.theme, fa.text, fa.cursor, p.bgColor, p.textColor, p.cursorColor, p.fontSize, p.title, p.prompt, width, height);
    await loadHtml(page, html);
    if (i === 0) await waitForFonts(page);
    const d = await evalAndCapture(page, null);
    prevData = d;
    frames.push({ data: d, duration: 1 });
  }

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
