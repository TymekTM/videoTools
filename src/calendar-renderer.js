(function () {
  'use strict';

  var { ipcRenderer } = require('electron');

  var CAL_RES = RESOLUTIONS;

  var MONTH_NAMES = {
    pl: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };
  var DAY_FULL = {
    pl: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'],
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  };
  var DAY_SHORT = {
    pl: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };

  var EASING_FNS = {
    linear: function (t) { return t; },
    easeInOut: function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    easeOut: function (t) { return 1 - Math.pow(1 - t, 3); },
    easeIn: function (t) { return t * t * t; },
    expoOut: function (t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    bounce: function (t) {
      var n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
      if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
      return n * (t -= 2.625 / d) * t + 0.984375;
    },
    spring: function (t) { return 1 - Math.cos(t * 4.5 * Math.PI) * Math.exp(-t * 6); }
  };

  var PALETTES = {
    midnight: { bg: '#0E1117', bgTop: '#1A2030', text: '#EDEAE3', muted: '#6B7280', accent: '#D4A24C' },
    paper:    { bg: '#E9E3D6', bgTop: '#F5F1E8', text: '#1C1B17', muted: '#A39A8A', accent: '#B5462F' },
    ink:      { bg: '#101419', bgTop: '#1B2129', text: '#E6E9EF', muted: '#6A717C', accent: '#6FA8DC' },
    forest:   { bg: '#0F1E18', bgTop: '#1B2D24', text: '#E8ECE3', muted: '#72897D', accent: '#C9A24B' },
    mono:     { bg: '#141414', bgTop: '#222222', text: '#EDEDED', muted: '#6A6A6A', accent: '#FFFFFF' }
  };

  var PREVIEW_PROGRESS = 0.93;

  var st = {
    calendarType: 'month',
    palette: 'midnight',
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    focusDay: new Date().getDate(),
    startMonth: 0,
    startDay: 0,
    transitionEnabled: false,
    transitionDuration: 2.0,
    startWeekOnMonday: true,
    lang: 'pl',
    events: [
      { day: new Date().getDate(), text: 'Ważne spotkanie 14:00', color: '#D4A24C' },
      { day: Math.min(28, new Date().getDate() + 8), text: 'Urodziny Kasi', color: '#6FA8DC' }
    ],
    monthNames: MONTH_NAMES.pl,
    dayFull: DAY_FULL.pl,
    dayShort: DAY_SHORT.pl,
    bgColor: '#0E1117',
    bgTop: '#1A2030',
    textColor: '#EDEAE3',
    weekendColor: '#6B7280',
    highlightColor: '#D4A24C',
    fontSize: 32,
    zoomAmount: 3.0,
    animDuration: 4.5,
    easing: 'expoOut',
    showWeekdays: true,
    showYear: true,
    format: '16:9',
    resolution: '1080p',
    animating: false,
    animRaf: null,
    canvas: null,
    ctx: null
  };

  function getResolution() { return CAL_RES[st.format][st.resolution]; }

  function refreshNames() {
    st.monthNames = MONTH_NAMES[st.lang] || MONTH_NAMES.pl;
    st.dayFull = DAY_FULL[st.lang] || DAY_FULL.pl;
    st.dayShort = DAY_SHORT[st.lang] || DAY_SHORT.pl;
  }

  function applyPalette(name) {
    var p = PALETTES[name] || PALETTES.midnight;
    st.palette = name;
    st.bgColor = p.bg; st.bgTop = p.bgTop; st.textColor = p.text;
    st.weekendColor = p.muted; st.highlightColor = p.accent;
    var map = { calendarBgColor: p.bg, calendarTextColor: p.text, calendarHighlightColor: p.accent, calendarMutedColor: p.muted };
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) el.value = map[id]; });
  }

  function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function phaseT(p, a, b) { if (b <= a) return p >= b ? 1 : 0; var x = (p - a) / (b - a); return x < 0 ? 0 : (x > 1 ? 1 : x); }
  function ease(t) { var fn = EASING_FNS[st.easing] || EASING_FNS.expoOut; return fn(clamp(t, 0, 1)); }
  function eOut(t) { return EASING_FNS.expoOut(clamp(t, 0, 1)); }

  function hexToRgb(hex) {
    var h = (hex || '#000000').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return { r: parseInt(h.slice(0, 2), 16) || 0, g: parseInt(h.slice(2, 4), 16) || 0, b: parseInt(h.slice(4, 6), 16) || 0 };
  }
  function rgba(hex, a) { var c = hexToRgb(hex); return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')'; }

  var _fc = new Map();
  function fontStr(weight, size) {
    var key = weight + '|' + Math.round(size);
    var c = _fc.get(key);
    if (c) return c;
    var r = weight + ' ' + Math.max(size, 8) + 'px "Manrope", system-ui, sans-serif';
    _fc.set(key, r);
    return r;
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (w < 0 || h < 0) return;
    if (r < 0) r = 0;
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, maxW) {
    var words = String(text).split(/\s+/);
    var lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var test = cur ? cur + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = words[i]; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function drawSpaced(ctx, text, x, y, tracking, align) {
    align = align || 'left';
    var chars = String(text).split('');
    var widths = chars.map(function (c) { return ctx.measureText(c).width; });
    var total = widths.reduce(function (s, wd) { return s + wd; }, 0) + tracking * Math.max(0, chars.length - 1);
    var startX = align === 'center' ? x - total / 2 : (align === 'right' ? x - total : x);
    var prevAlign = ctx.textAlign, prevBase = ctx.textBaseline;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    var cur = startX;
    for (var i = 0; i < chars.length; i++) { ctx.fillText(chars[i], cur, y); cur += widths[i] + tracking; }
    ctx.textAlign = prevAlign; ctx.textBaseline = prevBase;
  }

  function buildMonthGrid(year, month, startMonday) {
    var firstDow = new Date(year, month, 1).getDay();
    var offset = startMonday ? (firstDow === 0 ? 6 : firstDow - 1) : firstDow;
    var dim = daysInMonth(year, month);
    var dimPrev = daysInMonth(year, month === 0 ? 11 : month - 1);
    var cells = [];
    for (var i = 0; i < 42; i++) {
      var dayNum, inMonth = true;
      if (i < offset) { dayNum = dimPrev - (offset - 1 - i); inMonth = false; }
      else if (i >= offset + dim) { dayNum = i - offset - dim + 1; inMonth = false; }
      else { dayNum = i - offset + 1; }
      cells.push({ day: dayNum, inMonth: inMonth });
    }
    return cells;
  }

  function eventsForDay(day) { return (st.events || []).filter(function (e) { return e.day === day; }); }

  /* ─── BACKGROUND ─── */
  function drawBg(ctx, w, h) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, st.bgTop);
    g.addColorStop(1, st.bgColor);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    var rg = ctx.createRadialGradient(w / 2, h * 0.42, Math.min(w, h) * 0.15, w / 2, h * 0.5, Math.max(w, h) * 0.78);
    rg.addColorStop(0, 'rgba(0,0,0,0)');
    rg.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
  }

  function drawCardSurface(ctx, x, y, cw, ch, r) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = Math.max(cw, ch) * 0.07;
    ctx.shadowOffsetY = ch * 0.028;
    var g = ctx.createLinearGradient(0, y, 0, y + ch);
    g.addColorStop(0, st.bgTop);
    g.addColorStop(1, st.bgColor);
    roundRect(ctx, x, y, cw, ch, r);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    roundRect(ctx, x + 0.5, y + 0.5, cw - 1, ch - 1, r);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = rgba(st.textColor, 0.08);
    ctx.stroke();
  }

  function detailPanelH(h, isPortrait) { return isPortrait ? h * 0.30 : h * 0.24; }

  /* shared timeline: resolves active month/day, flip squish, zoom + motion blur at a given progress.
     Drives the transition in BOTH month and flip modes. */
  function resolveTimeline(progress) {
    var endMonth = st.month, endDay = st.focusDay;
    var from = st.transitionEnabled;
    var startMonth = clamp(st.startMonth, 0, 11);
    var startDay = st.startDay;
    var numFlips = from ? (endMonth - startMonth + 12) % 12 : 0;
    var useStart = from && startDay > 0;
    var useTravel = numFlips > 0;
    var T = Math.max(0.3, st.animDuration);
    var tIntro = Math.min(0.6, T * 0.25);
    var tEndZoom = Math.min(1.5, T * 0.4);
    var pIntro = tIntro / T;
    var pEndZoomStart = 1 - tEndZoom / T;
    var tStartZoom = useStart ? Math.min(1.0, (pEndZoomStart - pIntro) * T * 0.45) : 0;
    var pStartZoom = pIntro + tStartZoom / T;
    var availTravel = Math.max(0, (pEndZoomStart - pStartZoom) * T);
    var tTravel = useTravel ? Math.min(st.transitionDuration, availTravel) : 0;
    var pTravelEnd = pStartZoom + tTravel / T;
    if (pTravelEnd > pEndZoomStart) pTravelEnd = pEndZoomStart;

    var r = { activeMonth: from ? startMonth : endMonth, activeDay: (from ? startDay : endDay), sy: 1, zoomTeff: 0, markerT: 0, flipSpeed: 0, inTravel: false, pEndZoomStart: pEndZoomStart };
    if (progress < pIntro) {
      /* intro: defaults */
    } else if (useStart && progress < pStartZoom) {
      var sz = phaseT(progress, pIntro, pStartZoom);
      r.activeMonth = startMonth; r.activeDay = startDay; r.zoomTeff = sz; r.markerT = EASING_FNS.spring(sz);
    } else if (useTravel && progress < pTravelEnd) {
      var tt = (progress - pStartZoom) / (pTravelEnd - pStartZoom || 0.0001);
      var pos = tt * numFlips;
      var fi = Math.floor(pos); if (fi >= numFlips) fi = numFlips - 1;
      var fl = pos - fi;
      var angle = EASING_FNS.easeInOut(fl) * Math.PI;
      r.sy = Math.max(Math.abs(Math.cos(angle)), 0.001);
      r.activeMonth = (startMonth + fi + (angle >= Math.PI / 2 ? 1 : 0)) % 12;
      r.activeDay = 0; r.inTravel = true; r.flipSpeed = 1 - Math.abs(2 * fl - 1);
    } else if (progress < pEndZoomStart) {
      r.activeMonth = endMonth; r.activeDay = 0;
    } else {
      var ez = phaseT(progress, pEndZoomStart, 1.0);
      r.activeMonth = endMonth; r.activeDay = endDay;
      r.zoomTeff = endDay > 0 ? ez : 0;
      r.markerT = endDay > 0 ? EASING_FNS.spring(ez) : 0;
    }
    return r;
  }

  /* ─── MONTH MODE ─── */
  function drawMonth(ctx, w, h, progress) {
    var isPortrait = st.format === '9:16';
    var isSquare = st.format === '1:1';
    var dph = detailPanelH(h, isPortrait);
    var regionTop = h * 0.07;
    var regionBottom = h - dph - h * 0.02;
    var regionH = regionBottom - regionTop;
    var cardW = isPortrait ? w * 0.86 : (isSquare ? w * 0.72 : w * 0.58);
    var cardH = regionH;
    if (cardH / cardW > 1.25) cardH = cardW * 1.25;
    var cardX = (w - cardW) / 2;
    var cardY = regionTop;
    var r = Math.min(cardW, cardH) * 0.03;

    var cardIn = eOut(phaseT(progress, 0, 0.22));

    /* card surface (static frame, rises in) */
    ctx.save();
    ctx.globalAlpha = cardIn;
    ctx.translate(0, (1 - cardIn) * h * 0.025);
    drawCardSurface(ctx, cardX, cardY, cardW, cardH, r);
    ctx.restore();

    var ccx = cardX + cardW / 2;
    if (st.transitionEnabled) {
      /* transition mode: cycle months (big grid flips) + zoom start/end days */
      var tl = resolveTimeline(progress);
      ctx.save();
      roundRect(ctx, cardX, cardY, cardW, cardH, r);
      ctx.clip();
      if (tl.inTravel) {
        ctx.translate(ccx, cardY);
        ctx.scale(1, tl.sy);
        ctx.translate(-ccx, -cardY);
        if (tl.flipSpeed > 0.05) ctx.filter = 'blur(' + (tl.flipSpeed * 2.4).toFixed(2) + 'px)';
      }
      drawMonthInner(ctx, cardX, cardY, cardW, cardH, r, tl.activeMonth, tl.activeDay, 1, 1, tl.markerT, tl.zoomTeff);
      ctx.filter = 'none';
      ctx.restore();
    } else {
      var headT = phaseT(progress, 0.14, 0.32);
      var cellsT = phaseT(progress, 0.22, 0.52);
      var markerT = phaseT(progress, 0.46, 0.64);
      var zoomT = phaseT(progress, 0.6, 0.96);
      drawMonthInner(ctx, cardX, cardY, cardW, cardH, r, st.month, st.focusDay, headT, cellsT, markerT, zoomT);
    }
  }

  function drawMonthInner(ctx, cardX, cardY, cardW, cardH, r, monthIndex, day, headT, cellsT, markerT, zoomT) {
    var cols = 7, rows = 6;
    var cells = buildMonthGrid(st.year, monthIndex, st.startWeekOnMonday);
    var dim = daysInMonth(st.year, monthIndex);
    var isOverview = day <= 0;
    var zoomTeff = isOverview ? 0 : zoomT;
    var focusDay = isOverview ? 1 : clamp(day, 1, dim);
    var focusIdx = -1;
    if (!isOverview) { for (var fi = 0; fi < cells.length; fi++) { if (cells[fi].inMonth && cells[fi].day === focusDay) { focusIdx = fi; break; } } }
    var frow = focusIdx >= 0 ? Math.floor(focusIdx / cols) : 0, fcol = focusIdx >= 0 ? focusIdx % cols : 0;

    var padX = cardW * 0.07;
    var topPad = cardH * 0.07;
    var em = cardW * 0.03;
    var headerH = em * 1.9;
    var dividerY = cardY + topPad + headerH;
    var weekdayH = em * 1.1;
    var gridLeft = cardX + padX;
    var gridRight = cardX + cardW - padX;
    var gridTop = dividerY + weekdayH + em * 0.5;
    var gridBottom = cardY + cardH - topPad;
    var cellW = (gridRight - gridLeft) / cols;
    var cellH = (gridBottom - gridTop) / rows;
    var fcx = gridLeft + fcol * cellW + cellW / 2;
    var fcy = gridTop + frow * cellH + cellH / 2;
    var ccx = cardX + cardW / 2, ccy = cardY + cardH / 2;

    var z = 1 + (st.zoomAmount - 1) * eOut(zoomTeff);
    var headFade = 1 - zoomTeff * 0.9;

    ctx.save();
    roundRect(ctx, cardX, cardY, cardW, cardH, r);
    ctx.clip();
    if (!isOverview) {
      ctx.translate(ccx, ccy);
      ctx.scale(z, z);
      ctx.translate(-fcx, -fcy);
    }

    /* header */
    if (headT > 0 && headFade > 0.01) {
      ctx.save();
      ctx.globalAlpha = headT * headFade;
      ctx.textBaseline = 'alphabetic';
      var hy = cardY + topPad + em * 1.4;
      ctx.fillStyle = st.textColor;
      ctx.font = fontStr('800', em * 1.5);
      ctx.textAlign = 'left';
      ctx.fillText(st.monthNames[monthIndex], gridLeft, hy + (1 - headT) * em * 0.4);
      if (st.showYear) {
        var ystr = String(st.year);
        ctx.font = fontStr('600', em * 0.4);
        var yw = ctx.measureText(ystr).width + em * 0.18 * Math.max(0, ystr.length - 1);
        ctx.fillStyle = st.weekendColor;
        drawSpaced(ctx, ystr, gridRight, hy - em * 0.5, em * 0.18, 'right');
        ctx.fillStyle = st.highlightColor;
        ctx.beginPath();
        ctx.arc(gridRight - yw - em * 0.55, hy - em * 0.5, em * 0.14, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    /* divider */
    if (headT > 0 && headFade > 0.01) {
      ctx.save();
      ctx.globalAlpha = headT * headFade * 0.6;
      ctx.strokeStyle = rgba(st.textColor, 0.12);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gridLeft, dividerY);
      ctx.lineTo(gridRight, dividerY);
      ctx.stroke();
      ctx.restore();
    }

    /* weekday row */
    if (st.showWeekdays && headT > 0 && headFade > 0.01) {
      ctx.save();
      ctx.globalAlpha = headT * headFade;
      ctx.fillStyle = st.weekendColor;
      ctx.font = fontStr('600', em * 0.42);
      for (var wd = 0; wd < cols; wd++) {
        var cxw = gridLeft + wd * cellW + cellW / 2;
        drawSpaced(ctx, st.dayShort[wd].toUpperCase(), cxw, dividerY + weekdayH * 0.55, em * 0.16, 'center');
      }
      ctx.restore();
    }

    /* cells */
    var markerScale = EASING_FNS.spring(markerT);
    var numberFont = fontStr('600', em * 0.74);
    var numberFontBold = fontStr('700', em * 0.74);
    var markerSize = Math.min(cellW, cellH) * 0.74;

    for (var ci = 0; ci < cells.length; ci++) {
      var cell = cells[ci];
      var row = Math.floor(ci / cols), col = ci % cols;
      var cx = gridLeft + col * cellW + cellW / 2;
      var cy = gridTop + row * cellH + cellH / 2;

      var rowDelay = row * 0.07;
      var cp = ease(clamp((cellsT - rowDelay) / 0.6, 0, 1));
      if (cp <= 0.001) continue;

      var isFocus = (ci === focusIdx);
      var weekend = st.startWeekOnMonday ? (col >= 5) : (col === 0 || col === 6);
      var nonFocusFade = isFocus ? 1 : (1 - zoomTeff * 0.82);
      var alpha = cp * (cell.inMonth ? 1 : 0.32) * nonFocusFade;
      if (alpha <= 0.002) continue;
      var lift = (1 - cp) * cellH * 0.35;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (isFocus && markerT > 0) {
        var ms = markerSize * markerScale;
        ctx.fillStyle = st.highlightColor;
        roundRect(ctx, cx - ms / 2, cy - ms / 2, ms, ms, ms * 0.28);
        ctx.fill();
      }

      ctx.font = isFocus ? numberFontBold : numberFont;
      ctx.fillStyle = isFocus ? st.bgColor : (weekend ? st.weekendColor : st.textColor);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(cell.day), cx, cy - lift);

      /* event dots (non-focus in-month days, hidden once zooming) */
      if (cell.inMonth && !isFocus && zoomTeff < 0.35) {
        var evs = eventsForDay(cell.day);
        if (evs.length && cp > 0.5) {
          var dotR = Math.min(cellW, cellH) * 0.055;
          var step = dotR * 2.6;
          var total = evs.length * step - dotR * 0.6;
          var dsx = cx - total / 2 + dotR / 2;
          var dsy = cy + cellH * 0.26;
          ctx.globalAlpha = alpha * clamp((cellsT - 0.5) * 2, 0, 1);
          for (var e = 0; e < Math.min(evs.length, 3); e++) {
            ctx.fillStyle = evs[e].color || st.highlightColor;
            ctx.beginPath();
            ctx.arc(dsx + e * step, dsy, dotR, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }
    ctx.restore();
  }

  /* ─── DETAIL PANEL (lower-third, screen space) ─── */
  function drawDetailPanel(ctx, w, h, t) {
    if (t <= 0) return;
    var isPortrait = st.format === '9:16';
    var panelH = detailPanelH(h, isPortrait);
    var padX = w * 0.07;
    var slide = (1 - eOut(t)) * panelH * 0.5;
    var topY = h - panelH + slide;

    var dim = daysInMonth(st.year, st.month);
    var fd = clamp(st.focusDay, 1, dim);
    var dow = new Date(st.year, st.month, fd).getDay();
    var wdi = (dow + 6) % 7;
    var em = panelH * 0.1;

    ctx.save();
    ctx.globalAlpha = t;

    /* accent rule */
    ctx.strokeStyle = rgba(st.highlightColor, 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padX, topY);
    ctx.lineTo(padX + em * 4, topY);
    ctx.stroke();

    /* date row (number + weekday/month to its right) */
    var dateY = topY + panelH * 0.24;
    ctx.fillStyle = st.highlightColor;
    ctx.font = fontStr('800', panelH * 0.32);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(fd), padX, dateY);
    var numW = ctx.measureText(String(fd)).width;
    var textX = padX + numW + em * 1.1;
    ctx.fillStyle = st.weekendColor;
    ctx.font = fontStr('600', em * 0.92);
    drawSpaced(ctx, st.dayFull[wdi].toUpperCase(), textX, dateY - em * 0.5, em * 0.22, 'left');
    ctx.fillStyle = st.textColor;
    ctx.font = fontStr('500', em * 0.92);
    ctx.fillText(st.monthNames[st.month] + '  ' + st.year, textX, dateY + em * 0.6);

    /* events stacked below, full width (no horizontal collision) */
    var evs = eventsForDay(fd);
    if (evs.length) {
      var evY0 = topY + panelH * 0.5;
      var lh = panelH * 0.16;
      var maxW = w - padX * 2;
      ctx.font = fontStr('500', em * 0.92);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      var shown = evs.slice(0, isPortrait ? 2 : 3);
      for (var k = 0; k < shown.length; k++) {
        var lt = clamp((t - 0.12 - k * 0.08) / 0.3, 0, 1);
        if (lt <= 0) continue;
        ctx.globalAlpha = t * lt;
        var ly = evY0 + k * lh;
        ctx.fillStyle = shown[k].color || st.highlightColor;
        ctx.beginPath();
        ctx.arc(padX + em * 0.3, ly, em * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = st.textColor;
        var line = wrapText(ctx, shown[k].text, maxW - em)[0] || shown[k].text;
        ctx.fillText(line, padX + em * 1.1, ly);
      }
      if (evs.length > shown.length) {
        ctx.globalAlpha = t * 0.5;
        ctx.fillStyle = st.weekendColor;
        ctx.font = fontStr('500', em * 0.8);
        ctx.fillText('+' + (evs.length - shown.length), padX + em * 1.1, evY0 + shown.length * lh);
      }
    }
    ctx.restore();
  }

  /* ─── FLIP MODE (flies through months, lands on target, then zoom into day) ─── */
  function drawFlip(ctx, w, h, progress) {
    var isPortrait = st.format === '9:16';
    var dph = detailPanelH(h, isPortrait);
    var regionTop = h * 0.07;
    var regionBottom = h - dph - h * 0.02;
    var regionH = regionBottom - regionTop;

    var cardH = regionH * 0.9;
    var cardW = cardH / 0.82;
    if (cardW > w * 0.92) { cardW = w * 0.92; cardH = cardW * 0.82; }
    var cardX = (w - cardW) / 2;
    var cardY = regionTop + (regionH - cardH) / 2;
    var ccx = cardX + cardW / 2, ccy = cardY + cardH / 2;
    var r = Math.min(cardW, cardH) * 0.04;

    var tl = resolveTimeline(progress);
    var inT = eOut(clamp(progress / 0.06, 0, 1));
    var activeMonth = tl.activeMonth, activeDay = tl.activeDay, sy = tl.sy;
    var zoomTeff = tl.zoomTeff, markerT = tl.markerT, flipSpeed = tl.flipSpeed;
    var lift = 1 - sy;
    var em = cardW * 0.045;

    /* drop shadow under the pad */
    ctx.save();
    ctx.globalAlpha = 0.4 * inT;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(ccx, cardY + cardH + h * 0.03, cardW * 0.42, h * 0.014, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = inT;

    /* the pad backing (card frame) — visible as the page lifts */
    drawCardSurface(ctx, cardX, cardY, cardW, cardH, r);

    /* depth shadows on the backing: binding + cast shadow of the lifted page */
    ctx.save();
    roundRect(ctx, cardX, cardY, cardW, cardH, r);
    ctx.clip();
    var bgrad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH * 0.14);
    bgrad.addColorStop(0, 'rgba(0,0,0,' + (0.22 + 0.18 * lift) + ')');
    bgrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bgrad;
    ctx.fillRect(cardX, cardY, cardW, cardH * 0.14);
    if (lift > 0.05) {
      var cs = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
      cs.addColorStop(0, 'rgba(0,0,0,' + (lift * 0.16) + ')');
      cs.addColorStop(0.5, 'rgba(0,0,0,' + (lift * 0.04) + ')');
      cs.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cs;
      ctx.fillRect(cardX, cardY, cardW, cardH);
    }
    ctx.restore();

    /* the single flipping page, hinged at the top edge, vertical foreshortening (up & back) */
    ctx.save();
    ctx.translate(ccx, cardY);
    ctx.scale(1, sy);
    ctx.translate(-ccx, -cardY);
    if (flipSpeed > 0.05) ctx.filter = 'blur(' + (flipSpeed * 2.4).toFixed(2) + 'px)';
    ctx.save();
    roundRect(ctx, cardX, cardY, cardW, cardH, r);
    ctx.clip();
    drawFlipContent(ctx, cardX, cardY, cardW, cardH, em, activeMonth, activeDay, markerT, zoomTeff);
    if (lift > 0.02) {
      var sg = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
      sg.addColorStop(0, 'rgba(0,0,0,0)');
      sg.addColorStop(0.6, 'rgba(0,0,0,' + (lift * 0.14) + ')');
      sg.addColorStop(1, 'rgba(0,0,0,' + (lift * 0.45) + ')');
      ctx.fillStyle = sg;
      ctx.fillRect(cardX, cardY, cardW, cardH);
    }
    ctx.restore();
    ctx.filter = 'none';
    ctx.restore();

    ctx.restore();
  }

  /* draws only the face content (caller handles surface + clip) */
  function drawFlipContent(ctx, x, y, cw, ch, em, monthIndex, day, markerScale, zoomT) {
    drawCompactMonth(ctx, x, y, cw, ch, em, monthIndex, day, markerScale, zoomT);
  }

  function drawCompactMonth(ctx, x, y, cw, ch, em, monthIndex, day, markerScale, zoomT) {
    var cols = 7, rows = 6;
    var cells = buildMonthGrid(st.year, monthIndex, st.startWeekOnMonday);
    var dim = daysInMonth(st.year, monthIndex);
    var isOverview = day <= 0;
    var zoomTeff = isOverview ? 0 : zoomT;
    var focusDay = isOverview ? 1 : clamp(day, 1, dim);
    var focusIdx = -1;
    if (!isOverview) { for (var fi = 0; fi < cells.length; fi++) { if (cells[fi].inMonth && cells[fi].day === focusDay) { focusIdx = fi; break; } } }
    var frow = focusIdx >= 0 ? Math.floor(focusIdx / cols) : 0, fcol = focusIdx >= 0 ? focusIdx % cols : 0;
    var pad = cw * 0.08;
    var headerH = ch * 0.18;
    var gridLeft = x + pad, gridRight = x + cw - pad;
    var gridTop = y + headerH + em * 0.6;
    var gridBottom = y + ch - pad * 0.5;
    var cellW = (gridRight - gridLeft) / cols;
    var cellH = (gridBottom - gridTop) / rows;
    var nfont = Math.min(cellW, cellH) * 0.42;
    var fcx = gridLeft + fcol * cellW + cellW / 2;
    var fcy = gridTop + frow * cellH + cellH / 2;
    var ccx = x + cw / 2, ccy = y + ch / 2;
    var headFade = 1 - zoomTeff * 0.9;

    /* header (fades as we zoom into the day) */
    ctx.fillStyle = st.textColor;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = headFade;
    ctx.font = fontStr('800', em * 1.9);
    ctx.fillText(st.monthNames[monthIndex], gridLeft, y + headerH * 0.7);
    if (st.showYear) {
      ctx.fillStyle = st.weekendColor;
      ctx.font = fontStr('600', em * 1.0);
      drawSpaced(ctx, String(st.year), gridRight, y + headerH * 0.7, em * 0.3, 'right');
    }
    ctx.globalAlpha = 1;

    /* zoom into the focus day within the card */
    var z = 1 + (st.zoomAmount - 1) * 0.7 * eOut(zoomTeff);
    ctx.save();
    if (!isOverview) {
      ctx.translate(ccx, ccy);
      ctx.scale(z, z);
      ctx.translate(-fcx, -fcy);
    }

    if (st.showWeekdays) {
      ctx.globalAlpha = headFade;
      ctx.fillStyle = st.weekendColor;
      ctx.font = fontStr('600', nfont * 0.66);
      for (var wd = 0; wd < cols; wd++) {
        drawSpaced(ctx, st.dayShort[wd].toUpperCase(), gridLeft + wd * cellW + cellW / 2, gridTop - cellH * 0.32, nfont * 0.22, 'center');
      }
      ctx.globalAlpha = 1;
    }

    for (var ci = 0; ci < cells.length; ci++) {
      var cell = cells[ci];
      var row = Math.floor(ci / cols), col = ci % cols;
      var cx = gridLeft + col * cellW + cellW / 2;
      var cy = gridTop + row * cellH + cellH / 2;
      var weekend = st.startWeekOnMonday ? (col >= 5) : (col === 0 || col === 6);
      var isFocus = (ci === focusIdx);
      var nonFocusFade = isFocus ? 1 : (1 - zoomTeff * 0.82);
      var alpha = (cell.inMonth ? 1 : 0.3) * nonFocusFade;
      if (alpha <= 0.002) continue;
      ctx.globalAlpha = alpha;
      if (isFocus && markerScale > 0) {
        var ms = Math.min(cellW, cellH) * 0.74 * markerScale;
        ctx.fillStyle = st.highlightColor;
        roundRect(ctx, cx - ms / 2, cy - ms / 2, ms, ms, ms * 0.28);
        ctx.fill();
      }
      ctx.fillStyle = isFocus ? st.bgColor : (weekend ? st.weekendColor : st.textColor);
      ctx.font = fontStr(isFocus ? '700' : '600', nfont);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(cell.day), cx, cy);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawCalendar(ctx, w, h, progress) {
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
    drawBg(ctx, w, h);
    if (st.calendarType === 'flip') drawFlip(ctx, w, h, progress);
    else drawMonth(ctx, w, h, progress);
    var endZoomFrac = Math.min(0.4, 1.5 / Math.max(0.1, st.animDuration));
    var detailT = phaseT(progress, 1 - endZoomFrac, 1.0);
    if (detailT > 0 && st.focusDay > 0) drawDetailPanel(ctx, w, h, detailT);
  }

  /* ─── PREVIEW / PLAY ─── */
  function renderPreview() {
    var canvas = st.canvas;
    if (!canvas) return;
    var area = $('[data-tool="calendar"] .preview-area');
    if (!area) return;
    var res = getResolution();
    var rw = res[0], rh = res[1];
    var aw = area.clientWidth, ah = area.clientHeight;
    var scale = Math.min(aw / rw, ah / rh, 1);
    var pw = Math.round(rw * scale), ph = Math.round(rh * scale);
    var wrapper = $('#calendarPreviewWrapper');
    if (wrapper) { wrapper.style.width = pw + 'px'; wrapper.style.height = ph + 'px'; }
    canvas.width = rw; canvas.height = rh;
    canvas.style.width = pw + 'px'; canvas.style.height = ph + 'px';
    var ctx = st.ctx || canvas.getContext('2d');
    st.ctx = ctx;
    drawCalendar(ctx, rw, rh, PREVIEW_PROGRESS);
    var info = $('#calendarResolutionInfo');
    if (info) info.textContent = rw + ' \u00d7 ' + rh;
  }

  function startAnimation() {
    if (st.animating) stopAnimation();
    var res = getResolution();
    var rw = res[0], rh = res[1];
    if (st.canvas.width !== rw || st.canvas.height !== rh) { st.canvas.width = rw; st.canvas.height = rh; }
    st.ctx = st.canvas.getContext('2d');
    var area = $('[data-tool="calendar"] .preview-area');
    if (area && area.clientWidth > 0 && area.clientHeight > 0) {
      var scale = Math.min(area.clientWidth / rw, area.clientHeight / rh, 1);
      st.canvas.style.width = Math.round(rw * scale) + 'px';
      st.canvas.style.height = Math.round(rh * scale) + 'px';
      var wrapper = $('#calendarPreviewWrapper');
      if (wrapper) { wrapper.style.width = Math.round(rw * scale) + 'px'; wrapper.style.height = Math.round(rh * scale) + 'px'; }
    }
    st.animating = true;
    var start = performance.now();
    var dur = st.animDuration * 1000;
    function frame(now) {
      if (!st.animating) return;
      var t = Math.min((now - start) / dur, 1);
      try { drawCalendar(st.ctx, rw, rh, t); }
      catch (e) { console.error('calendar frame error:', e); st.animating = false; return; }
      if (t < 1) st.animRaf = requestAnimationFrame(frame);
      else { st.animating = false; var btn = $('#calendarPlayBtn'); if (btn) btn.querySelector('span').textContent = t('calendarPlay'); }
    }
    st.animRaf = requestAnimationFrame(frame);
    var btn = $('#calendarPlayBtn'); if (btn) btn.querySelector('span').textContent = t('calendarStop');
  }

  function stopAnimation() {
    if (st.animRaf) cancelAnimationFrame(st.animRaf);
    st.animating = false; st.animRaf = null;
    renderPreview();
    var btn = $('#calendarPlayBtn'); if (btn) btn.querySelector('span').textContent = t('calendarPlay');
  }

  /* ─── EXPORT ─── */
  function getExportState() {
    return {
      calendarType: st.calendarType, palette: st.palette,
      year: st.year, month: st.month, focusDay: st.focusDay, startMonth: st.startMonth, startDay: st.startDay, transitionEnabled: st.transitionEnabled, transitionDuration: st.transitionDuration, startWeekOnMonday: st.startWeekOnMonday,
      lang: st.lang,
      events: st.events.map(function (e) { return { day: e.day, text: e.text, color: e.color }; }),
      monthNames: st.monthNames, dayFull: st.dayFull, dayShort: st.dayShort,
      bgColor: st.bgColor, bgTop: st.bgTop, textColor: st.textColor, weekendColor: st.weekendColor, highlightColor: st.highlightColor,
      fontSize: st.fontSize, zoomAmount: st.zoomAmount, animDuration: st.animDuration, easing: st.easing,
      showWeekdays: st.showWeekdays, showYear: st.showYear, format: st.format
    };
  }

  function easingSource() {
    var parts = [];
    Object.keys(EASING_FNS).forEach(function (k) { parts.push(JSON.stringify(k) + ':' + EASING_FNS[k].toString()); });
    return '{' + parts.join(',') + '}';
  }

  function buildOffscreenHtml(opts) {
    var fns = [clamp, phaseT, ease, eOut, hexToRgb, rgba, fontStr, roundRect, wrapText, drawSpaced, buildMonthGrid, daysInMonth, eventsForDay, drawBg, drawCardSurface, detailPanelH, resolveTimeline, drawMonthInner, drawMonth, drawDetailPanel, drawFlipContent, drawCompactMonth, drawFlip, drawCalendar];
    var fnSrc = fns.map(function (f) { return f.toString(); }).join('\n');
    return '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#000}</style>' +
      '</head><body>' +
      '<canvas id="c" width="' + opts.width + '" height="' + opts.height + '" style="width:100%;height:100%"></canvas>' +
      '<script>' +
      'var st=' + JSON.stringify(opts.state) + ';' +
      'var EASING_FNS=' + easingSource() + ';' +
      'var _fc=new Map();' +
      fnSrc +
      'var _c=document.getElementById("c");var _ctx=_c.getContext("2d");' +
      'window._updateFrame=function(p){drawCalendar(_ctx,' + opts.width + ',' + opts.height + ',p);};' +
      '<\/script>' +
      '</body></html>';
  }

  async function exportMp4() {
    if (st.animating) return;
    var savePath = await ipcRenderer.invoke('save-dialog', {
      defaultName: 'calendar-' + Date.now() + '.mp4',
      filters: [{ name: 'MP4', extensions: ['mp4'] }]
    });
    if (!savePath) return;
    var res = getResolution();
    var w = res[0], h = res[1];
    var fps = 30;
    var framePlan = AnimationCore.buildFramePlan({ durationSeconds: st.animDuration, holdSeconds: 1.5 }, fps);
    var totalFrames = framePlan.animationFrames;
    var setExporting = makeSetExporting('calendar');
    setExporting(true, t('calendarInitializing'), 0);
    var html = buildOffscreenHtml({ width: w, height: h, state: getExportState() });
    await ipcRenderer.invoke('bg-load-html', { html: html, width: w, height: h });
    await ipcRenderer.invoke('export-mp4-stream-init', { savePath: savePath, fps: fps });
    setExporting(true, t('calendarRenderingFrames'), 5);
    var streamActive = true;
    try {
      var written = 0, batchSize = 10, progressValues = [];
      for (var i = 0; i < framePlan.frames.length; i++) {
        progressValues.push(framePlan.frames[i].progress);
        if (progressValues.length >= batchSize || i === framePlan.frames.length - 1) {
          var batchData = await ipcRenderer.invoke('bg-chart-capture-batch', { progressValues: progressValues });
          var encoded = [];
          for (var b = 0; b < batchData.length; b++) encoded.push({ data: batchData[b], duration: framePlan.frames[written + b].duration });
          await ipcRenderer.invoke('export-mp4-stream-write', { frames: encoded });
          written += batchData.length; progressValues = [];
          var pct = 5 + Math.round(((i + 1) / totalFrames) * 80);
          setExporting(true, t('calendarRenderingFrame') + ' ' + (i + 1) + '/' + totalFrames, pct);
        }
      }
      setExporting(true, t('calendarEncodingMp4'), 90);
      await ipcRenderer.invoke('export-mp4-stream-finish');
      streamActive = false;
    } finally {
      if (streamActive) await ipcRenderer.invoke('export-mp4-stream-abort');
      await ipcRenderer.invoke('bg-cleanup');
      setExporting(false);
    }
  }

  /* ─── EVENTS UI ─── */
  function renderEventList() {
    var list = $('#calendarEventList');
    if (!list) return;
    list.innerHTML = '';
    st.events.forEach(function (ev, i) {
      var row = document.createElement('div');
      row.className = 'cal-event-row';
      var dayInp = document.createElement('input');
      dayInp.type = 'number'; dayInp.className = 'control-input cal-event-day';
      dayInp.min = '1'; dayInp.max = '31'; dayInp.value = ev.day;
      (function (idx, inp) { inp.addEventListener('input', function () { var v = parseInt(inp.value, 10); st.events[idx].day = isNaN(v) ? 1 : clamp(v, 1, 31); renderPreview(); }); })(i, dayInp);
      var colorInp = document.createElement('input');
      colorInp.type = 'color'; colorInp.className = 'control-color cal-event-color'; colorInp.value = ev.color;
      (function (idx, inp) { inp.addEventListener('input', function () { st.events[idx].color = inp.value; renderPreview(); }); })(i, colorInp);
      var textInp = document.createElement('input');
      textInp.type = 'text'; textInp.className = 'control-input cal-event-text'; textInp.value = ev.text; textInp.placeholder = t('calendarEventText');
      (function (idx, inp) { inp.addEventListener('input', function () { st.events[idx].text = inp.value; renderPreview(); }); })(i, textInp);
      var del = document.createElement('button');
      del.className = 'cal-event-del'; del.innerHTML = '&times;'; del.title = t('delete');
      (function (idx) { del.addEventListener('click', function () { st.events.splice(idx, 1); renderEventList(); renderPreview(); }); })(i);
      row.appendChild(dayInp); row.appendChild(colorInp); row.appendChild(textInp); row.appendChild(del);
      list.appendChild(row);
    });
  }

  function populateMonthSelect() {
    var fill = function (id, val) {
      var el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = '';
      for (var m = 0; m < 12; m++) {
        var opt = document.createElement('option');
        opt.value = m; opt.textContent = st.monthNames[m];
        if (m === val) opt.selected = true;
        el.appendChild(opt);
      }
    };
    fill('calendarMonthSelect', st.month);
    fill('calendarStartMonth', st.startMonth);
  }

  /* ─── CONTROLS ─── */
  var controlsBound = false;
  function bindControls() {
    if (controlsBound) return;
    controlsBound = true;

    $$('#calendarTypeGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#calendarTypeGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.calendarType = btn.dataset.type;
        updateTypeVisibility();
        renderPreview();
      });
    });

    $$('#calendarPaletteGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#calendarPaletteGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        applyPalette(btn.dataset.palette);
        renderEventList();
        renderPreview();
      });
    });

    listen('#calendarMonthSelect', 'change', function (e) { st.month = parseInt(e.target.value, 10); normalizeFocus(); syncFocusMax(); renderPreview(); });
    listen('#calendarYearInput', 'input', function (e) { var v = parseInt(e.target.value, 10); st.year = isNaN(v) ? new Date().getFullYear() : v; normalizeFocus(); renderPreview(); });
    listen('#calendarYearPrev', 'click', function () { st.year--; var yi = $('#calendarYearInput'); if (yi) yi.value = st.year; normalizeFocus(); renderPreview(); });
    listen('#calendarYearNext', 'click', function () { st.year++; var yi = $('#calendarYearInput'); if (yi) yi.value = st.year; normalizeFocus(); renderPreview(); });
    listen('#calendarFocusDay', 'input', function (e) { var v = parseInt(e.target.value, 10); st.focusDay = isNaN(v) ? 0 : clamp(v, 0, daysInMonth(st.year, st.month)); syncFocusMax(); renderPreview(); });
    listen('#calendarStartMonth', 'change', function (e) { st.startMonth = parseInt(e.target.value, 10); renderPreview(); });
    listen('#calendarStartDay', 'input', function (e) { var v = parseInt(e.target.value, 10); st.startDay = isNaN(v) ? 0 : clamp(v, 0, 31); renderPreview(); });
    listen('#calendarTransitionToggle', 'change', function (e) {
      st.transitionEnabled = e.target.checked;
      var f = $('#calendarTransitionFields'); if (f) f.classList.toggle('disabled', !st.transitionEnabled);
      renderPreview();
    });
    listen('#calendarTransitionDur', 'input', function (e) { st.transitionDuration = parseFloat(e.target.value); var el = $('#calendarTransitionDurVal'); if (el) el.textContent = st.transitionDuration.toFixed(1) + 's'; renderPreview(); });
    listen('#calendarMondayToggle', 'change', function (e) { st.startWeekOnMonday = e.target.checked; renderPreview(); });
    listen('#calendarWeekdaysToggle', 'change', function (e) { st.showWeekdays = e.target.checked; renderPreview(); });
    listen('#calendarYearDisplayToggle', 'change', function (e) { st.showYear = e.target.checked; renderPreview(); });
    listen('#calendarAddEventBtn', 'click', function () { st.events.push({ day: st.focusDay, text: t('calendarNewEvent'), color: st.highlightColor }); renderEventList(); renderPreview(); });

    listen('#calendarBgColor', 'input', function (e) { st.bgColor = e.target.value; renderPreview(); });
    listen('#calendarTextColor', 'input', function (e) { st.textColor = e.target.value; renderPreview(); });
    listen('#calendarHighlightColor', 'input', function (e) { st.highlightColor = e.target.value; renderPreview(); });
    listen('#calendarMutedColor', 'input', function (e) { st.weekendColor = e.target.value; renderPreview(); });

    listen('#calendarFontSize', 'input', function (e) { st.fontSize = parseInt(e.target.value, 10); var el = $('#calendarFontSizeVal'); if (el) el.textContent = st.fontSize + 'px'; renderPreview(); });
    listen('#calendarZoom', 'input', function (e) { st.zoomAmount = parseFloat(e.target.value); var el = $('#calendarZoomVal'); if (el) el.textContent = st.zoomAmount.toFixed(1) + '\u00d7'; renderPreview(); });
    listen('#calendarAnimDuration', 'input', function (e) { st.animDuration = parseFloat(e.target.value); var el = $('#calendarAnimDurationVal'); if (el) el.textContent = st.animDuration + 's'; });
    listen('#calendarEasingSelect', 'change', function (e) { st.easing = e.target.value; renderPreview(); });

    $$('#calendarFormatGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#calendarFormatGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active'); st.format = btn.dataset.format; renderPreview();
      });
    });
    listen('#calendarResolutionSelect', 'change', function (e) { st.resolution = e.target.value; renderPreview(); });
    listen('#calendarPlayBtn', 'click', function () { if (st.animating) stopAnimation(); else startAnimation(); });
    listen('#calendarStopBtn', 'click', function () { stopAnimation(); });
    listen('#calendarExportBtn', 'click', function () { exportMp4(); });

    window.addEventListener('lang-changed', function () { st.lang = currentLang(); refreshNames(); populateMonthSelect(); renderEventList(); renderPreview(); });

    var ctg = $('#calendarTransitionToggle'); if (ctg) ctg.checked = st.transitionEnabled;
    var ctf = $('#calendarTransitionFields'); if (ctf) ctf.classList.toggle('disabled', !st.transitionEnabled);
    var ctdv = $('#calendarTransitionDurVal'); if (ctdv) ctdv.textContent = st.transitionDuration.toFixed(1) + 's';
  }

  function normalizeFocus() { var dim = daysInMonth(st.year, st.month); st.focusDay = st.focusDay <= 0 ? 0 : clamp(st.focusDay, 1, dim); }

  function syncFocusMax() {
    var inp = $('#calendarFocusDay'); if (inp) inp.max = daysInMonth(st.year, st.month);
    var disp = $('#calendarFocusDayVal'); if (disp) disp.textContent = st.focusDay <= 0 ? (st.lang === 'pl' ? 'Cały' : 'All') : st.focusDay;
  }

  function updateTypeVisibility() {
    var monthOnly = $('[data-cal-options="zoom"]');
    if (monthOnly) monthOnly.style.display = st.calendarType === 'month' ? '' : 'none';
  }

  window.initCalendarTool = function () {
    st.canvas = document.getElementById('calendarCanvas');
    if (!st.canvas) return;
    st.ctx = st.canvas.getContext('2d');
    st.lang = currentLang();
    refreshNames();
    bindControls();
    populateMonthSelect();
    renderEventList();
    updateTypeVisibility();
    syncFocusMax();
  };

  window.calendarActivate = function () {
    try {
      if (!st.canvas) { st.canvas = document.getElementById('calendarCanvas'); if (st.canvas) st.ctx = st.canvas.getContext('2d'); }
      st.lang = currentLang(); refreshNames();
      bindControls(); populateMonthSelect(); renderEventList(); updateTypeVisibility(); syncFocusMax();
      renderPreview();
    } catch (e) { console.error('[calendar] activate:', e); }
    setTimeout(renderPreview, 150);
  };

  window.calendarUpdatePreviewSize = function () { renderPreview(); };
})();
