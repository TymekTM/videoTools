(function () {
  'use strict';

  var { ipcRenderer } = require('electron');

  var CHART_RES = RESOLUTIONS;

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

  var _fontCache = new Map();
  function chartFont(weight, size) {
    var key = weight + '|' + size;
    var cached = _fontCache.get(key);
    if (cached) return cached;
    var result = weight + ' ' + Math.max(size, 9) + 'px "Manrope", system-ui, sans-serif';
    _fontCache.set(key, result);
    return result;
  }

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
    fontSize: 32,
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

  function getResolution() {
    return CHART_RES[st.format][st.resolution];
  }

  function getColor(idx) {
    if (st.useCustomColors) return st.customColors[idx % st.customColors.length];
    return PALETTES[st.palette][idx % PALETTES[st.palette].length];
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
    ctx.font = chartFont('600', st.fontSize * 0.8);
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

    var progressArr = new Array(barCount);
    for (var pi = 0; pi < barCount; pi++) progressArr[pi] = staggerProgress(progress, pi, barCount);

    data.forEach(function (d, i) {
      var p = progressArr[i];
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
        ctx.font = chartFont('700', st.fontSize * 0.75);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(formatNumber(d.value), x + barW / 2, y - 6);
        ctx.globalAlpha = 1;
      }

      if (st.showLabels) {
        ctx.fillStyle = st.textColor;
        ctx.globalAlpha = 0.6;
        ctx.font = chartFont('500', st.fontSize * 0.7);
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

    ctx.save();

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
        ctx.font = chartFont('500', st.fontSize * 0.7);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatNumber(gv), pad.left - 8, gy);
        ctx.globalAlpha = 1;
      }
    }

    var baseline = pad.top + chartH;
    var ep = ease(progress);

    var points = data.map(function (d, i) {
      var x = pad.left + (i / (data.length - 1 || 1)) * chartW;
      var targetY = baseline - (d.value / maxVal) * chartH;
      var y = baseline + (targetY - baseline) * ep;
      return { x: x, y: y, targetY: targetY, d: d, i: i };
    });

    if (points.length < 2) { ctx.restore(); return; }

    var color = getColor(0);
    var rgb = hexToRgb(color);

    var fillGrad = ctx.createLinearGradient(0, pad.top, 0, baseline);
    fillGrad.addColorStop(0, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.25)');
    fillGrad.addColorStop(1, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.02)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, baseline);
    ctx.lineTo(points[0].x, points[0].y);
    for (var fi = 1; fi < points.length; fi++) {
      if (st.lineSmooth) {
        var fmx = (points[fi - 1].x + points[fi].x) / 2;
        ctx.bezierCurveTo(fmx, points[fi - 1].y, fmx, points[fi].y, points[fi].x, points[fi].y);
      } else {
        ctx.lineTo(points[fi].x, points[fi].y);
      }
    }
    ctx.lineTo(points[points.length - 1].x, baseline);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var ci = 1; ci < points.length; ci++) {
      if (st.lineSmooth) {
        var cmx = (points[ci - 1].x + points[ci].x) / 2;
        ctx.bezierCurveTo(cmx, points[ci - 1].y, cmx, points[ci].y, points[ci].x, points[ci].y);
      } else {
        ctx.lineTo(points[ci].x, points[ci].y);
      }
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = st.lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    points.forEach(function (pt) {
      var pp = ep;
      if (pp < 0.05) return;

      ctx.globalAlpha = Math.min(1, pp * 1.5);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(4, st.lineWidth * 1.5), 0, Math.PI * 2);
      ctx.fillStyle = st.bgColor;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = st.lineWidth;
      ctx.stroke();
      ctx.globalAlpha = 1;

      if (st.showValues && pp > 0.3) {
        ctx.fillStyle = st.textColor;
        ctx.globalAlpha = Math.min(1, pp * 2);
        ctx.font = chartFont('700', st.fontSize * 0.7);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(formatNumber(pt.d.value), pt.x, pt.y - 10);
        ctx.globalAlpha = 1;
      }

      if (st.showLabels) {
        ctx.fillStyle = st.textColor;
        ctx.globalAlpha = 0.6;
        ctx.font = chartFont('500', st.fontSize * 0.7);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(pt.d.label, pt.x, baseline + 8);
        ctx.globalAlpha = 1;
      }
    });

    ctx.restore();
  }

  function drawPie(ctx, w, h, progress) {
    var data = st.data;
    if (!data.length) return;

    var hasLegend = st.showLegend && data.length > 2;
    var isPortrait = st.format === '9:16';

    var cx, cy, radius;
    if (isPortrait && hasLegend) {
      cx = w * 0.5;
      cy = h * (st.title ? 0.38 : 0.34);
      radius = Math.min(w * 0.38, h * 0.22);
    } else if (hasLegend) {
      cx = w * 0.38;
      cy = h * (st.title ? 0.54 : 0.5);
      radius = Math.min(w * 0.32, h * 0.36);
    } else {
      cx = w * 0.5;
      cy = h * (st.title ? 0.54 : 0.5);
      radius = Math.min(w, h) * 0.38;
      radius = Math.min(radius, h * 0.36);
    }
    var innerRadius = radius * st.donutHole;

    var total = data.reduce(function (s, d) { return s + d.value; }, 0);
    if (total <= 0) total = 1;

    var startAngle = -Math.PI / 2;

    var pieCount = data.length;
    var progressArr = new Array(pieCount);
    for (var pi = 0; pi < pieCount; pi++) progressArr[pi] = staggerProgress(progress, pi, pieCount);

    data.forEach(function (d, i) {
      var p = progressArr[i];
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
        ctx.font = chartFont('700', st.fontSize * 0.75);
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
      ctx.font = chartFont('500', st.fontSize * 0.6);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TOTAL', cx, cy - st.fontSize * 0.5);
      ctx.globalAlpha = 1;
      ctx.fillStyle = st.textColor;
      ctx.font = chartFont('800', st.fontSize * 1.2);
      ctx.fillText(formatNumber(total), cx, cy + st.fontSize * 0.5);
    }

    if (hasLegend) {
      if (isPortrait) {
        var legendTopY = cy + radius + h * 0.06;
        var cols = Math.min(data.length, 2);
        var colW = w / cols;
        var rowH = st.fontSize * 2.2;
        data.forEach(function (d, i) {
          var col = i % cols;
          var row = Math.floor(i / cols);
          var lx = colW * col + colW * 0.08;
          var ly = legendTopY + row * rowH;
          var lp = staggerProgress(progress, i, data.length);
          ctx.globalAlpha = Math.min(1, lp * 2);

          ctx.fillStyle = getColor(i);
          ctx.beginPath();
          ctx.arc(lx + st.fontSize * 0.4, ly + st.fontSize * 0.3, Math.max(st.fontSize * 0.35, 4), 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = st.textColor;
          ctx.font = chartFont('600', st.fontSize * 0.75);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(d.label + '  ' + formatNumber(d.value), lx + st.fontSize, ly);

          ctx.globalAlpha = 1;
        });
      } else {
        var legendX = cx + radius + w * 0.06;
        var legendY = h * 0.2;
        var legendSpacing = Math.max(st.fontSize * 2, (h * 0.6) / data.length);
        data.forEach(function (d, i) {
          var lp = staggerProgress(progress, i, data.length);
          ctx.globalAlpha = Math.min(1, lp * 2);

          ctx.fillStyle = getColor(i);
          ctx.beginPath();
          ctx.arc(legendX, legendY + i * legendSpacing, Math.max(st.fontSize * 0.4, 4), 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = st.textColor;
ctx.font = chartFont('600', st.fontSize * 0.8);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(d.label, legendX + st.fontSize, legendY + i * legendSpacing);

          ctx.globalAlpha = 0.4;
          ctx.font = chartFont('400', st.fontSize * 0.7);
          ctx.fillText(formatNumber(d.value), legendX + st.fontSize, legendY + i * legendSpacing + st.fontSize * 0.9);

          ctx.globalAlpha = 1;
        });
      }
    }
  }

  function drawCounter(ctx, w, h, progress) {
    var p = ease(progress);
    var val = st.counterFrom + (st.counterTo - st.counterFrom) * p;
    var str = formatNumber(val, st.counterPrefix, st.counterSuffix, st.counterDecimals);

    ctx.fillStyle = st.textColor;
    ctx.font = chartFont('800', Math.min(w * 0.12, h * 0.2, 120));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, w / 2, h / 2);

    if (st.title) {
      ctx.fillStyle = st.textColor;
      ctx.globalAlpha = 0.5;
      ctx.font = chartFont('600', st.fontSize);
      ctx.fillText(st.title, w / 2, h * 0.35);
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
    ctx.font = chartFont('800', Math.min(radius * 0.6, 80));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(val) + '%', cx, cy);

    if (st.gaugeLabel) {
      ctx.fillStyle = st.textColor;
      ctx.globalAlpha = 0.5;
      ctx.font = chartFont('600', st.fontSize);
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
      ctx.font = chartFont('400', st.fontSize * 0.6);
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
      ctx.font = chartFont('800', st.fontSize * 1.4);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(st.title, w / 2, h * 0.03);
    }

    if (st.subtitle && st.chartType !== 'counter') {
      ctx.fillStyle = st.textColor;
      ctx.globalAlpha = 0.4;
      ctx.font = chartFont('500', st.fontSize * 0.8);
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

    var res = getResolution();
    var rw = res[0], rh = res[1];

    if (st.canvas.width !== rw || st.canvas.height !== rh) {
      st.canvas.width = rw;
      st.canvas.height = rh;
    }
    st.ctx = st.canvas.getContext('2d');

    var area = $('[data-tool="chart"] .preview-area');
    if (area) {
      var aw = area.clientWidth;
      var ah = area.clientHeight;
      if (aw > 0 && ah > 0) {
        var scale = Math.min(aw / rw, ah / rh, 1);
        var pw = Math.round(rw * scale);
        var ph = Math.round(rh * scale);
        st.canvas.style.width = pw + 'px';
        st.canvas.style.height = ph + 'px';
        var wrapper = $('#chartPreviewWrapper');
        if (wrapper) {
          wrapper.style.width = pw + 'px';
          wrapper.style.height = ph + 'px';
        }
      }
    }

    st.animating = true;
    var start = performance.now();
    var dur = st.animDuration * 1000;

    function frame(now) {
      if (!st.animating) return;
      var elapsed = now - start;
      var t = Math.min(elapsed / dur, 1);
      try {
        drawChart(st.ctx, rw, rh, t);
      } catch (e) {
        console.error('chart frame error:', e);
        st.animating = false;
        return;
      }
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

    setExporting(true, t('chartInitializing'), 0);

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
    setExporting(true, t('chartRenderingFrames'), 5);

    var frames = [];
    var batchSize = 10;
    var batchItems = [];

    for (var i = 0; i < totalFrames; i++) {
      var t = totalFrames === 1 ? 1 : i / (totalFrames - 1);
      batchItems.push({ js: 'window._updateFrame(' + t + ')' });

      if (batchItems.length >= batchSize || i === totalFrames - 1) {
        var batchData = await ipcRenderer.invoke('bg-eval-capture-batch', { frames: batchItems });
        for (var b = 0; b < batchData.length; b++) {
          frames.push({ data: batchData[b], duration: 1 });
        }
        batchItems = [];
        var pct = 5 + Math.round(((i + 1) / totalFrames) * 80);
        setExporting(true, t('chartRenderingFrame') + ' ' + (i + 1) + '/' + totalFrames, pct);
      }
    }

    frames.push({ data: frames[frames.length - 1].data, duration: Math.round(fps * 1.5) });

    setExporting(true, t('chartEncodingMp4'), 90);
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
      labelInp.placeholder = t('chartGaugeLabel');
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
      del.title = t('chartDelete');
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

  var controlsBound = false;

  function bindControls() {
    if (controlsBound) return;
    controlsBound = true;
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

    listen('#chartResolutionSelect', 'change', function (e) {
      st.resolution = e.target.value;
      renderPreview();
    });

    listen('#chartAddDataBtn', 'click', function () {
      st.data.push({ label: t('chartNewItem'), value: Math.round(Math.random() * 1000) });
      renderDataTable();
      renderPreview();
    });

    listen('#chartBgColor', 'input', function (e) {
      st.bgColor = e.target.value;
      renderPreview();
    });

    listen('#chartTextColor', 'input', function (e) {
      st.textColor = e.target.value;
      renderPreview();
    });

    listen('#chartTitle', 'input', function (e) {
      st.title = e.target.value;
      renderPreview();
    });

    listen('#chartSubtitle', 'input', function (e) {
      st.subtitle = e.target.value;
      renderPreview();
    });

    listen('#chartAnimDuration', 'input', function (e) {
      st.animDuration = parseFloat(e.target.value);
      var el = $('#chartAnimDurationVal');
      if (el) el.textContent = st.animDuration + 's';
    });

    listen('#chartStagger', 'input', function (e) {
      st.stagger = parseFloat(e.target.value);
      var el = $('#chartStaggerVal');
      if (el) el.textContent = (st.stagger * 100).toFixed(0) + '%';
      renderPreview();
    });

    listen('#chartEasingSelect', 'change', function (e) {
      st.easing = e.target.value;
      renderPreview();
    });

    listen('#chartFontSize', 'input', function (e) {
      st.fontSize = parseInt(e.target.value);
      var el = $('#chartFontSizeVal');
      if (el) el.textContent = st.fontSize + 'px';
      renderPreview();
    });

    listen('#chartBarRadius', 'input', function (e) {
      st.barRadius = parseInt(e.target.value);
      var el = $('#chartBarRadiusVal');
      if (el) el.textContent = st.barRadius;
      renderPreview();
    });

    listen('#chartLineWidth', 'input', function (e) {
      st.lineWidth = parseInt(e.target.value);
      var el = $('#chartLineWidthVal');
      if (el) el.textContent = st.lineWidth;
      renderPreview();
    });

    listen('#chartDonutHole', 'input', function (e) {
      st.donutHole = parseFloat(e.target.value);
      var el = $('#chartDonutHoleVal');
      if (el) el.textContent = (st.donutHole * 100).toFixed(0) + '%';
      renderPreview();
    });

    listen('#chartLabelsToggle', 'change', function (e) {
      st.showLabels = e.target.checked;
      renderPreview();
    });

    listen('#chartValuesToggle', 'change', function (e) {
      st.showValues = e.target.checked;
      renderPreview();
    });

    listen('#chartGridToggle', 'change', function (e) {
      st.showGrid = e.target.checked;
      renderPreview();
    });

    listen('#chartLegendToggle', 'change', function (e) {
      st.showLegend = e.target.checked;
      renderPreview();
    });

    listen('#chartSmoothToggle', 'change', function (e) {
      st.lineSmooth = e.target.checked;
      renderPreview();
    });

    listen('#chartCustomColorsToggle', 'change', function (e) {
      st.useCustomColors = e.target.checked;
      renderDataTable();
      renderPreview();
    });

    listen('#chartCounterFrom', 'input', function (e) {
      st.counterFrom = parseFloat(e.target.value) || 0;
      renderPreview();
    });

    listen('#chartCounterTo', 'input', function (e) {
      st.counterTo = parseFloat(e.target.value) || 0;
      renderPreview();
    });

    listen('#chartCounterPrefix', 'input', function (e) {
      st.counterPrefix = e.target.value;
      renderPreview();
    });

    listen('#chartCounterSuffix', 'input', function (e) {
      st.counterSuffix = e.target.value;
      renderPreview();
    });

    listen('#chartCounterDecimals', 'input', function (e) {
      st.counterDecimals = parseInt(e.target.value) || 0;
      renderPreview();
    });

    listen('#chartGaugeValue', 'input', function (e) {
      st.gaugeValue = parseFloat(e.target.value) || 0;
      var el = $('#chartGaugeValueVal');
      if (el) el.textContent = st.gaugeValue + '%';
      renderPreview();
    });

    listen('#chartGaugeLabel', 'input', function (e) {
      st.gaugeLabel = e.target.value;
      renderPreview();
    });

    listen('#chartPlayBtn', 'click', function () {
      if (st.animating) stopAnimation();
      else startAnimation();
    });

    listen('#chartStopBtn', 'click', function () {
      stopAnimation();
    });

    listen('#chartExportBtn', 'click', function () {
      exportMp4();
    });
  }

  function updateChartTypeVisibility() {
    var types = ['bar', 'line', 'pie', 'counter', 'gauge'];
    types.forEach(function (t) {
      $$('[data-chart-options="' + t + '"]').forEach(function (el) {
        el.style.display = st.chartType === t ? 'block' : 'none';
      });
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
  };

  window.chartActivate = function () {
    try {
      if (!st.canvas) {
        st.canvas = document.getElementById('chartCanvas');
        if (st.canvas) st.ctx = st.canvas.getContext('2d');
      }
      bindControls();
      renderDataTable();
      updateChartTypeVisibility();
      renderPreview();
    } catch (e) { console.error('[chart] activate:', e); }
    setTimeout(function () {
      renderPreview();
    }, 150);
  };

  window.chartUpdatePreviewSize = function () {
    renderPreview();
  };
})();
