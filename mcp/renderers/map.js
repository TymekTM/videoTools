const { createPage, loadHtml, waitForFonts, evalAndCapture, closePage } = require('../lib/browser');
const { encode, countFrames } = require('../lib/encoder');
const { getResolution } = require('../registry');

const MAP_TILES = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};

function d2r(d) { return d * Math.PI / 180; }
function r2d(r) { return r * 180 / Math.PI; }

function greatCirclePoints(start, end, n) {
  n = n || 100;
  const lat1 = d2r(start.lat), lng1 = d2r(start.lng);
  const lat2 = d2r(end.lat), lng2 = d2r(end.lng);
  const cosD = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
  const d = Math.acos(Math.min(1, Math.max(-1, cosD)));
  if (d < 1e-10) return [{ lat: start.lat, lng: start.lng }];
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const cx = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const cy = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const cz = A * Math.sin(lat1) + B * Math.sin(lat2);
    pts.push({ lat: r2d(Math.atan2(cz, Math.sqrt(cx * cx + cy * cy))), lng: r2d(Math.atan2(cy, cx)) });
  }
  return pts;
}

function bearing(from, to) {
  const dLng = d2r(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(d2r(to.lat));
  const x = Math.cos(d2r(from.lat)) * Math.sin(d2r(to.lat)) - Math.sin(d2r(from.lat)) * Math.cos(d2r(to.lat)) * Math.cos(dLng);
  return (r2d(Math.atan2(y, x)) + 360) % 360;
}

function vehicleSvg(type, color) {
  const c = color || '#6366f1';
  const svgs = {
    plane: `<svg viewBox="0 0 64 64" width="44" height="44"><ellipse cx="32" cy="30" rx="4" ry="22" fill="${c}"/><path d="M10 28L32 20 54 28 32 32Z" fill="${c}"/><path d="M24 48L32 52 40 48 36 42 32 44 28 42Z" fill="${c}"/></svg>`,
    car: `<svg viewBox="0 0 64 64" width="44" height="44"><path d="M22 52Q22 46 20 42L20 20Q20 12 28 8L36 8Q44 12 44 20L44 42Q42 46 42 52Q42 58 32 58Q22 58 22 52Z" fill="${c}"/></svg>`,
    ship: `<svg viewBox="0 0 64 64" width="44" height="44"><path d="M8 42L14 30 32 10 50 30 56 42Z" fill="${c}"/><path d="M4 50Q16 44 32 44Q48 44 60 50" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2.5" opacity="0.3" stroke-linecap="round"/></svg>`,
    train: `<svg viewBox="0 0 64 64" width="44" height="44"><rect x="16" y="6" width="32" height="40" rx="7" fill="${c}" stroke="rgba(255,255,255,0.9)" stroke-width="0.5"/><rect x="21" y="11" width="22" height="12" rx="3" fill="rgba(255,255,255,0.25)"/></svg>`,
  };
  return svgs[type] || svgs.plane;
}

async function fetchOsmrRoute(waypoints) {
  const coords = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.code === 'Ok' && data.routes && data.routes.length) {
      return data.routes[0].geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
    }
  } catch (e) {}
  return null;
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function buildMapHtml(opts) {
  const routeCoordsJson = JSON.stringify(opts.routeCoords);
  const waypointLabels = opts.waypoints.map((wp, i) => ({
    lat: wp.lat, lng: wp.lng, name: wp.name || `Point ${i + 1}`,
  }));
  const segmentsJson = JSON.stringify(opts.segments || []);

  const segmentRouteLines = opts.segments && opts.segments.length > 0
    ? `var segments = ${segmentsJson};
var routeLines = segments.map(function(seg) {
  var pts = routeCoords.slice(seg.start, seg.end + 1);
  return L.polyline(pts, {color: seg.color, weight: ${opts.routeWidth}, opacity: 0.8}).addTo(map);
});`
    : `var segments = []; var routeLine = L.polyline(routeCoords, {color: '${opts.routeColor}', weight: ${opts.routeWidth}, opacity: 0.8}).addTo(map);`;

  const segmentTrailLines = opts.segments && opts.segments.length > 0
    ? `var trailLines = segments.map(function(seg) {
  return L.polyline([], {color: seg.color, weight: ${opts.routeWidth + 2}, opacity: 1}).addTo(map);
});`
    : `var trailLine = L.polyline([], {color: '${opts.routeColor}', weight: ${opts.routeWidth + 2}, opacity: 1}).addTo(map);`;

  const segmentSetProgress = opts.segments && opts.segments.length > 0
    ? `var segs = segments;
  for (var s = 0; s < segs.length; s++) {
    if (idx >= segs[s].start && idx <= segs[s].end) {
      var trailPts = routeCoords.slice(segs[s].start, idx + 1);
      trailPts.push({lat: lat, lng: lng});
      trailLines[s].setLatLngs(trailPts);
      for (var ps = 0; ps < s; ps++) {
        trailLines[ps].setLatLngs(routeCoords.slice(segs[ps].start, segs[ps].end + 1));
      }
    }
  }`
    : `var trailPts = routeCoords.slice(0, idx + 1);
  trailPts.push({lat: lat, lng: lng});
  trailLine.setLatLngs(trailPts);`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden}#map{width:100%;height:100%}.map-vehicle-icon{background:none!important;border:none!important}.leaflet-control-attribution,.leaflet-control-zoom{display:none!important}</style>
