(function () {
  'use strict';

  var { ipcRenderer } = require('electron');

  var CHART_RES = {
    '16:9': { '720p': [1280, 720], '1080p': [1920, 1080], '4K': [3840, 2160] },
    '9:16': { '720p': [720, 1280], '1080p': [1080, 1920], '4K': [2160, 3840] },
    '1:1': { '720p': [720, 720], '1080p': [1080, 1080], '4K': [2160, 2160] }
  };

  var PALETTES = {
    vivid: ['#6366f1', '#f43f5e', '#22c55e', '#f59e0b', '#06b6d4', '#a855f7', '#ec4899', '#14b8a6'],
    warm: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4'],
    cool: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#06b6d4'],
    pastel: ['#93c5fd', '#c4b5fd', '#f9a8d4', '#fbbf24', '#86efac', '#67e8f9', '#fca5a5', '#d8b4fe'],
    mono: ['#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a']
  };

  var EASING_FNS = {
    linear: function (t) { return t; },
    easeInOut: function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    easeOut: function (t) { return 1 - Math.pow(1 - t, 3); },
    easeIn: function (t) { return t * t * t; },
    bounce: function (t) {
      var n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
      if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
      return n * (t -= 2.625 / d) * t + 0.984375;
    },
    spring: function (t) {
      return 1 - Math.cos(t * 4.5 * Math.PI) * Math.exp(-t * 6);
    }
  };

  var st = {
    chartType: 'bar',
    data: [
      { label: 'Warszawa', value: 1790 },
      { label: 'Kraków', value: 1420 },
      { label: 'Wrocław', value: 1280 },
      { label: 'Gdańsk', value: 980 },
      { label: 'Poznań', value: 860 }
    ],
    counterFrom: 0,
    counterTo: 1000000,
    counterPrefix: '',
    counterSuffix: '',
    counterDecimals: 0,
    gaugeValue: 72,
    gaugeLabel: 'Performance',
    title: '',
    subtitle: '',
    palette: 'vivid',
    customColors: ['#6366f1', '#f43f5e', '#22c55e', '#f59e0b', '#06b6d4', '#a855f7', '#ec4899', '#14b8a6'],
    useCustomColors: false,
    bgColor: '#1a1a2e',
    textColor: '#e4e4e7',
    gridColor: 'rgba(255,255,255,0.08)',
    barRadius: 6,
    lineWidth: 3,
    lineSmooth: true,
    donutHole: 0.6,
    showLabels: true,
    showValues: true,
    showGrid: true,
    showLegend: true,
    fontSize: 16,
    animDuration: 3,
    stagger: 0.08,
    easing: 'easeOut',
    format: '16:9',
    resolution: '1080p',
    animating: false,
    animRaf: null,
    canvas: null,
    ctx: null
  };

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return document.querySelectorAll(s); };

  function getResolution() {
    return CHART_RES[st.format][st.resolution];
  }

  function getColor(idx) {
    if (st.useCustomColors) return st.customColors[idx % st.customColors.length];
    return PALETTES[st.palette][idx % PALETTES[st.palette].length];
  }

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return { r: r, g: g, b: b };
  }

  function ease(t) {
    var fn = EASING_FNS[st.easing] || EASING_FNS.easeOut;
    return fn(Math.max(0, Math.min(1, t)));
  }

  function staggerProgress(globalT, idx, total) {
    var staggerTotal = st.stagger * total;
    var dur = 1 - staggerTotal;
    if (dur <= 0) dur = 0.01;
    var start = st.stagger * idx;
    var localT = (globalT - start) / dur;
    return ease(Math.max(0, Math.min(1, localT)));
  }

  function formatNumber(val, prefix, suffix, decimals) {
    prefix = prefix || '';
    suffix = suffix || '';
    decimals = decimals || 0;
    var str = Math.abs(val).toFixed(decimals);
    var parts = str.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (val < 0 ? '-' : '') + prefix + parts.join('.') + suffix;
  }

  function drawBar(ctx, w, h, progress) {
    var data = st.data;
    if (!data.length) return;

    var pad = { top: st.title ? h * 0.12 : h * 0.06, bottom: h * 0.12, left: w * 0.1, right: w * 0.06 };
    var chartW = w - pad.left - pad.right;
    var chartH = h - pad.top - pad.bottom;

    var maxVal = Math.max.apply(null, data.map(function (d) { return d.value; }));
    if (maxVal <= 0) maxVal = 1;

    var barCount = data.length;
    var gap = Math.max(chartW * 0.02, 4);
    var barW = (chartW - gap * (barCount + 1)) / barCount;
    if (barW < 2) barW = 2;

    ctx.save();
    ctx.fillStyle = st.textColor;
    ctx.font = '600 ' + Math.max(st.fontSize * 0.8, 10) + 'px "Manrope", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    if (st.showGrid) {
      var gridLines = 5;
      for (var g = 0; g <= gridLines; g++) {
        var gy = pad.top + chartH - (g / gridLines) * chartH;
        ctx.strokeStyle = st.gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad.left, gy);
        ctx.lineTo(pad.left + chartW, gy);
        ctx.stroke();

        var gv = Math.round((g / gridLines) * maxVal);
        ctx.fillStyle = st.textColor;
        ctx.globalAlpha = 0.4;
        ctx.fillText(formatNumber(gv), pad.left - 8, gy);
        ctx.globalAlpha = 1;
      }
    }

    data.forEach(function (d, i) {
      var p = staggerProgress(progress, i, barCount);
      var barH = (d.value / maxVal) * chartH * p;
      var x = pad.left + gap + i * (barW + gap);
      var y = pad.top + chartH - barH;
      var r = Math.min(st.barRadius, barW / 2, barH / 2);
      if (r < 0) r = 0;

      var color = getColor(i);
      var rgb = hexToRgb(color);

      var grad = ctx.createLinearGradient(x, y, x, pad.top + chartH);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.4)');
      ctx.fillStyle = grad;

      ctx.beginPath();
      if (r > 0 && barH > 0) {
        ctx.moveTo(x, pad.top + chartH);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.lineTo(x + barW - r, y);
        ctx.arcTo(x + barW, y, x + barW, y + r, r);
        ctx.lineTo(x + barW, pad.top + chartH);
      } else {
        ctx.rect(x, y, barW, barH);
      }
      ctx.closePath();
      ctx.fill();

      if (st.showValues && p > 0.1) {
        ctx.fillStyle = st.textColor;
        ctx.globalAlpha = Math.min(1, p * 2);
        ctx.font = '700 ' + Math.max(st.fontSize * 0.75, 9) + 'px "Manrope", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(formatNumber(d.value), x + barW / 2, y - 6);
        ctx.globalAlpha = 1;
      }

      if (st.showLabels) {
        ctx.fillStyle = st.textColor;
        ctx.globalAlpha = 0.6;
        ctx.font = '500 ' + Math.max(st.fontSize * 0.7, 9) + 'px "Manrope", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(d.label, x + barW / 2, pad.top + chartH + 8);
        ctx.globalAlpha = 1;
      }
    });

    ctx.restore();
  }

  function drawLine(ctx, w, h, progress) {
    var data = st.data;
    if (!data.length) return;

    var pad = { top: st.title ? h * 0.12 : h * 0.06, bottom: h * 0.12, left: w * 0.1, right: w * 0.06 };
    var chartW = w - pad.left - pad.right;
    var chartH = h - pad.top - pad.bottom;
    var maxVal = Math.max.apply(null, data.map(function (d) { return d.value; }));
    if (maxVal <= 0) maxVal = 1;

    if (st.showGrid) {
      var gridLines = 5;
      for (var g = 0; g <= gridLines; g++) {
        var gy = pad.top + chartH - (g / gridLines) * chartH;
        ctx.strokeStyle = st.gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad.left, gy);
        ctx.lineTo(pad.left + chartW, gy);
        ctx.stroke();

        var gv = Math.round((g / gridLines) * maxVal);
        ctx.fillStyle = st.textColor;
        ctx.globalAlpha = 0.4;
        ctx.font = '500 ' + Math.max(st.fontSize * 0.7, 9) + 'px "Manrope", system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatNumber(gv), pad.left - 8, gy);
        ctx.globalAlpha = 1;
      }
    }

    var points = data.map(function (d, i) {
      var x = pad.left + (i / (data.length - 1 || 1)) * chartW;
      var y = pad.top + chartH - (d.value / maxVal) * chartH;
      return { x: x, y: y, d: d, i: i };
    });

    var totalPts = points.length;
    var drawCount = Math.max(1, Math.ceil(progress * totalPts));

    if (drawCount < 2) return;

    var pts = points.slice(0, drawCount);
    var lastPt = pts[pts.length - 1];
    var lastP = staggerProgress(progress, drawCount - 1, totalPts);
    if (drawCount > 1 && lastP < 1) {
      var prevPt = pts[pts.length - 2];
      lastPt = {
        x: prevPt.x + (lastPt.x - prevPt.x) * lastP,
        y: prevPt.y + (lastPt.y - prevPt.y) * lastP,
        d: lastPt.d, i: lastPt.i
      };
      pts[pts.length - 1] = lastPt;
    }

    var color = getColor(0);
    var rgb = hexToRgb(color);

    var fillGrad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    fillGrad.addColorStop(0, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.25)');
    fillGrad.addColorStop(1, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.02)');

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pad.top + chartH);
    ctx.lineTo(pts[0].x, pts[0].y);

    for (var i = 1; i < pts.length; i++) {
      if (st.lineSmooth && i < pts.length) {
        var cp1x = (pts[i - 1].x + pts[i].x) / 2;
        var cp1y = pts[i - 1].y;
        var cp2x = (pts[i - 1].x + pts[i].x) / 2;
        var cp2y = pts[i].y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pts[i].x, pts[i].y);
      } else {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
    }

    ctx.lineTo(pts[pts.length - 1].x, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var j = 1; j < pts.length; j++) {
      if (st.lineSmooth) {
        var cx1 = (pts[j - 1].x + pts[j].x) / 2;
        var cy1 = pts[j - 1].y;
        var cx2 = (pts[j - 1].x + pts[j].x) / 2;
        var cy2 = pts[j].y;
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, pts[j].x, pts[j].y);
      } else {
        ctx.lineTo(pts[j].x, pts[j].y);
      }
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = st.lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    points.forEach(function (pt, idx) {
      if (idx >= drawCount) return;
      var pp = idx < drawCount - 1 ? 1 : lastP;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(4, st.lineWidth * 1.5), 0, Math.PI * 2);
      ctx.fillStyle = st.bgColor;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = st.lineWidth;
      ctx.stroke();

      if (st.showValues && pp > 0.3) {
        ctx.fillStyle = st.textColor;
        ctx.globalAlpha = Math.min(1, pp * 2);
        ctx.font = '700 ' + Math.max(st.fontSize * 0.7, 9) + 'px "Manrope", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(formatNumber(pt.d.value), pt.x, pt.y - 10);
        ctx.globalAlpha = 1;
      }

      if (st.showLabels) {
        ctx.fillStyle = st.textColor;
        ctx.globalAlpha = 0.6;
        ctx.font = '500 ' + Math.max(st.fontSize * 0.7, 9) + 'px "Manrope", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(pt.d.label, pt.x, pad.top + chartH + 8);
        ctx.globalAlpha = 1;
      }
    });
  }

  function drawPie(ctx, w, h, progress) {
    var data = st.data;
    if (!data.length) return;

    var cx = w * (st.showLegend && data.length > 2 ? 0.38 : 0.5);
    var cy = h * (st.title ? 0.54 : 0.5);
    var radius = Math.min(w, h) * 0.32;
    var innerRadius = radius * st.donutHole;

    var total = data.reduce(function (s, d) { return s + d.value; }, 0);
    if (total <= 0) total = 1;

    var startAngle = -Math.PI / 2;

    data.forEach(function (d, i) {
      var p = staggerProgress(progress, i, data.length);
      var sliceAngle = (d.value / total) * Math.PI * 2 * p;
      var color = getColor(i);

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(startAngle) * innerRadius, cy + Math.sin(startAngle) * innerRadius);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      var endX = cx + Math.cos(startAngle + sliceAngle) * innerRadius;
      var endY = cy + Math.sin(startAngle + sliceAngle) * innerRadius;
      ctx.lineTo(endX, endY);
      ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      if (st.showValues && p > 0.3 && sliceAngle > 0.15) {
        var midAngle = startAngle + sliceAngle / 2;
        var labelR = (radius + innerRadius) / 2;
        var lx = cx + Math.cos(midAngle) * labelR;
        var ly = cy + Math.sin(midAngle) * labelR;
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = Math.min(1, p * 2);
        ctx.font = '700 ' + Math.max(st.fontSize * 0.75, 9) + 'px "Manrope", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var pct = Math.round((d.value / total) * 100);
        ctx.fillText(pct + '%', lx, ly);
        ctx.globalAlpha = 1;
      }

      startAngle += sliceAngle;
    });

    if (innerRadius > 10) {
      ctx.fillStyle = st.textColor;
      ctx.globalAlpha = 0.3;
      ctx.font = '500 ' + Math.max(st.fontSize * 0.6, 8) + 'px "Manrope", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TOTAL', cx, cy - st.fontSize * 0.5);
      ctx.globalAlpha = 1;
      ctx.fillStyle = st.textColor;
      ctx.font = '800 ' + Math.max(st.fontSize * 1.2, 12) + 'px "Manrope", system-ui, sans-serif';
      ctx.fillText(formatNumber(total), cx, cy + st.fontSize * 0.5);
    }

    if (st.showLegend && data.length > 2) {
      var legendX = w * 0.62;
      var legendY = h * 0.25;
      data.forEach(function (d, i) {
        var lp = staggerProgress(progress, i, data.length);
        ctx.globalAlpha = Math.min(1, lp * 2);

        ctx.fillStyle = getColor(i);
        ctx.beginPath();
        ctx.arc(legendX, legendY + i * st.fontSize * 2, Math.max(st.fontSize * 0.4, 4), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = st.textColor;
        ctx.font = '600 ' + Math.max(st.fontSize * 0.8, 10) + 'px "Manrope", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.label, legendX + st.fontSize, legendY + i * st.fontSize * 2);

        ctx.globalAlpha = 0.4;
        ctx.font = '400 ' + Math.max(st.fontSize * 0.7, 9) + 'px "Manrope", system-ui, sans-serif';
        ctx.fillText(formatNumber(d.value), legendX + st.fontSize, legendY + i * st.fontSize * 2 + st.fontSize * 0.9);

        ctx.globalAlpha = 1;
      });
    }
  }

  function drawCounter(ctx, w, h, progress) {
    var p = ease(progress);
    var val = st.counterFrom + (st.counterTo - st.counterFrom) * p;
    var str = formatNumber(val, st.counterPrefix, st.counterSuffix, st.counterDecimals);

    ctx.fillStyle = st.textColor;
    ctx.font = '800 ' + Math.min(w * 0.12, h * 0.2, 120) + 'px "Manrope", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, w / 2, h / 2);

    if (st.title) {
      ctx.fillStyle = st.textColor;
      ctx.globalAlpha = 0.5;
      ctx.font = '600 ' + Math.max(st.fontSize, 14) + 'px "Manrope", system-ui, sans-serif';
      ctx.fillText(st.title, w / 2, h * 0.35);
      ctx.globalAlpha = 1;
    }
  }

  function drawGauge(ctx, w, h, progress) {
    var p = ease(progress);
    var val = st.gaugeValue * p;
    var cx = w / 2;
    var cy = h * 0.55;
    var radius = Math.min(w, h) * 0.3;
    var lineWidth = Math.max(radius * 0.15, 8);

    var startAngle = Math.PI * 0.75;
    var endAngle = Math.PI * 2.25;
    var totalAngle = endAngle - startAngle;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = st.gridColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    var valAngle = startAngle + (val / 100) * totalAngle;
    var color = getColor(0);
    var rgb = hexToRgb(color);
    var grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.6)');

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, valAngle);
    ctx.strokeStyle = grad;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.fillStyle = st.textColor;
    ctx.font = '800 ' + Math.min(radius * 0.6, 80) + 'px "Manrope", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(val) + '%', cx, cy);

    if (st.gaugeLabel) {
      ctx.fillStyle = st.textColor;
      ctx.globalAlpha = 0.5;
      ctx.font = '600 ' + Math.max(st.fontSize, 14) + 'px "Manrope", system-ui, sans-serif';
      ctx.fillText(st.gaugeLabel, cx, cy + radius * 0.5);
      ctx.globalAlpha = 1;
    }

    var tickLabels = ['0', '25', '50', '75', '100'];
    tickLabels.forEach(function (lbl, i) {
      var a = startAngle + (i / 4) * totalAngle;
      var tr = radius + lineWidth + 10;
      var tx = cx + Math.cos(a) * tr;
      var ty = cy + Math.sin(a) * tr;
      ctx.fillStyle = st.textColor;
      ctx.globalAlpha = 0.3;
      ctx.font = '400 ' + Math.max(st.fontSize * 0.6, 8) + 'px "Manrope", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lbl, tx, ty);
      ctx.globalAlpha = 1;
    });
  }

  function drawChart(ctx, w, h, progress) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = st.bgColor;
    ctx.fillRect(0, 0, w, h);

    if (st.title && st.chartType !== 'counter') {
      ctx.fillStyle = st.textColor;
      ctx.font = '800 ' + Math.max(st.fontSize * 1.4, 16) + 'px "Manrope", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(st.title, w / 2, h * 0.03);
    }

    if (st.subtitle && st.chartType !== 'counter') {
      ctx.fillStyle = st.textColor;
      ctx.globalAlpha = 0.4;
      ctx.font = '500 ' + Math.max(st.fontSize * 0.8, 10) + 'px "Manrope", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(st.subtitle, w / 2, h * 0.03 + st.fontSize * 2);
      ctx.globalAlpha = 1;
    }

    switch (st.chartType) {
      case 'bar': drawBar(ctx, w, h, progress); break;
      case 'line': drawLine(ctx, w, h, progress); break;
      case 'pie': drawPie(ctx, w, h, progress); break;
      case 'counter': drawCounter(ctx, w, h, progress); break;
      case 'gauge': drawGauge(ctx, w, h, progress); break;
    }
  }

  function renderPreview() {
    var canvas = st.canvas;
    if (!canvas) return;
    var area = $('[data-tool="chart"] .preview-area');
    if (!area) return;

    var res = getResolution();
    var rw = res[0], rh = res[1];
    var aw = area.clientWidth;
    var ah = area.clientHeight;
    var scale = Math.min(aw / rw, ah / rh, 1);
    var pw = Math.round(rw * scale);
    var ph = Math.round(rh * scale);

    var wrapper = $('#chartPreviewWrapper');
    if (wrapper) {
      wrapper.style.width = pw + 'px';
      wrapper.style.height = ph + 'px';
    }

    canvas.width = rw;
    canvas.height = rh;
    canvas.style.width = pw + 'px';
    canvas.style.height = ph + 'px';

    var ctx = st.ctx || canvas.getContext('2d');
    st.ctx = ctx;
    drawChart(ctx, rw, rh, 1);

    var info = $('#chartResolutionInfo');
    if (info) info.textContent = rw + ' \u00d7 ' + rh;
  }

  function startAnimation() {
    if (st.animating) stopAnimation();
    st.animating = true;
    var start = performance.now();
    var dur = st.animDuration * 1000;

    function frame(now) {
      var elapsed = now - start;
      var t = Math.min(elapsed / dur, 1);
      var res = getResolution();
      drawChart(st.ctx, res[0], res[1], t);
      if (t < 1) {
        st.animRaf = requestAnimationFrame(frame);
      } else {
        st.animating = false;
        var btn = $('#chartPlayBtn');
        if (btn) btn.querySelector('span').textContent = 'Play';
      }
    }

    st.animRaf = requestAnimationFrame(frame);
    var btn = $('#chartPlayBtn');
    if (btn) btn.querySelector('span').textContent = 'Playing...';
  }

  function stopAnimation() {
    if (st.animRaf) cancelAnimationFrame(st.animRaf);
    st.animating = false;
    st.animRaf = null;
    renderPreview();
    var btn = $('#chartPlayBtn');
    if (btn) btn.querySelector('span').textContent = 'Play';
  }

  function buildOffscreenHtml(opts) {
    var dataJson = JSON.stringify(opts.data);
    var drawFnMap = {
      bar: 'drawBar',
      line: 'drawLine',
      pie: 'drawPie',
      counter: 'drawCounter',
      gauge: 'drawGauge'
    };

    return '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#000}</style>' +
      '</head><body>' +
      '<canvas id="c" width="' + opts.width + '" height="' + opts.height + '" style="width:100%;height:100%"></canvas>' +
      '<script>' +
      'var PALETTES=' + JSON.stringify(PALETTES) + ';' +
      'var st=' + JSON.stringify({
        chartType: opts.chartType,
        data: opts.data,
        counterFrom: opts.counterFrom,
        counterTo: opts.counterTo,
        counterPrefix: opts.counterPrefix,
        counterSuffix: opts.counterSuffix,
        counterDecimals: opts.counterDecimals,
        gaugeValue: opts.gaugeValue,
        gaugeLabel: opts.gaugeLabel,
        title: opts.title,
        subtitle: opts.subtitle,
        palette: opts.palette,
        customColors: opts.customColors,
        useCustomColors: opts.useCustomColors,
        bgColor: opts.bgColor,
        textColor: opts.textColor,
        gridColor: opts.gridColor,
        barRadius: opts.barRadius,
        lineWidth: opts.lineWidth,
        lineSmooth: opts.lineSmooth,
        donutHole: opts.donutHole,
        showLabels: opts.showLabels,
        showValues: opts.showValues,
        showGrid: opts.showGrid,
        showLegend: opts.showLegend,
        fontSize: opts.fontSize,
        stagger: opts.stagger,
        easing: opts.easing
      }) + ';' +
      'var EASING_FNS=' + EASING_FNS.toString() + ';' +
      'function hexToRgb(h){var r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return{r:r,g:g,b:b}}' +
      'function getColor(i){if(st.useCustomColors)return st.customColors[i%st.customColors.length];return PALETTES[st.palette][i%PALETTES[st.palette].length]}' +
      'function ease(t){var fn=EASING_FNS[st.easing]||EASING_FNS.easeOut;return fn(Math.max(0,Math.min(1,t)))}' +
      'function staggerProgress(gT,idx,total){var sT=st.stagger*total,dur=1-sT;if(dur<=0)dur=0.01;var s=st.stagger*idx;return ease(Math.max(0,Math.min(1,(gT-s)/dur)))}' +
      'function formatNumber(v,p,suf,dec){p=p||"";suf=suf||"";dec=dec||0;var str=Math.abs(v).toFixed(dec);var parts=str.split(".");parts[0]=parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g," ");return(v<0?"-":"")+p+parts.join(".")+suf}' +
      drawBar.toString() +
      drawLine.toString() +
      drawPie.toString() +
      drawCounter.toString() +
      drawGauge.toString() +
      drawChart.toString() +
      'var _c=document.getElementById("c");var _ctx=_c.getContext("2d");' +
      'window._updateFrame=function(t){drawChart(_ctx,' + opts.width + ',' + opts.height + ',t)};' +
      '<\/script>' +
      '</body></html>';
  }

  async function exportMp4() {
    if (st.animating) return;

    var savePath = await ipcRenderer.invoke('save-dialog', {
      defaultName: 'chart-' + Date.now() + '.mp4',
      filters: [{ name: 'MP4', extensions: ['mp4'] }]
    });
    if (!savePath) return;

    var res = getResolution();
    var w = res[0], h = res[1];
    var fps = 30;
    var totalFrames = Math.round(st.animDuration * fps);

    var setExporting = function (active, label, pct) {
      var prog = $('#chartExportProgress');
      if (!prog) return;
      prog.classList.toggle('active', active);
      if (label) $('#chartExportLabel').textContent = label;
      if (pct !== undefined) $('#chartExportBarFill').style.width = pct + '%';
      if (!active) $('#chartExportBarFill').style.width = '0%';
    };

    setExporting(true, 'Przygotowuję...', 0);

    var html = buildOffscreenHtml({
      width: w, height: h,
      chartType: st.chartType,
      data: st.data,
      counterFrom: st.counterFrom,
      counterTo: st.counterTo,
      counterPrefix: st.counterPrefix,
      counterSuffix: st.counterSuffix,
      counterDecimals: st.counterDecimals,
      gaugeValue: st.gaugeValue,
      gaugeLabel: st.gaugeLabel,
      title: st.title,
      subtitle: st.subtitle,
      palette: st.palette,
      customColors: st.customColors,
      useCustomColors: st.useCustomColors,
      bgColor: st.bgColor,
      textColor: st.textColor,
      gridColor: st.gridColor,
      barRadius: st.barRadius,
      lineWidth: st.lineWidth,
      lineSmooth: st.lineSmooth,
      donutHole: st.donutHole,
      showLabels: st.showLabels,
      showValues: st.showValues,
      showGrid: st.showGrid,
      showLegend: st.showLegend,
      fontSize: st.fontSize,
      stagger: st.stagger,
      easing: st.easing
    });

    await ipcRenderer.invoke('bg-load-html', { html: html, width: w, height: h });
    setExporting(true, 'Renderowanie klatek...', 5);

    var frames = [];
    for (var i = 0; i < totalFrames; i++) {
      var t = totalFrames === 1 ? 1 : i / (totalFrames - 1);
      var frameJs = 'window._updateFrame(' + t + ')';
      var frameData = await ipcRenderer.invoke('bg-eval-capture', { js: frameJs, delay: 30 });
      frames.push({ data: frameData, duration: 1 });

      if (i % 5 === 0) {
        var pct = 5 + Math.round((i / totalFrames) * 80);
        setExporting(true, 'Klatka ' + (i + 1) + '/' + totalFrames, pct);
      }
    }

    frames.push({ data: frames[frames.length - 1].data, duration: Math.round(fps * 1.5) });

    setExporting(true, 'Koduj\u0119 MP4...', 90);
    await ipcRenderer.invoke('export-mp4', { frames: frames, savePath: savePath, fps: fps, width: w, height: h });
    await ipcRenderer.invoke('bg-cleanup');

    setExporting(false);
  }

  function renderDataTable() {
    var list = $('#chartDataList');
    if (!list) return;
    list.innerHTML = '';

    st.data.forEach(function (d, i) {
      var row = document.createElement('div');
      row.className = 'chart-data-row';

      var colorInp = document.createElement('input');
      colorInp.type = 'color';
      colorInp.className = 'control-color chart-data-color';
      colorInp.value = getColor(i);
      (function (idx, inp) {
        inp.addEventListener('input', function () {
          if (!st.useCustomColors) {
            st.useCustomColors = true;
            var toggle = $('#chartCustomColorsToggle');
            if (toggle) toggle.checked = true;
          }
          st.customColors[idx] = inp.value;
          renderPreview();
        });
      })(i, colorInp);

      var labelInp = document.createElement('input');
      labelInp.type = 'text';
      labelInp.className = 'control-input chart-data-input';
      labelInp.value = d.label;
      labelInp.placeholder = 'Etykieta';
      (function (idx, inp) {
        inp.addEventListener('input', function () {
          st.data[idx].label = inp.value;
          renderPreview();
        });
      })(i, labelInp);

      var valInp = document.createElement('input');
      valInp.type = 'number';
      valInp.className = 'control-input chart-data-input chart-data-val';
      valInp.value = d.value;
      valInp.placeholder = '0';
      (function (idx, inp) {
        inp.addEventListener('input', function () {
          st.data[idx].value = parseFloat(inp.value) || 0;
          renderPreview();
        });
      })(i, valInp);

      var del = document.createElement('button');
      del.className = 'chart-data-del';
      del.innerHTML = '&times;';
      del.title = 'Usu\u0144';
      (function (idx) {
        del.addEventListener('click', function () {
          if (st.data.length <= 1) return;
          st.data.splice(idx, 1);
          renderDataTable();
          renderPreview();
        });
      })(i);

      row.appendChild(colorInp);
      row.appendChild(labelInp);
      row.appendChild(valInp);
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  function bindControls() {
    $$('#chartTypeGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#chartTypeGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.chartType = btn.dataset.type;
        updateChartTypeVisibility();
        renderPreview();
      });
    });

    $$('#chartPaletteGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#chartPaletteGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.palette = btn.dataset.palette;
        st.useCustomColors = false;
        renderDataTable();
        renderPreview();
      });
    });

    $$('#chartFormatGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#chartFormatGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.format = btn.dataset.format;
        renderPreview();
      });
    });

    $('#chartResolutionSelect').addEventListener('change', function (e) {
      st.resolution = e.target.value;
      renderPreview();
    });

    $('#chartAddDataBtn').addEventListener('click', function () {
      st.data.push({ label: 'Nowy', value: Math.round(Math.random() * 1000) });
      renderDataTable();
      renderPreview();
    });

    $('#chartBgColor').addEventListener('input', function (e) {
      st.bgColor = e.target.value;
      renderPreview();
    });

    $('#chartTextColor').addEventListener('input', function (e) {
      st.textColor = e.target.value;
      renderPreview();
    });

    $('#chartTitle').addEventListener('input', function (e) {
      st.title = e.target.value;
      renderPreview();
    });

    $('#chartSubtitle').addEventListener('input', function (e) {
      st.subtitle = e.target.value;
      renderPreview();
    });

    $('#chartAnimDuration').addEventListener('input', function (e) {
      st.animDuration = parseFloat(e.target.value);
      $('#chartAnimDurationVal').textContent = st.animDuration + 's';
    });

    $('#chartStagger').addEventListener('input', function (e) {
      st.stagger = parseFloat(e.target.value);
      $('#chartStaggerVal').textContent = (st.stagger * 100).toFixed(0) + '%';
      renderPreview();
    });

    $('#chartEasingSelect').addEventListener('change', function (e) {
      st.easing = e.target.value;
      renderPreview();
    });

    $('#chartFontSize').addEventListener('input', function (e) {
      st.fontSize = parseInt(e.target.value);
      $('#chartFontSizeVal').textContent = st.fontSize + 'px';
      renderPreview();
    });

    $('#chartBarRadius').addEventListener('input', function (e) {
      st.barRadius = parseInt(e.target.value);
      $('#chartBarRadiusVal').textContent = st.barRadius;
      renderPreview();
    });

    $('#chartLineWidth').addEventListener('input', function (e) {
      st.lineWidth = parseInt(e.target.value);
      $('#chartLineWidthVal').textContent = st.lineWidth;
      renderPreview();
    });

    $('#chartDonutHole').addEventListener('input', function (e) {
      st.donutHole = parseFloat(e.target.value);
      $('#chartDonutHoleVal').textContent = (st.donutHole * 100).toFixed(0) + '%';
      renderPreview();
    });

    $('#chartLabelsToggle').addEventListener('change', function (e) {
      st.showLabels = e.target.checked;
      renderPreview();
    });

    $('#chartValuesToggle').addEventListener('change', function (e) {
      st.showValues = e.target.checked;
      renderPreview();
    });

    $('#chartGridToggle').addEventListener('change', function (e) {
      st.showGrid = e.target.checked;
      renderPreview();
    });

    $('#chartLegendToggle').addEventListener('change', function (e) {
      st.showLegend = e.target.checked;
      renderPreview();
    });

    $('#chartSmoothToggle').addEventListener('change', function (e) {
      st.lineSmooth = e.target.checked;
      renderPreview();
    });

    $('#chartCustomColorsToggle').addEventListener('change', function (e) {
      st.useCustomColors = e.target.checked;
      renderDataTable();
      renderPreview();
    });

    $('#chartCounterFrom').addEventListener('input', function (e) {
      st.counterFrom = parseFloat(e.target.value) || 0;
      renderPreview();
    });

    $('#chartCounterTo').addEventListener('input', function (e) {
      st.counterTo = parseFloat(e.target.value) || 0;
      renderPreview();
    });

    $('#chartCounterPrefix').addEventListener('input', function (e) {
      st.counterPrefix = e.target.value;
      renderPreview();
    });

    $('#chartCounterSuffix').addEventListener('input', function (e) {
      st.counterSuffix = e.target.value;
      renderPreview();
    });

    $('#chartCounterDecimals').addEventListener('input', function (e) {
      st.counterDecimals = parseInt(e.target.value) || 0;
      renderPreview();
    });

    $('#chartGaugeValue').addEventListener('input', function (e) {
      st.gaugeValue = parseFloat(e.target.value) || 0;
      $('#chartGaugeValueVal').textContent = st.gaugeValue + '%';
      renderPreview();
    });

    $('#chartGaugeLabel').addEventListener('input', function (e) {
      st.gaugeLabel = e.target.value;
      renderPreview();
    });

    $('#chartPlayBtn').addEventListener('click', function () {
      if (st.animating) stopAnimation();
      else startAnimation();
    });

    $('#chartStopBtn').addEventListener('click', function () {
      stopAnimation();
    });

    $('#chartExportBtn').addEventListener('click', function () {
      exportMp4();
    });
  }

  function updateChartTypeVisibility() {
    var types = ['bar', 'line', 'pie', 'counter', 'gauge'];
    types.forEach(function (t) {
      var el = $('[data-chart-options="' + t + '"]');
      if (el) el.style.display = st.chartType === t ? '' : 'none';
    });

    var commonData = $('[data-chart-options="data"]');
    if (commonData) commonData.style.display = (st.chartType === 'counter' || st.chartType === 'gauge') ? 'none' : '';

    var commonBarLine = $('[data-chart-options="barline"]');
    if (commonBarLine) commonBarLine.style.display = (st.chartType === 'bar' || st.chartType === 'line') ? '' : 'none';
  }

  window.initChartTool = function () {
    st.canvas = document.getElementById('chartCanvas');
    if (!st.canvas) return;
    st.ctx = st.canvas.getContext('2d');
    bindControls();
    renderDataTable();
    updateChartTypeVisibility();
    renderPreview();
  };

  window.chartActivate = function () {
    setTimeout(function () {
      renderPreview();
    }, 100);
  };

  window.chartUpdatePreviewSize = function () {
    renderPreview();
  };
})();
