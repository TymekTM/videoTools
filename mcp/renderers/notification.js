const { createPage, loadHtml, waitForFonts, evalAndCapture, createScreencast, closePage } = require('../lib/browser');
const { encode, countFrames } = require('../lib/encoder');
const { getResolution } = require('../registry');
const NotificationCore = require('../../shared/notification');

const FONTS_LINK = '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">';

const APP_ICONS = {
  'Instagram': '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>',
  'X': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  'TikTok': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.89a8.28 8.28 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.3z"/></svg>',
  'WhatsApp': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>',
  'Mail': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>',
  'Telegram': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
  'YouTube': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path d="M9.545 15.568V8.432L15.818 12z" fill="#fff"/></svg>',
  'LinkedIn': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
};

const TIME_LABELS = ['teraz', '1 min temu', '2 min temu', '3 min temu', '5 min temu', '7 min temu'];

const PRESETS = {
  'ig-follow': { appName: 'Instagram', title: 'Jan Kowalski', message: 'zaobserwował Cię!', accentColor: '#E1306C' },
  'ig-like': { appName: 'Instagram', title: 'Jan Kowalski', message: 'polubił Twoje zdjęcie.', accentColor: '#E1306C' },
  'ig-comment': { appName: 'Instagram', title: 'Jan Kowalski', message: 'skomentował: Świetne!', accentColor: '#E1306C' },
  'ig-dm': { appName: 'Instagram', title: 'Jan Kowalski', message: 'wysłał Ci wiadomość', accentColor: '#E1306C' },
  'x-rt': { appName: 'X', title: '@user123', message: 'podbił Twój tweet', accentColor: '#1DA1F2' },
  'x-like': { appName: 'X', title: '@user123', message: 'polubił Twój tweet', accentColor: '#1DA1F2' },
  'x-mention': { appName: 'X', title: '@user123', message: 'wspomniał o Tobie', accentColor: '#1DA1F2' },
  'tt-follow': { appName: 'TikTok', title: 'user456', message: 'zaobserwował Cię!', accentColor: '#000000' },
  'sms': { appName: 'Messages', title: 'Kamil', message: 'Grasz dziś wieczorem?', accentColor: '#34C759' },
  'whatsapp': { appName: 'WhatsApp', title: 'Kamil', message: 'Hej, co tam?', accentColor: '#25D366' },
  'email': { appName: 'Mail', title: 'Newsletter', message: 'Nowy post na blogu!', accentColor: '#007AFF' },
  'snapchat': { appName: 'Snapchat', title: 'user789', message: 'wysłał snapa!', accentColor: '#FFFC00' },
  'telegram': { appName: 'Telegram', title: 'Jan', message: 'Pamiętaj o spotkaniu', accentColor: '#0088CC' },
  'youtube': { appName: 'YouTube', title: 'Nowy film', message: 'Twój ulubiony twórca opublikował...', accentColor: '#FF0000' },
  'linkedin': { appName: 'LinkedIn', title: 'Jan Kowalski', message: 'połączył się z Tobą', accentColor: '#0A66C2' },
};

function buildBaseHtml(opts) {
  const bgColors = { white: '#fff', green: '#00ff00', black: '#000' };
  const bg = bgColors[opts.bgMode] || '#fff';
  const notifsJson = JSON.stringify(opts.notifications.map((n, i) => ({
    ...n,
    time: n.time || TIME_LABELS[Math.min(i, TIME_LABELS.length - 1)],
  })));
  const iconsJson = JSON.stringify(APP_ICONS);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONTS_LINK}
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden}</style>
</head><body style="background:${bg}">
<div id="container" style="position:absolute;inset:0"></div>
<script>
var notifs = ${notifsJson};
var icons = ${iconsJson};
var theme = '${opts.theme}';
var notifWidth = ${opts.notifWidth};
var cardH = 80;
var overlap = ${opts.stackOverlap};
var maxVisible = ${opts.maxVisible};
var slideDirection = '${opts.slideDirection}';
var stackPosition = '${opts.stackPosition}';
var customBg = '${opts.customBg || '#f2f2f2'}';
var customBorder = '${opts.customBorder || '#e5e5e5'}';
var customTitle = '${opts.customTitle || '#000'}';
var customText = '${opts.customText || '#666'}';
var customRadius = ${opts.customRadius || 16};