</head><body><div id="map"></div>
<script>
var routeCoords = ${routeCoordsJson};
var waypoints = ${JSON.stringify(waypointLabels)};
var map = L.map('map', {zoomControl: false, attributionControl: false}).setView([${opts.centerLat}, ${opts.centerLng}], ${opts.zoom});
var tileLayer = L.tileLayer('${MAP_TILES[opts.mapStyle] || MAP_TILES.dark}', {maxZoom: 19});
window._tilesReady = new Promise(function(resolve) {
  var settled = false;
  function finish(delay) {
    if (settled) return;
    settled = true;
    setTimeout(function() {
      requestAnimationFrame(function() { requestAnimationFrame(resolve); });
    }, delay);
  }
  tileLayer.once('load', function() { finish(250); });
  setTimeout(function() { finish(0); }, 3000);
});
tileLayer.addTo(map);

${segmentRouteLines}

${segmentTrailLines}

  var vehicleIcon = L.divIcon({
    html: '<div class="vehicle-rot">' + '${vehicleSvg(opts.transportType, opts.routeColor).replace(/'/g, "\\'")}' + '</div>',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    className: 'map-vehicle-icon'
  });
  var vehicleMarker = L.marker([routeCoords[0].lat, routeCoords[0].lng], {icon: vehicleIcon}).addTo(map);

if(${opts.showLabels}) {
  waypoints.forEach(function(wp, i) {
      var labelColor = (typeof segments !== 'undefined' && segments[i]) ? segments[Math.min(i, segments.length - 1)].color : '${opts.routeColor}';
    L.marker([wp.lat, wp.lng], {
      icon: L.divIcon({
        html: '<div style="background:' + labelColor + ';color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-family:sans-serif;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3)">' + wp.name + '</div>',
        className: '',
        iconAnchor: [30, 12]
      })
    }).addTo(map);
  });
}

