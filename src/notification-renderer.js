(function () {
  'use strict';

  var { ipcRenderer } = require('electron');

  var NOTIF_RES = RESOLUTIONS;

  var DESIGN_H = 540;
  var CARD_H = 100;

  var APP_ICONS = {
    'Instagram': '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>',
    'X': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    'TikTok': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.89a8.28 8.28 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.3z"/></svg>',
    'Wiadomo\u015Bci': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>',
    'WhatsApp': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.12 1.52 5.856L0 24l6.336-1.652A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.956 0-3.83-.528-5.456-1.484l-.392-.233-4.052 1.058 1.084-3.95-.257-.41A9.794 9.794 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z"/></svg>',
    'Mail': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>',
    'Snapchat': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.14-.05.273-.088.382-.088.14 0 .275.03.395.09.284.14.462.39.462.66 0 .33-.275.6-.479.75-.285.2-.659.359-.904.459-.12.045-.24.1-.32.16-.075.055-.095.1-.095.16.005.035.02.07.04.105.08.15.285.345.56.5.4.23.944.44 1.344.55.23.06.419.17.519.34.08.155.08.35.01.5-.195.459-.839.734-1.404.9-.29.08-.579.15-.784.2-.08.02-.14.055-.18.1-.04.05-.06.12-.08.21-.06.215-.195.37-.439.46-.235.085-.545.13-.845.17-.225.035-.47.07-.669.15-.25.1-.47.285-.72.47-.345.26-.744.555-1.344.555h-.04c-.6 0-1-.295-1.344-.555-.25-.185-.47-.37-.72-.47-.2-.08-.444-.115-.67-.15-.3-.04-.609-.085-.844-.17-.244-.09-.384-.245-.439-.46-.02-.09-.04-.16-.08-.21-.04-.045-.1-.08-.18-.1-.205-.05-.494-.12-.784-.2-.564-.165-1.209-.44-1.404-.9-.08-.15-.07-.345.01-.5.1-.17.29-.28.52-.34.4-.11.944-.32 1.343-.55.275-.155.48-.35.56-.5.02-.035.035-.07.04-.105 0-.06-.02-.105-.095-.16-.08-.06-.2-.115-.32-.16-.244-.1-.619-.26-.904-.46-.204-.15-.479-.419-.479-.749 0-.27.178-.52.462-.66a.855.855 0 01.395-.09c.11 0 .242.039.382.088.264.094.623.23.923.214.195 0 .326-.045.401-.09a11.93 11.93 0 01-.033-.57c-.104-1.628-.23-3.654.3-4.847C7.853 1.069 11.216.793 12.206.793z"/></svg>',
    'Telegram': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
    'YouTube': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path d="M9.545 15.568V8.432L15.818 12z" fill="#fff"/></svg>',
    'LinkedIn': '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    'App': '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>'
  };

  function getNotifWidth(w, h) {
    var ratio = w / h;
    if (ratio < 0.7) return Math.min(w * 0.88, 480);
    if (ratio < 1.1) return Math.min(w * 0.7, 460);
    return Math.min(w * 0.42, 420);
  }

  function getTimeLabels() {
    return [t('notifTimeNow'), '1 ' + t('notifTimeMinAgo'), '2 ' + t('notifTimeMinAgo'), '3 ' + t('notifTimeMinAgo'), '5 ' + t('notifTimeMinAgo'), '7 ' + t('notifTimeMinAgo'), '10 ' + t('notifTimeMinAgo'), '15 ' + t('notifTimeMinAgo'), '20 ' + t('notifTimeMinAgo'), '30 ' + t('notifTimeMinAgo'), '45 ' + t('notifTimeMinAgo'), t('notifTimeHourAgo')];
  }
  var TIME_LABELS = getTimeLabels();

  var PRESETS = {
    'ig-follow': { type: 'push', appName: 'Instagram', title: t('notifPresetIgFollowTitle'), message: t('notifPresetIgFollowMsg'), accentColor: '#E1306C' },
    'ig-like': { type: 'push', appName: 'Instagram', title: t('notifPresetIgLikeTitle'), message: t('notifPresetIgLikeMsg'), accentColor: '#E1306C' },
    'ig-comment': { type: 'push', appName: 'Instagram', title: t('notifPresetIgCommentTitle'), message: t('notifPresetIgCommentMsg'), accentColor: '#E1306C' },
    'ig-dm': { type: 'push', appName: 'Instagram', title: t('notifPresetIgDmTitle'), message: t('notifPresetIgDmMsg'), accentColor: '#E1306C' },
    'x-rt': { type: 'push', appName: 'X', title: t('notifPresetXRtTitle'), message: t('notifPresetXRtMsg'), accentColor: '#1DA1F2' },
    'x-like': { type: 'push', appName: 'X', title: t('notifPresetXLikeTitle'), message: t('notifPresetXLikeMsg'), accentColor: '#1DA1F2' },
    'x-mention': { type: 'push', appName: 'X', title: t('notifPresetXMentionTitle'), message: t('notifPresetXMentionMsg'), accentColor: '#1DA1F2' },
    'tt-follow': { type: 'push', appName: 'TikTok', title: t('notifPresetTtFollowTitle'), message: t('notifPresetTtFollowMsg'), accentColor: '#000000' },
    'sms': { type: 'sms', appName: 'Wiadomo\u015Bci', title: t('notifPresetSmsTitle'), message: t('notifPresetSmsMsg'), accentColor: '#34C759' },
    'whatsapp': { type: 'push', appName: 'WhatsApp', title: t('notifPresetWhatsappTitle'), message: t('notifPresetWhatsappMsg'), accentColor: '#25D366' },
    'email': { type: 'email', appName: 'Mail', title: t('notifPresetEmailTitle'), message: t('notifPresetEmailMsg'), accentColor: '#007AFF' },
    'snapchat': { type: 'push', appName: 'Snapchat', title: t('notifPresetSnapchatTitle'), message: t('notifPresetSnapchatMsg'), accentColor: '#FFFC00' },
    'telegram': { type: 'push', appName: 'Telegram', title: t('notifPresetTelegramTitle'), message: t('notifPresetTelegramMsg'), accentColor: '#0088CC' },
    'youtube': { type: 'push', appName: 'YouTube', title: t('notifPresetYoutubeTitle'), message: t('notifPresetYoutubeMsg'), accentColor: '#FF0000' },
    'linkedin': { type: 'push', appName: 'LinkedIn', title: t('notifPresetLinkedinTitle'), message: t('notifPresetLinkedinMsg'), accentColor: '#0A66C2' }
  };

  var st = {
    notifications: [],
    theme: 'ios',
    slideDirection: 'top',
    stackPosition: 'right',
    animSpeed: 800,
    slideDuration: 400,
    fadeOut: true,
    maxVisible: 5,
    stackOverlap: 0,
    format: '16:9',
    resolution: '1080p',
    animating: false,
    animRaf: null,
    scale: 1,
    customBg: '#f2f2f2',
    customBorder: '#e5e5e5',
    customTitle: '#000',
    customText: '#666',
    customRadius: 16,
    bgMode: 'white'
  };

  function getResolution() {
    return NOTIF_RES[st.format][st.resolution];
  }

  function getDesignDims() {
    var res = getResolution();
    var rw = res[0], rh = res[1];
    var dw = Math.round(rw * DESIGN_H / rh);
    return { dw: dw, dh: DESIGN_H, rw: rw, rh: rh };
  }

  function easeOutBack(t) {
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function getAppIcon(appName) {
    return APP_ICONS[appName] || APP_ICONS['App'];
  }

  function autoAssignTimes() {
    var count = st.notifications.length;
    st.notifications.forEach(function (n, i) {
      n.time = i < TIME_LABELS.length ? TIME_LABELS[i] : (i + ' ' + t('notifTimeMinAgo'));
    });
  }

  function buildNotifHtml(n, theme, w, h) {
    var notifW = getNotifWidth(w, h);
    var radius = theme === 'android' ? 24 : 16;

    var bg, border, titleColor, textColor, shadow, blur, appColor;
    if (theme === 'ios') {
      bg = 'rgba(255,255,255,0.92)';
      border = 'none';
      titleColor = '#000';
      textColor = '#666';
      shadow = '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)';
      blur = 'backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);';
      appColor = n.accentColor;
    } else if (theme === 'android') {
      bg = '#f8f9fa';
      border = 'none';
      titleColor = '#1a1a1a';
      textColor = '#5f6368';
      shadow = '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)';
      blur = '';
      appColor = n.accentColor;
    } else {
      bg = st.customBg;
      border = '1px solid ' + st.customBorder;
      titleColor = st.customTitle;
      textColor = st.customText;
      shadow = '0 4px 16px rgba(0,0,0,0.12)';
      blur = '';
      appColor = n.accentColor;
      radius = st.customRadius;
    }

    var iconSvg = getAppIcon(n.appName);

    return '<div class="notif-card" style="' +
      'width:' + notifW + 'px;' +
      'background:' + bg + ';' +
      'border:' + border + ';' +
      'border-radius:' + radius + 'px;' +
      'padding:14px 16px;' +
      'box-shadow:' + shadow + ';' +
      blur +
      'font-family:-apple-system,BlinkMacSystemFont,\'SF Pro Text\',\'Helvetica Neue\',system-ui,sans-serif;' +
      'display:flex;' +
      'flex-direction:column;' +
      'gap:6px;' +
      '">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<span style="display:flex;align-items:center;justify-content:center;color:' + appColor + ';line-height:1;flex-shrink:0">' + iconSvg + '</span>' +
        '<span style="font-size:13px;font-weight:600;color:' + appColor + ';letter-spacing:-0.01em">' + n.appName + '</span>' +
        '<span style="margin-left:auto;font-size:11px;color:' + textColor + ';opacity:0.6">' + n.time + '</span>' +
      '</div>' +
      '<div style="font-size:14px;font-weight:700;color:' + titleColor + ';line-height:1.25;letter-spacing:-0.01em">' + n.title + '</div>' +
      '<div style="font-size:13px;color:' + textColor + ';line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + n.message + '</div>' +
    '</div>';
  }

  function buildOffscreenHtml(opts) {
    var notifsJson = JSON.stringify(opts.notifications);
    var slideFrom = opts.slideDirection === 'top' ? -120 : 120;
    var stackPos = opts.stackPosition;
    var maxVis = opts.maxVisible;
    var fadeOutEnabled = opts.fadeOut;
    var slideDur = opts.slideDuration;
    var animSpd = opts.animSpeed;
    var theme = opts.theme;
    var w = opts.width;
    var h = opts.height;
    var overlap = opts.stackOverlap || 0;
    var customState = JSON.stringify({
      customBg: opts.customBg,
      customBorder: opts.customBorder,
      customTitle: opts.customTitle,
      customText: opts.customText,
      customRadius: opts.customRadius
    });
    var bgMode = opts.bgMode || 'greenscreen';
    var bgColors = { white: '#FFFFFF', greenscreen: '#00FF00', black: '#000000' };
    var bgColor = bgColors[bgMode] || bgColors.greenscreen;

    var iconsJson = JSON.stringify(APP_ICONS);
    var Z = h / DESIGN_H;

    return '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:' + w + 'px;height:' + h + 'px;overflow:hidden;background:' + bgColor + '}#c{position:relative;overflow:hidden;width:100%;height:100%}</style>' +
      '</head><body>' +
      '<div id="c"></div>' +
      '<script>' +
      'var IC=' + iconsJson + ';' +
      'var N=' + notifsJson + ';' +
      'var TH="' + theme + '";' +
      'var SF=' + slideFrom + ';' +
      'var SP="' + stackPos + '";' +
      'var MV=' + maxVis + ';' +
      'var FD=' + fadeOutEnabled + ';' +
      'var SD=' + slideDur + ';' +
      'var AS=' + animSpd + ';' +
      'var WW=' + w + ';HH=' + h + ';Z=' + Z.toFixed(6) + ';' +
      'var OV=' + overlap + ';' +
      'var CS=' + customState + ';' +
      'function EO(t){var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)}' +
      'function GW(w,h){var r=w/h;if(r<0.7)return Math.min(w*0.88,480*Z);if(r<1.1)return Math.min(w*0.7,460*Z);return Math.min(w*0.42,420*Z)}' +
      'function S(v){return Math.round(v*Z)}' +
      'function BH(n){' +
        'var nw=GW(WW,HH);var r=TH==="android"?S(24):S(16);' +
        'var bg,bdr,tc,txc,sh,bl,ac;' +
        'if(TH==="ios"){bg="rgba(255,255,255,0.92)";bdr="none";tc="#000";txc="#666";sh="0 "+S(8)+"px "+S(32)+"px rgba(0,0,0,0.18),0 2px "+S(8)+"px rgba(0,0,0,0.08)";bl="backdrop-filter:blur("+S(24)+"px);-webkit-backdrop-filter:blur("+S(24)+"px)";ac=n.accentColor}' +
        'else if(TH==="android"){bg="#f8f9fa";bdr="none";tc="#1a1a1a";txc="#5f6368";sh="0 2px "+S(8)+"px rgba(0,0,0,0.12),0 1px "+S(2)+"px rgba(0,0,0,0.08)";bl="";ac=n.accentColor}' +
        'else{bg=CS.customBg;bdr="1px solid "+CS.customBorder;tc=CS.customTitle;txc=CS.customText;sh="0 4px "+S(16)+"px rgba(0,0,0,0.12)";bl="";ac=n.accentColor;r=S(CS.customRadius)}' +
        'var ic=IC[n.appName]||IC["App"];' +
        'return"<div style=\\"width:"+nw+"px;background:"+bg+";border:"+bdr+";border-radius:"+r+"px;padding:"+S(14)+"px "+S(16)+"px;box-shadow:"+sh+";"+bl+"font-family:-apple-system,BlinkMacSystemFont,SF Pro Text,Helvetica Neue,system-ui,sans-serif;display:flex;flex-direction:column;gap:"+S(6)+"px\\"><div style=\\"display:flex;align-items:center;gap:"+S(8)+"px\\"><span style=\\"display:flex;align-items:center;justify-content:center;color:"+ac+";line-height:1;flex-shrink:0;width:"+S(18)+"px;height:"+S(18)+"px\\">"+ic+"</span><span style=\\"font-size:"+S(13)+"px;font-weight:600;color:"+ac+";letter-spacing:-0.01em\\">"+n.appName+"</span><span style=\\"margin-left:auto;font-size:"+S(11)+"px;color:"+txc+";opacity:0.6\\">"+n.time+"</span></div><div style=\\"font-size:"+S(14)+"px;font-weight:700;color:"+tc+";line-height:1.25;letter-spacing:-0.01em\\">"+n.title+"</div><div style=\\"font-size:"+S(13)+"px;color:"+txc+";line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap\\">"+n.message+"</div></div>"' +
      '}' +
      'window._uf=function(t){' +
        'var el=document.getElementById("c");el.innerHTML="";if(!N.length)return;' +
        'var tm=N.length*AS+2000;var elp=t*tm;var nw=GW(WW,HH);var vis=[];' +
        'for(var i=0;i<N.length;i++){var ns=i*AS;if(elp<ns)break;var lt=Math.min((elp-ns)/SD,1);vis.push({i:i,lt:lt})}' +
        'var ch=S(100);var g=S(10);var p=S(20);var st=ch+g-OV;' +
        'for(var v=vis.length-1;v>=0;v--){var it=vis[v];var ps=vis.length-1-v;var yo=p+(ps*st);if(it.lt<1)yo+=SF*(1-EO(it.lt))*Z;' +
        'var xo=p;if(SP==="right"){xo=WW-p-nw}else if(SP==="center"){xo=(WW-nw)/2}' +
        'var op=Math.min(it.lt*2.5,1);if(FD&&ps>=MV){var fi=ps-MV;op=Math.max(0,1-(fi+1)*0.35);if(op<=0)continue}' +
        'var d=document.createElement("div");d.style.cssText="position:absolute;left:"+xo+"px;top:"+yo+"px;opacity:"+op;d.innerHTML=BH(N[it.i]);el.appendChild(d)}}' +
      '<\/script>' +
      '</body></html>';
  }

  function renderPreview() {
    var area = $('[data-tool="notification"] .preview-area');
    var canvas = $('#notifPreviewCanvas');
    if (!area || !canvas) return;

    var dm = getDesignDims();
    var aw = area.clientWidth;
    var ah = area.clientHeight;
    var displayScale = Math.min(aw / dm.dw, ah / dm.dh, 1);

    var wrapper = $('#notifPreviewWrapper');
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

  var CHECKER = 'background:repeating-conic-gradient(#1a1a1e 0% 25%,#151518 0% 50%) 0 0/20px 20px';

  function renderPreviewContent() {
    var canvas = $('#notifPreviewCanvas');
    if (!canvas) return;

    var dm = getDesignDims();

    if (!st.notifications.length) {
      canvas.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#555;font-family:system-ui,sans-serif;font-size:14px;' + CHECKER + '">' + t('notifAddNotifications') + '</div>';
      return;
    }

    var html = '<div style="position:relative;width:100%;height:100%;' + CHECKER + ';overflow:hidden">';

    var notifW = getNotifWidth(dm.dw, dm.dh);
    var cardH = CARD_H;
    var gap = 10;
    var pad = 20;
    var step = cardH + gap - st.stackOverlap;
    var visible = st.notifications.slice(0, st.maxVisible);

    for (var i = visible.length - 1; i >= 0; i--) {
      var n = visible[i];
      var posInStack = visible.length - 1 - i;
      var yOff = pad + (posInStack * step);
      var xOff = pad;

      if (st.stackPosition === 'right') {
        xOff = dm.dw - pad - notifW;
      } else if (st.stackPosition === 'center') {
        xOff = (dm.dw - notifW) / 2;
      }

      html += '<div style="position:absolute;left:' + xOff + 'px;top:' + yOff + 'px;width:' + notifW + 'px">';
      html += buildNotifHtml(n, st.theme, dm.dw, dm.dh);
      html += '</div>';
    }

    html += '</div>';
    canvas.innerHTML = html;
  }

  function startAnimation() {
    if (!st.notifications.length) return;
    if (st.animating) stopAnimation();

    var canvas = $('#notifPreviewCanvas');
    if (!canvas) return;

    st.animating = true;
    var totalDuration = st.notifications.length * st.animSpeed + 2000;
    var start = performance.now();

    function frame(now) {
      if (!st.animating) return;
      var elapsed = now - start;
      var t = Math.min(elapsed / totalDuration, 1);
      renderAnimationFrame(canvas, t);
      if (t < 1) {
        st.animRaf = requestAnimationFrame(frame);
      } else {
        st.animating = false;
        var btn = $('#notifPlayBtn');
        if (btn) btn.querySelector('span').textContent = 'Play';
      }
    }

    st.animRaf = requestAnimationFrame(frame);
    var btn = $('#notifPlayBtn');
    if (btn) btn.querySelector('span').textContent = 'Playing...';
  }

  function stopAnimation() {
    if (st.animRaf) cancelAnimationFrame(st.animRaf);
    st.animating = false;
    st.animRaf = null;
    renderPreviewContent();
    var btn = $('#notifPlayBtn');
    if (btn) btn.querySelector('span').textContent = 'Play';
  }

  function renderAnimationFrame(canvas, t) {
    if (!st.notifications.length) return;

    var dm = getDesignDims();

    var totalMs = st.notifications.length * st.animSpeed + 2000;
    var elapsed = t * totalMs;
    var html = '<div style="position:relative;width:100%;height:100%;' + CHECKER + ';overflow:hidden">';

    var notifW = getNotifWidth(dm.dw, dm.dh);
    var cardH = CARD_H;
    var gap = 10;
    var pad = 20;
    var step = cardH + gap - st.stackOverlap;
    var visible = [];

    for (var i = 0; i < st.notifications.length; i++) {
      var nStart = i * st.animSpeed;
      if (elapsed < nStart) break;
      var localT = Math.min((elapsed - nStart) / st.slideDuration, 1);
      visible.push({ idx: i, localT: localT });
    }

    for (var v = visible.length - 1; v >= 0; v--) {
      var item = visible[v];
      var posInStack = visible.length - 1 - v;
      var slideFrom = st.slideDirection === 'top' ? -120 : 120;
      var eased = easeOutBack(item.localT);
      var slideY = slideFrom * (1 - eased);
      var yOff = pad + (posInStack * step);
      if (item.localT < 1) yOff += slideY;
      var xOff = pad;

      if (st.stackPosition === 'right') {
        xOff = dm.dw - pad - notifW;
      } else if (st.stackPosition === 'center') {
        xOff = (dm.dw - notifW) / 2;
      }

      var opacity = Math.min(item.localT * 2.5, 1);
      if (st.fadeOut && posInStack >= st.maxVisible) {
        var fadeIdx = posInStack - st.maxVisible;
        opacity = Math.max(0, 1 - (fadeIdx + 1) * 0.35);
        if (opacity <= 0) continue;
      }

      html += '<div style="position:absolute;left:' + xOff + 'px;top:' + yOff + 'px;opacity:' + opacity + '">';
      html += buildNotifHtml(st.notifications[item.idx], st.theme, dm.dw, dm.dh);
      html += '</div>';
    }

    html += '</div>';
    canvas.innerHTML = html;
  }

  function buildExportFrameSpecs(totalFrames, totalMs) {
    return NotificationCore.buildFramePlan({
      notificationCount: st.notifications.length,
      animSpeed: st.animSpeed,
      slideDuration: st.slideDuration,
      tailMs: totalMs - st.notifications.length * st.animSpeed
    }, totalFrames / (totalMs / 1000)).frames;
  }

  async function exportVideo(format) {
    if (!st.notifications.length || st.animating) return;

    var ext = format === 'mov' ? 'mov' : format === 'webm' ? 'webm' : 'mp4';
    var ipcMethod = format === 'mov' ? 'export-mov' : format === 'webm' ? 'export-webm' : 'export-mp4';
    var isAlpha = format === 'mov' || format === 'webm';

    var savePath = await ipcRenderer.invoke('save-dialog', {
      defaultName: 'notifications-' + Date.now() + '.' + ext,
      filters: [{ name: ext.toUpperCase(), extensions: [ext] }]
    });
    if (!savePath) return;

    var res = getResolution();
    var w = res[0], h = res[1];
    var fps = 30;
    var totalMs = st.notifications.length * st.animSpeed + 2000;
    var totalFrames = Math.round((totalMs / 1000) * fps);

    var setExporting = function (active, label, pct) {
      var prog = $('#notifExportProgress');
      if (!prog) return;
      prog.classList.toggle('active', active);
      if (label) $('#notifExportLabel').textContent = label;
      if (pct !== undefined) $('#notifExportBarFill').style.width = pct + '%';
      if (!active) $('#notifExportBarFill').style.width = '0%';
    };

    setExporting(true, t('notifPreparing'), 0);

    var html = buildOffscreenHtml({
      width: w, height: h,
      notifications: st.notifications,
      theme: st.theme,
      slideDirection: st.slideDirection,
      stackPosition: st.stackPosition,
      animSpeed: st.animSpeed,
      slideDuration: st.slideDuration,
      fadeOut: st.fadeOut,
      maxVisible: st.maxVisible,
      stackOverlap: st.stackOverlap,
      customBg: st.customBg,
      customBorder: st.customBorder,
      customTitle: st.customTitle,
      customText: st.customText,
      customRadius: st.customRadius,
      bgMode: st.bgMode
    });

    await ipcRenderer.invoke('bg-load-html', { html: html, width: w, height: h });
    setExporting(true, t('notifRenderingFrames'), 5);

    var frameSpecs = NotificationCore.buildFramePlan({
      notificationCount: st.notifications.length,
      animSpeed: st.animSpeed,
      slideDuration: st.slideDuration,
      tailMs: 2000
    }, fps).frames;
    var frames = [];
    var batchSize = 30;
    var batchItems = [];
    for (var i = 0; i < frameSpecs.length; i++) {
      var frameJs = 'window._uf(' + frameSpecs[i].t + ')';

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
        setExporting(true, t('notifFrame') + ' ' + (i + 1) + '/' + frameSpecs.length, pct);
      }
    }

    frames.push({ data: frames[frames.length - 1].data, duration: Math.round(fps * 1.5) });

    setExporting(true, t('notifEncoding') + ' ' + ext.toUpperCase() + '...', 90);
    await ipcRenderer.invoke(ipcMethod, { frames: frames, savePath: savePath, fps: fps, width: w, height: h });
    await ipcRenderer.invoke('bg-cleanup');

    setExporting(false);
  }

  function addNotification(preset) {
    var p = Object.assign({}, preset);
    delete p.time;
    st.notifications.push(p);
    autoAssignTimes();
    renderNotifList();
    renderPreviewContent();
  }

  function addCustomNotification() {
    st.notifications.push({
      type: 'push',
      appName: 'App',
      title: t('notifDefaultTitle'),
      message: t('notifDefaultMessage'),
      accentColor: '#6366f1'
    });
    autoAssignTimes();
    renderNotifList();
    renderPreviewContent();
  }

  function removeNotification(idx) {
    st.notifications.splice(idx, 1);
    autoAssignTimes();
    renderNotifList();
    renderPreviewContent();
  }

  function moveNotification(idx, dir) {
    var newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= st.notifications.length) return;
    var tmp = st.notifications[idx];
    st.notifications[idx] = st.notifications[newIdx];
    st.notifications[newIdx] = tmp;
    autoAssignTimes();
    renderNotifList();
    renderPreviewContent();
  }

  function renderNotifList() {
    var list = $('#notifList');
    if (!list) return;
    list.innerHTML = '';

    st.notifications.forEach(function (n, i) {
      var item = document.createElement('div');
      item.className = 'notif-list-item';

      var num = document.createElement('span');
      num.className = 'notif-list-num';
      num.textContent = i + 1;

      var iconWrap = document.createElement('span');
      iconWrap.className = 'notif-list-icon';
      iconWrap.innerHTML = getAppIcon(n.appName).replace(/currentColor/g, n.accentColor);

      var info = document.createElement('div');
      info.className = 'notif-list-info';

      var title = document.createElement('div');
      title.className = 'notif-list-title';
      title.textContent = n.appName + ' - ' + n.title;

      var msg = document.createElement('div');
      msg.className = 'notif-list-msg';
      msg.textContent = n.message;

      info.appendChild(title);
      info.appendChild(msg);

      var colorInp = document.createElement('input');
      colorInp.type = 'color';
      colorInp.className = 'control-color notif-list-color';
      colorInp.value = n.accentColor;
      (function (idx, inp) {
        inp.addEventListener('input', function () {
          st.notifications[idx].accentColor = inp.value;
          renderPreviewContent();
        });
      })(i, colorInp);

      var moveUp = document.createElement('button');
      moveUp.className = 'notif-list-move';
      moveUp.innerHTML = '\u25B2';
      moveUp.title = t('notifMoveUp');
      (function (idx) {
        moveUp.addEventListener('click', function () { moveNotification(idx, -1); });
      })(i);

      var moveDown = document.createElement('button');
      moveDown.className = 'notif-list-move';
      moveDown.innerHTML = '\u25BC';
      moveDown.title = t('notifMoveDown');
      (function (idx) {
        moveDown.addEventListener('click', function () { moveNotification(idx, 1); });
      })(i);

      var del = document.createElement('button');
      del.className = 'notif-list-del';
      del.innerHTML = '\u00D7';
      del.title = t('notifDelete');
      (function (idx) {
        del.addEventListener('click', function () { removeNotification(idx); });
      })(i);

      item.appendChild(num);
      item.appendChild(iconWrap);
      item.appendChild(info);
      item.appendChild(colorInp);
      item.appendChild(moveUp);
      item.appendChild(moveDown);
      item.appendChild(del);
      list.appendChild(item);
    });

    updateEditFields();
  }

  function updateEditFields() {
    var fields = $('#notifEditFields');
    if (!fields) return;

    if (!st.notifications.length) {
      fields.innerHTML = '<div style="font-size:11px;color:var(--text-dim);padding:8px;text-align:center">' + t('notifNoNotifications') + '</div>';
      return;
    }

    fields.innerHTML = '';
    st.notifications.forEach(function (n, i) {
      var row = document.createElement('div');
      row.className = 'notif-edit-row';

      var rowTitle = document.createElement('div');
      rowTitle.className = 'notif-edit-label';
      rowTitle.textContent = '#' + (i + 1) + ' ' + n.appName;

      var fieldsWrap = document.createElement('div');
      fieldsWrap.className = 'notif-edit-fields';

      var appNameInput = document.createElement('input');
      appNameInput.type = 'text';
      appNameInput.className = 'control-input notif-edit-input';
      appNameInput.value = n.appName;
      appNameInput.placeholder = t('notifPlaceholderAppName');
      (function (idx, inp) {
        inp.addEventListener('input', function () {
          st.notifications[idx].appName = inp.value;
          renderPreviewContent();
        });
      })(i, appNameInput);

      var titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.className = 'control-input notif-edit-input';
      titleInput.value = n.title;
      titleInput.placeholder = t('notifPlaceholderTitle');
      (function (idx, inp) {
        inp.addEventListener('input', function () {
          st.notifications[idx].title = inp.value;
          renderPreviewContent();
        });
      })(i, titleInput);

      var msgInput = document.createElement('input');
      msgInput.type = 'text';
      msgInput.className = 'control-input notif-edit-input';
      msgInput.value = n.message;
      msgInput.placeholder = t('notifPlaceholderMessage');
      (function (idx, inp) {
        inp.addEventListener('input', function () {
          st.notifications[idx].message = inp.value;
          renderPreviewContent();
        });
      })(i, msgInput);

      var timeInput = document.createElement('input');
      timeInput.type = 'text';
      timeInput.className = 'control-input notif-edit-input';
      timeInput.value = n.time;
      timeInput.placeholder = t('notifPlaceholderTime');
      (function (idx, inp) {
        inp.addEventListener('input', function () {
          st.notifications[idx].time = inp.value;
          renderPreviewContent();
        });
      })(i, timeInput);

      fieldsWrap.appendChild(appNameInput);
      fieldsWrap.appendChild(titleInput);
      fieldsWrap.appendChild(msgInput);
      fieldsWrap.appendChild(timeInput);

      row.appendChild(rowTitle);
      row.appendChild(fieldsWrap);
      fields.appendChild(row);
    });
  }

  var controlsBound = false;

  function bindControls() {
    if (controlsBound) return;
    controlsBound = true;
    $$('#notifThemeGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#notifThemeGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.theme = btn.dataset.theme;
        var cg = $('#notifCustomThemeGroup');
        if (cg) cg.style.display = st.theme === 'custom' ? '' : 'none';
        renderPreviewContent();
      });
    });

    function syncCustomVal(id, prop) {
      listen('#' + id, 'input', function (e) {
        st[prop] = e.target.value;
        var valId = id + 'Val';
        var valEl = $('#' + valId);
        if (valEl) valEl.textContent = e.target.value;
        renderPreviewContent();
      });
    }
    syncCustomVal('notifCustomBg', 'customBg');
    syncCustomVal('notifCustomBorder', 'customBorder');
    syncCustomVal('notifCustomTitle', 'customTitle');
    syncCustomVal('notifCustomText', 'customText');
    syncCustomVal('notifCustomRadius', 'customRadius');

    $$('#notifDirectionGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#notifDirectionGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.slideDirection = btn.dataset.dir;
      });
    });

    $$('#notifPositionGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#notifPositionGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.stackPosition = btn.dataset.pos;
        renderPreviewContent();
      });
    });

    $$('#notifFormatGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#notifFormatGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.format = btn.dataset.format;
        renderPreview();
      });
    });

    listen('#notifResolutionSelect', 'change', function (e) {
      st.resolution = e.target.value;
      renderPreview();
    });

    $$('#notifBgModeGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#notifBgModeGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.bgMode = btn.dataset.bgmode;
      });
    });

    listen('#notifAnimSpeed', 'input', function (e) {
      st.animSpeed = parseInt(e.target.value);
      var el = $('#notifAnimSpeedVal');
      if (el) el.textContent = st.animSpeed + 'ms';
    });

    listen('#notifMaxVisible', 'input', function (e) {
      st.maxVisible = parseInt(e.target.value);
      var el = $('#notifMaxVisibleVal');
      if (el) el.textContent = st.maxVisible;
      renderPreviewContent();
    });

    listen('#notifStackOverlap', 'input', function (e) {
      st.stackOverlap = parseInt(e.target.value);
      var el = $('#notifStackOverlapVal');
      if (el) el.textContent = st.stackOverlap + 'px';
      renderPreviewContent();
    });

    listen('#notifFadeOut', 'change', function (e) {
      st.fadeOut = e.target.checked;
    });

    listen('#notifPlayBtn', 'click', function () {
      if (st.animating) stopAnimation();
      else startAnimation();
    });

    listen('#notifStopBtn', 'click', function () {
      stopAnimation();
    });

    listen('#notifExportMov', 'click', function () {
      exportVideo('mov');
    });

    listen('#notifExportWebm', 'click', function () {
      exportVideo('webm');
    });

    listen('#notifExportMp4', 'click', function () {
      exportVideo('mp4');
    });

    listen('#notifAddCustom', 'click', function () {
      addCustomNotification();
    });

    listen('#notifClearBtn', 'click', function () {
      st.notifications = [];
      renderNotifList();
      renderPreviewContent();
    });

    $$('.notif-preset-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.preset;
        if (PRESETS[key]) {
          addNotification(PRESETS[key]);
        }
      });
    });
  }

  window.initNotificationTool = function () {
    bindControls();
    renderNotifList();
    renderPreview();
  };

  window.notificationActivate = function () {
    try { bindControls(); renderNotifList(); renderPreview(); } catch (e) { console.error('[notification] activate:', e); }
    setTimeout(function () {
      renderPreview();
    }, 150);
  };

  window.notificationUpdatePreviewSize = function () {
    renderPreview();
  };
})();