function easeOutBack(t) {
  var c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function buildCard(notif) {
  var accent = notif.accentColor || '#007AFF';
  var icon = icons[notif.appName] || icons['Mail'] || '';
  var time = notif.time || 'teraz';
  if (theme === 'android') {
    return '<div style="background:#fff;border-radius:16px;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;box-shadow:0 2px 12px rgba(0,0,0,0.08);width:'+notifWidth+'px;max-width:100%">' +
      '<div style="width:36px;height:36px;border-radius:50%;background:'+accent+';display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;font-size:14px">'+icon+'</div>' +
      '<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:12px;color:#000;margin-bottom:2px;font-family:DM Sans,sans-serif">'+notif.appName+' &middot; <span style="color:#999;font-weight:400">'+time+'</span></div>' +
      '<div style="font-weight:600;font-size:13px;color:#000;margin-bottom:1px;font-family:DM Sans,sans-serif">'+notif.title+'</div>' +
      '<div style="font-size:12px;color:#666;font-family:DM Sans,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+notif.message+'</div></div></div>';
  }
  else if (theme === 'custom') {
    return '<div style="background:'+customBg+';border:1px solid '+customBorder+';border-radius:'+customRadius+'px;padding:10px 14px;display:flex;gap:10px;align-items:flex-start;box-shadow:0 4px 16px rgba(0,0,0,0.12);width:'+notifWidth+'px;max-width:100%">' +
      '<div style="width:32px;height:32px;border-radius:8px;background:'+accent+';display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0">'+icon+'</div>' +
      '<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:11px;color:'+customTitle+';margin-bottom:2px;font-family:DM Sans,sans-serif">'+notif.appName+' &middot; <span style="color:'+customText+';font-weight:400">'+time+'</span></div>' +
      '<div style="font-weight:600;font-size:13px;color:'+customTitle+';margin-bottom:1px;font-family:DM Sans,sans-serif">'+notif.title+'</div>' +
      '<div style="font-size:12px;color:'+customText+';font-family:DM Sans,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+notif.message+'</div></div></div>';
  }
  return '<div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:16px;padding:10px 14px;display:flex;gap:10px;align-items:flex-start;box-shadow:0 2px 16px rgba(0,0,0,0.06);width:'+notifWidth+'px;max-width:100%">' +
    '<div style="width:32px;height:32px;border-radius:8px;background:'+accent+';display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0">'+icon+'</div>' +
    '<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:11px;color:#000;margin-bottom:2px;font-family:DM Sans,sans-serif">'+notif.appName+' &middot; <span style="color:#999;font-weight:400">'+time+'</span></div>' +
    '<div style="font-weight:600;font-size:13px;color:#000;margin-bottom:1px;font-family:DM Sans,sans-serif">'+notif.title+'</div>' +
    '<div style="font-size:12px;color:#666;font-family:DM Sans,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+notif.message+'</div></div></div>';
}

window._renderState = function(visibleCount, slideProgress) {
  var container = document.getElementById('container');
  var html = '';
  var total = Math.min(visibleCount + (slideProgress >= 0 ? 1 : 0), maxVisible);
  for (var i = 0; i < total; i++) {
    var notif = notifs[Math.min(i, notifs.length - 1)];
    var isLast = i === total - 1 && slideProgress >= 0;
    var transform = '';
    var opacity = '1';
    if (isLast) {
      var p = easeOutBack(Math.max(0, Math.min(1, slideProgress)));
      var slideFrom = slideDirection === 'top' ? -100 : 100;
      transform = 'transform:translateY(' + (slideFrom * (1 - p)).toFixed(1) + 'px) scale(' + (0.8 + 0.2 * p).toFixed(3) + ');';
      opacity = Math.max(0, Math.min(1, slideProgress)).toFixed(2);
    }
    var yPos = 16 + i * (cardH - overlap);
    var pos = '';
    if (stackPosition === 'left') pos = 'left:16px;' + transform;
    else if (stackPosition === 'right') pos = 'right:16px;' + transform;
    else pos = 'left:50%;transform:translateX(-50%);' + transform;
    html += '<div style="position:absolute;'+pos+'top:'+yPos+'px;opacity:'+opacity+';z-index:'+(total - i)+'">';
    html += buildCard(notif);
    html += '</div>';
  }
  container.innerHTML = html;
};
<\/script></body></html>`;
}

function getNotifWidth(w, h) {
  const ratio = w / h;
  if (ratio < 0.7) return Math.min(w * 0.88, 480);
  if (ratio < 1.1) return Math.min(w * 0.7, 460);
  return Math.min(w * 0.42, 420);
}

async function generate(params, outputPath, format) {
  const p = {
    theme: 'ios',
    notifications: [
      { appName: 'Instagram', title: 'Jan Kowalski', message: 'zaobserwował Cię!', accentColor: '#E1306C' },
      { appName: 'X', title: '@user123', message: 'podbił Twój tweet', accentColor: '#1DA1F2' },
      { appName: 'WhatsApp', title: 'Kamil', message: 'Grasz dziś wieczorem?', accentColor: '#25D366' },
    ],
    format: '9:16', resolution: '1080p', fps: 30,
    slideDirection: 'top', stackPosition: 'right',
    animSpeed: 800, slideDuration: 400, maxVisible: 5, stackOverlap: 0,
    fadeOut: true, bgMode: 'white',
    customBg: '#f2f2f2', customBorder: '#e5e5e5', customTitle: '#000', customText: '#666', customRadius: 16,
    ...params,
  };

  if (p.preset && PRESETS[p.preset]) {
    p.notifications = [PRESETS[p.preset], ...(p.notifications || [])];
  }

  const [width, height] = getResolution(p.format, p.resolution);
  const fps = p.fps;
  const notifs = p.notifications;
  const useAlpha = (format === 'mov' || format === 'webm');
  const captureFormat = useAlpha ? 'png' : 'jpeg';

  const baseHtml = NotificationCore.buildOffscreenHtml({
    width, height, theme: p.theme, notifications: notifs.map((notification, index) => ({
      ...notification,
      time: notification.time || TIME_LABELS[Math.min(index, TIME_LABELS.length - 1)],
    })),
    slideDirection: p.slideDirection, stackPosition: p.stackPosition,
    animSpeed: p.animSpeed, slideDuration: p.slideDuration,
    fadeOut: p.fadeOut, maxVisible: p.maxVisible, stackOverlap: p.stackOverlap,
    bgMode: p.bgMode, icons: APP_ICONS,
    customBg: p.customBg, customBorder: p.customBorder, customTitle: p.customTitle, customText: p.customText, customRadius: p.customRadius,
  });

  const page = await createPage(width, height);
  await loadHtml(page, baseHtml);
  await waitForFonts(page);

  const plan = NotificationCore.buildFramePlan({
    notificationCount: notifs.length,
    animSpeed: p.animSpeed,
    slideDuration: p.slideDuration,
    tailMs: 2000,
  }, fps);
  const frames = [];
  const outputFormat = format || 'mp4';
  let screencast = null;
  try {
    if (outputFormat === 'mp4') {
      screencast = await createScreencast(page, {
        width,
        height,
        format: 'jpeg',
        quality: 92,
        unchangedTimeoutMs: 100,
      });
    }
    for (const spec of plan.frames) {
      const js = `window._uf(${spec.t})`;
      const d = screencast
        ? await screencast.capture(js)
        : await evalAndCapture(page, js, captureFormat);
      frames.push({ data: d, duration: spec.duration });
    }
  } finally {
    if (screencast) await screencast.stop();
    await closePage(page);
  }

  frames[frames.length - 1].duration += Math.round(fps * 1.5);

  await encode(frames, outputPath, fps, width, height, outputFormat);

  const fs = require('fs');
  const stat = fs.statSync(outputPath);
  const frameCount = countFrames(frames);
  return {
    success: true,
    filePath: outputPath,
    fileSize: stat.size,
    duration: frameCount / fps,
    frames: frameCount,
  };
}

module.exports = { generate, buildFramePlan: NotificationCore.buildFramePlan };