window._setProgress = function(t) {
  if (!routeCoords.length) return;
  t = Math.max(0, Math.min(1, t));
  var idx = Math.floor(t * (routeCoords.length - 1));
  var frac = t * (routeCoords.length - 1) - idx;
  if (idx >= routeCoords.length - 1) { idx = routeCoords.length - 2; frac = 1; }
  var lat = routeCoords[idx].lat + (routeCoords[idx + 1].lat - routeCoords[idx].lat) * frac;
  var lng = routeCoords[idx].lng + (routeCoords[idx + 1].lng - routeCoords[idx].lng) * frac;
  vehicleMarker.setLatLng([lat, lng]);
  var look = Math.max(1, Math.round(routeCoords.length * 0.03));
  var iBack = Math.max(0, idx - look);
  var iFwd = Math.min(routeCoords.length - 1, idx + look);
  if (routeCoords[iFwd].lng - routeCoords[iBack].lng > 180) iFwd = idx;
  var dLng = (routeCoords[iFwd].lng - routeCoords[iBack].lng) * Math.PI / 180;
  var y = Math.sin(dLng) * Math.cos(routeCoords[iFwd].lat * Math.PI / 180);
  var x = Math.cos(routeCoords[iBack].lat * Math.PI / 180) * Math.sin(routeCoords[iFwd].lat * Math.PI / 180) - Math.sin(routeCoords[iBack].lat * Math.PI / 180) * Math.cos(routeCoords[iFwd].lat * Math.PI / 180) * Math.cos(dLng);
  var heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  if ('${opts.transportType}' !== 'train') {
    var el = vehicleMarker.getElement();
    if (el) { var inner = el.querySelector('.vehicle-rot'); if (inner) inner.style.transform = 'rotate(' + heading + 'deg)'; }
  }
  ${segmentSetProgress}
  if ('${opts.cameraMode}' === 'follow') {
    map.setView([lat, lng], map.getZoom(), {animate: false});
  }
};
<\/script></body></html>`;
}

async function generate(params, outputPath, format) {
  const p = {
    waypoints: [{ lat: 52.2297, lng: 21.0122, name: 'Warsaw' }, { lat: 48.8566, lng: 2.3522, name: 'Paris' }],
    transportType: 'plane', mapStyle: 'dark', cameraMode: 'follow',
    format: '16:9', resolution: '1080p', fps: 30,
    routeColor: '#6366f1', routeWidth: 4,
    animDuration: 5, zoom: 5,
    easing: true, showLabels: true,
    segmentColors: ['#6366f1', '#f43f5e', '#22c55e', '#f59e0b', '#06b6d4', '#a855f7', '#ec4899', '#14b8a6'],
    ...params,
  };

  if (p.waypoints.length < 2) throw new Error('Need at least 2 waypoints');

  const [width, height] = getResolution(p.format, p.resolution);
  const fps = p.fps;

  let routeCoords = [];
  if (p.transportType === 'car' || p.transportType === 'train') {
    const osrmCoords = await fetchOsmrRoute(p.waypoints);
    if (osrmCoords && osrmCoords.length >= 2) {
      routeCoords = osrmCoords;
    } else {
      for (let i = 0; i < p.waypoints.length - 1; i++) {
        const seg = greatCirclePoints(p.waypoints[i], p.waypoints[i + 1], 100);
        if (i > 0) seg.shift();
        routeCoords = routeCoords.concat(seg);
      }
    }
  } else {
    for (let i = 0; i < p.waypoints.length - 1; i++) {
      const seg = greatCirclePoints(p.waypoints[i], p.waypoints[i + 1], 100);
      if (i > 0) seg.shift();
      routeCoords = routeCoords.concat(seg);
    }
  }

  const segments = [];
  const colors = p.segmentColors;
  if (p.waypoints.length > 2) {
    const wps = p.waypoints.length;
    const perLeg = Math.floor(routeCoords.length / (wps - 1));
    for (let i = 0; i < wps - 1; i++) {
      segments.push({
        start: i * perLeg,
        end: i === wps - 2 ? routeCoords.length - 1 : (i + 1) * perLeg,
        color: colors[i % colors.length],
      });
    }
  }

  const centerLat = p.waypoints.reduce((s, w) => s + w.lat, 0) / p.waypoints.length;
  const centerLng = p.waypoints.reduce((s, w) => s + w.lng, 0) / p.waypoints.length;

  const html = buildMapHtml({
    width, height,
    routeCoords, waypoints: p.waypoints,
    segments: segments.length > 0 ? segments : null,
    centerLat, centerLng, zoom: p.zoom,
    mapStyle: p.mapStyle, cameraMode: p.cameraMode,
    transportType: p.transportType,
    routeColor: p.routeColor, routeWidth: p.routeWidth,
    showLabels: p.showLabels,
  });

  const page = await createPage(width, height);
  await loadHtml(page, html);
  await waitForFonts(page);

  await page.evaluate(() => window._tilesReady);

  const totalFrames = Math.round(p.animDuration * fps);
  const frames = [];

  for (let i = 0; i < totalFrames; i++) {
    const rawT = totalFrames === 1 ? 1 : i / (totalFrames - 1);
    const t = p.easing ? easeInOut(rawT) : rawT;
    const d = await evalAndCapture(page, `window._setProgress(${t})`);
    frames.push({ data: d, duration: 1 });
  }

  const holdFrames = Math.round(fps * 1);
  frames[frames.length - 1].duration += holdFrames;

  await closePage(page);
  await encode(frames, outputPath, fps, width, height, format || 'mp4');

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

module.exports = { generate, buildMapHtml };
