var RESOLUTIONS = {
  '16:9': { '720p': [1280, 720], '1080p': [1920, 1080], '4K': [3840, 2160] },
  '9:16': { '720p': [720, 1280], '1080p': [1080, 1920], '4K': [2160, 3840] },
  '1:1':  { '720p': [720, 720],  '1080p': [1080, 1080], '4K': [2160, 2160] }
};

var $ = function (s) { return document.querySelector(s); };
var $$ = function (s) { return document.querySelectorAll(s); };

function listen(sel, evt, fn) {
  var el = $(sel);
  if (el) el.addEventListener(evt, fn);
}

var _rgbCache = new Map();
function hexToRgb(hex) {
  var cached = _rgbCache.get(hex);
  if (cached) return cached;
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  var result = { r: r, g: g, b: b };
  _rgbCache.set(hex, result);
  return result;
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

function formatNumber(val, decimals) {
  var str = Math.abs(val).toFixed(decimals || 0);
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function makeSetExporting(prefix) {
  return function (active, label, pct) {
    var prog = $('#' + prefix + 'ExportProgress');
    if (!prog) return;
    prog.classList.toggle('active', active);
    if (label) $('#' + prefix + 'ExportLabel').textContent = label;
    if (pct !== undefined) $('#' + prefix + 'ExportBarFill').style.width = pct + '%';
    if (!active) $('#' + prefix + 'ExportBarFill').style.width = '0%';
  };
}
