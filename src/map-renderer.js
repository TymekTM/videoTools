(function () {
  'use strict';

  const { ipcRenderer } = require('electron');

  const MAP_TILES = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  const MAP_RES = RESOLUTIONS;

  function vehicleSvg(type, color) {
    var c = color || '#6366f1';
    var cw = 'rgba(255,255,255,0.9)';
    var cm = 'rgba(255,255,255,0.25)';
    var svgs = {
      plane: '<svg viewBox="0 0 64 64" width="44" height="44">' +
        '<ellipse cx="32" cy="30" rx="4" ry="22" fill="' + c + '"/>' +
        '<path d="M10 28L32 20 54 28 32 32Z" fill="' + c + '"/>' +
        '<path d="M10 28L32 24 54 28 32 30Z" fill="rgba(255,255,255,0.1)"/>' +
        '<path d="M24 48L32 52 40 48 36 42 32 44 28 42Z" fill="' + c + '"/>' +
        '<path d="M32 8L34 12 32 10 30 12Z" fill="' + cw + '" opacity="0.6"/>' +
        '<ellipse cx="32" cy="14" rx="2.5" ry="3" fill="' + cm + '"/>' +
        '</svg>',

      car: '<svg viewBox="0 0 64 64" width="44" height="44">' +
        '<path d="M22 52Q22 46 20 42L20 20Q20 12 28 8L36 8Q44 12 44 20L44 42Q42 46 42 52Q42 58 32 58Q22 58 22 52Z" fill="' + c + '"/>' +
        '<path d="M32 8Q24 12 24 20L24 26 40 26 40 20Q40 12 32 8Z" fill="' + cm + '"/>' +
        '<rect x="25" y="40" width="14" height="6" rx="2" fill="rgba(255,255,255,0.12)"/>' +
        '<rect x="18" y="22" width="3" height="7" rx="1.5" fill="' + c + '"/>' +
        '<rect x="43" y="22" width="3" height="7" rx="1.5" fill="' + c + '"/>' +
        '<circle cx="27" cy="10" r="1.8" fill="' + cw + '" opacity="0.6"/>' +
        '<circle cx="37" cy="10" r="1.8" fill="' + cw + '" opacity="0.6"/>' +
        '<circle cx="27" cy="54" r="1.5" fill="rgba(255,0,0,0.4)"/>' +
        '<circle cx="37" cy="54" r="1.5" fill="rgba(255,0,0,0.4)"/>' +
        '</svg>',

      ship: '<svg viewBox="0 0 64 64" width="44" height="44">' +
        '<path d="M8 42L14 30 32 10 50 30 56 42Z" fill="' + c + '"/>' +
        '<path d="M32 10L50 30 56 42 32 42Z" fill="rgba(0,0,0,0.12)"/>' +
        '<rect x="30" y="14" width="4" height="20" rx="1.5" fill="' + cw + '" opacity="0.3"/>' +
        '<path d="M32 14L32 8 38 14Z" fill="' + cw + '" opacity="0.35"/>' +
        '<rect x="24" y="34" width="16" height="4" rx="1" fill="rgba(255,255,255,0.15)"/>' +
        '<path d="M4 50Q16 44 32 44Q48 44 60 50" fill="none" stroke="' + cw + '" stroke-width="2.5" opacity="0.3" stroke-linecap="round"/>' +
        '<path d="M8 56Q18 50 32 50Q46 50 56 56" fill="none" stroke="' + c + '" stroke-width="1.5" opacity="0.2" stroke-linecap="round"/>' +
        '</svg>',

      train: '<svg viewBox="0 0 64 64" width="44" height="44">' +
        '<rect x="16" y="6" width="32" height="40" rx="7" fill="' + c + '" stroke="' + cw + '" stroke-width="0.5"/>' +
        '<rect x="21" y="11" width="22" height="12" rx="3" fill="' + cm + '" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>' +
        '<line x1="32" y1="11" x2="32" y2="23" stroke="rgba(255,255,255,0.12)" stroke-width="0.8"/>' +
        '<rect x="23" y="28" width="7" height="5" rx="1.5" fill="rgba(255,255,255,0.15)"/>' +
        '<rect x="34" y="28" width="7" height="5" rx="1.5" fill="rgba(255,255,255,0.15)"/>' +
        '<circle cx="23" cy="42" r="2.5" fill="' + cw + '" opacity="0.5"/>' +
        '<circle cx="41" cy="42" r="2.5" fill="' + cw + '" opacity="0.5"/>' +
        '<path d="M14 58L22 48M42 48L50 58" stroke="' + c + '" stroke-width="3.5" stroke-linecap="round"/>' +
        '<line x1="18" y1="58" x2="46" y2="58" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M22 6L32 2 42 6" fill="none" stroke="' + cw + '" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>' +
        '</svg>'
    };
    return svgs[type] || svgs.plane;
  }

  var st = {
    map: null,
    tileLayer: null,
    waypoints: [],
    routeCoords: [],
    routeSegments: [],
    routeLines: [],
    trailLine: null,
    vehicleMarker: null,
    transportType: 'plane',
    mapStyle: 'dark',
    cameraMode: 'follow',
    routeColor: '#6366f1',
    routeWidth: 4,
    animDuration: 5,
    zoom: 5,
    format: '16:9',
    resolution: '1080p',
    customVehiclePng: null,
    vehicleSize: 40,
    animating: false,
    animRaf: null,
    waypointMarkers: [],
    labelMarkers: [],
    activeInputIdx: -1,
    animStartTime: 0,
    easing: true,
    showLabels: true,
    segmentColors: ['#6366f1', '#f43f5e', '#22c55e', '#f59e0b', '#06b6d4', '#a855f7', '#ec4899', '#14b8a6']
  };

  function debounce(fn, ms) {
    var t;
    return function () {
      var a = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, a); }, ms);
    };
  }

  function d2r(d) { return d * Math.PI / 180; }
  function r2d(r) { return r * 180 / Math.PI; }

  function haversine(a, b) {
    var R = 6371000;
    var dLat = d2r(b.lat - a.lat);
    var dLng = d2r(b.lng - a.lng);
    var x = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(d2r(a.lat)) * Math.cos(d2r(b.lat)) * Math.pow(Math.sin(dLng / 2), 2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function lerpAngle(from, to, t) {
    var diff = ((to - from + 540) % 360) - 180;
    return (from + diff * t + 360) % 360;
  }

  function bearing(from, to) {
    var dLng = d2r(to.lng - from.lng);
    var y = Math.sin(dLng) * Math.cos(d2r(to.lat));
    var x = Math.cos(d2r(from.lat)) * Math.sin(d2r(to.lat)) - Math.sin(d2r(from.lat)) * Math.cos(d2r(to.lat)) * Math.cos(dLng);
    return (r2d(Math.atan2(y, x)) + 360) % 360;
  }

  function greatCirclePoints(start, end, n) {
    n = n || 100;
    var lat1 = d2r(start.lat), lng1 = d2r(start.lng);
    var lat2 = d2r(end.lat), lng2 = d2r(end.lng);
    var cosD = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
    var d = Math.acos(Math.min(1, Math.max(-1, cosD)));
    if (d < 1e-10) return [{ lat: start.lat, lng: start.lng }];
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var f = i / n;
      var A = Math.sin((1 - f) * d) / Math.sin(d);
      var B = Math.sin(f * d) / Math.sin(d);
      var cx = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
      var cy = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
      var cz = A * Math.sin(lat1) + B * Math.sin(lat2);
      pts.push({ lat: r2d(Math.atan2(cz, Math.sqrt(cx * cx + cy * cy))), lng: r2d(Math.atan2(cy, cx)) });
    }
    return pts;
  }

  function buildCumulativeDists(points) {
    var dists = [0];
    for (var i = 1; i < points.length; i++) {
      dists.push(dists[i - 1] + haversine(points[i - 1], points[i]));
    }
    return dists;
  }

  function bisectCumulative(dists, target) {
    var lo = 1, hi = dists.length - 1;
    while (lo < hi) {
      var mid = (lo + hi) >>> 1;
      if (dists[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function interpolatePath(points, t, _cachedDists) {
    if (!points.length) return { lat: 0, lng: 0, heading: 0 };
    if (points.length === 1 || t <= 0) {
      return { lat: points[0].lat, lng: points[0].lng, heading: points.length > 1 ? bearing(points[0], points[1]) : 0 };
    }
    if (t >= 1) {
      var last = points[points.length - 1];
      var prev = points[points.length - 2];
      return { lat: last.lat, lng: last.lng, heading: bearing(prev, last) };
    }
    var dists = _cachedDists || buildCumulativeDists(points);
    var total = dists[dists.length - 1];
    if (total === 0) return { lat: points[0].lat, lng: points[0].lng, heading: 0 };
    var target = t * total;
    var j = bisectCumulative(dists, target);
    var seg = dists[j] - dists[j - 1];
    var f = seg > 0 ? (target - dists[j - 1]) / seg : 0;
    var lat = points[j - 1].lat + (points[j].lat - points[j - 1].lat) * f;
    var lng = points[j - 1].lng + (points[j].lng - points[j - 1].lng) * f;
    var look = Math.max(1, Math.round(points.length * 0.03));
    var iBack = Math.max(0, j - look);
    var iFwd = Math.min(points.length - 1, j + look);
    while (iBack < iFwd && haversine(points[iBack], points[iFwd]) < 50) {
      look++;
      iBack = Math.max(0, j - look);
      iFwd = Math.min(points.length - 1, j + look);
    }
    return { lat: lat, lng: lng, heading: bearing(points[iBack], points[iFwd]) };
  }

  function getResolution() {
    return MAP_RES[st.format][st.resolution];
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function getSegmentColor(segIdx) {
    return st.segmentColors[segIdx % st.segmentColors.length];
  }

  async function geocodeSearch(query) {
    if (!query || query.length < 2) return [];
    try {
      var resp = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query) + '&format=json&limit=5&accept-language=pl');
      return await resp.json();
    } catch (e) {
      return [];
    }
  }

  async function reverseGeocode(lat, lng) {
    try {
      var resp = await fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lng + '&format=json&accept-language=pl');
      var data = await resp.json();
      return data.display_name || (lat.toFixed(4) + ', ' + lng.toFixed(4));
    } catch (e) {
      return lat.toFixed(4) + ', ' + lng.toFixed(4);
    }
  }

  async function fetchRoute() {
    if (st.waypoints.length < 2) {
      st.routeCoords = [];
      st.routeSegments = [];
      drawRoute();
      return;
    }

    var type = st.transportType;
    var wps = st.waypoints.filter(function (w) { return w.lat || w.lng; });

    if (type === 'car' || type === 'train') {
      try {
        var coords = wps.map(function (w) { return w.lng + ',' + w.lat; }).join(';');
        var url = 'https://router.project-osrm.org/route/v1/driving/' + coords + '?overview=full&geometries=geojson';
        var resp = await fetch(url);
        var data = await resp.json();
        if (data.code === 'Ok' && data.routes && data.routes.length) {
          st.routeCoords = data.routes[0].geometry.coordinates.map(function (c) { return { lat: c[1], lng: c[0] }; });
          st.routeSegments = buildSegmentBounds(st.routeCoords, wps);
        } else {
          var fb = buildFallbackRoute(wps);
          st.routeCoords = fb.coords;
          st.routeSegments = fb.segments;
        }
      } catch (e) {
        var fb2 = buildFallbackRoute(wps);
        st.routeCoords = fb2.coords;
        st.routeSegments = fb2.segments;
      }
    } else {
      var fb3 = buildFallbackRoute(wps);
      st.routeCoords = fb3.coords;
      st.routeSegments = fb3.segments;
    }

    drawRoute();
  }

  function buildFallbackRoute(wps) {
    if (!wps) wps = st.waypoints.filter(function (w) { return w.lat || w.lng; });
    var pts = [];
    var segs = [];
    for (var i = 0; i < wps.length - 1; i++) {
      var seg = greatCirclePoints(wps[i], wps[i + 1], 80);
      if (i > 0) seg.shift();
      var startIdx = pts.length;
      pts = pts.concat(seg);
      segs.push({ start: startIdx, end: pts.length - 1, color: getSegmentColor(i) });
    }
    return { coords: pts, segments: segs };
  }

  function buildSegmentBounds(coords, wps) {
    var segs = [];
    if (wps.length < 2) return segs;
    var dists = [0];
    for (var i = 1; i < coords.length; i++) {
      dists.push(dists[i - 1] + haversine(coords[i - 1], coords[i]));
    }
    var total = dists[dists.length - 1];
    var wpDists = [];
    for (var w = 0; w < wps.length; w++) {
      var bestIdx = 0;
      var bestDist = Infinity;
      for (var c = 0; c < coords.length; c++) {
        var d = haversine(wps[w], coords[c]);
        if (d < bestDist) { bestDist = d; bestIdx = c; }
      }
      wpDists.push(bestIdx);
    }
    for (var s = 0; s < wpDists.length - 1; s++) {
      segs.push({
        start: wpDists[s],
        end: Math.min(wpDists[s + 1], coords.length - 1),
        color: getSegmentColor(s)
      });
    }
    return segs;
  }

  function addWaypoint(lat, lng, name) {
    st.waypoints.push({ lat: lat || 0, lng: lng || 0, name: name || '' });
    renderWaypointList();
    if (st.map) {
      updateWaypointMarkers();
      fetchRoute();
    }
  }

  function removeWaypoint(idx) {
    if (st.waypoints.length <= 2) return;
    st.waypoints.splice(idx, 1);
    renderWaypointList();
    if (st.map) {
      updateWaypointMarkers();
      fetchRoute();
    }
  }

  function updateWaypoint(idx, lat, lng, name) {
    st.waypoints[idx] = { lat: lat, lng: lng, name: name || st.waypoints[idx].name };
    if (st.map) {
      updateWaypointMarkers();
      fetchRoute();
    }
  }

  function renderWaypointList() {
    var list = $('#mapWaypointsList');
    if (!list) return;
    list.innerHTML = '';

    st.waypoints.forEach(function (wp, i) {
      var item = document.createElement('div');
      item.className = 'map-wp-item';

      var num = document.createElement('span');
      num.className = 'map-wp-num';
      num.textContent = i + 1;

      var segColor = document.createElement('input');
      segColor.type = 'color';
      segColor.className = 'control-color map-wp-color';
      segColor.value = getSegmentColor(i);
      (function (index, inp) {
        inp.addEventListener('input', function () {
          st.segmentColors[index] = inp.value;
          if (st.map) drawRoute();
        });
      })(i, segColor);

      var inputWrap = document.createElement('div');
      inputWrap.className = 'map-wp-input-wrap';

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'control-input map-wp-input';
      input.value = wp.name;
      input.placeholder = i === 0 ? 'Start...' : i === st.waypoints.length - 1 ? 'Cel...' : 'Przez...';

      var dropdown = document.createElement('div');
      dropdown.className = 'map-wp-dropdown';

      input.addEventListener('focus', function () {
        st.activeInputIdx = i;
      });

      input.addEventListener('blur', function () {
        setTimeout(function () {
          if (st.activeInputIdx === i) st.activeInputIdx = -1;
          dropdown.classList.remove('active');
        }, 250);
      });

      input.addEventListener('input', debounce(async function () {
        var val = input.value;
        var results = await geocodeSearch(val);
        dropdown.innerHTML = '';
        if (!results.length) { dropdown.classList.remove('active'); return; }
        results.forEach(function (r) {
          var opt = document.createElement('div');
          opt.className = 'map-wp-option';
          var shortName = r.display_name.split(',').slice(0, 2).join(',');
          opt.textContent = shortName;
          opt.title = r.display_name;
          (function (result, index) {
            opt.addEventListener('mousedown', function (e) {
              e.preventDefault();
              var lat = parseFloat(result.lat);
              var lng = parseFloat(result.lon);
              updateWaypoint(index, lat, lng, result.display_name.split(',')[0]);
              input.value = result.display_name.split(',')[0];
              dropdown.classList.remove('active');
            });
          })(r, i);
          dropdown.appendChild(opt);
        });
        dropdown.classList.add('active');
      }, 350));

      inputWrap.appendChild(input);
      inputWrap.appendChild(dropdown);

      var del = document.createElement('button');
      del.className = 'map-wp-del';
      del.innerHTML = '&times;';
      del.title = 'Usuń punkt';
      (function (index) {
        del.addEventListener('click', function () { removeWaypoint(index); });
      })(i);

      item.appendChild(num);
      item.appendChild(segColor);
      item.appendChild(inputWrap);
      item.appendChild(del);
      list.appendChild(item);
    });
  }

  function updateWaypointMarkers() {
    st.waypointMarkers.forEach(function (m) { m.remove(); });
    st.waypointMarkers = [];

    st.waypoints.forEach(function (wp, i) {
      if (!wp.lat && !wp.lng) return;
      var marker = L.marker([wp.lat, wp.lng], {
        draggable: true,
        icon: L.divIcon({
          html: '<div class="map-wp-marker"><span>' + (i + 1) + '</span></div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          className: 'map-wp-marker-wrapper'
        })
      }).addTo(st.map);

      (function (index) {
        marker.on('dragend', function () {
          var pos = marker.getLatLng();
          st.waypoints[index].lat = pos.lat;
          st.waypoints[index].lng = pos.lng;
          updateWaypointMarkers();
          fetchRoute();
          renderWaypointList();
        });
      })(i);

      st.waypointMarkers.push(marker);
    });
  }

  function drawRoute() {
    st.routeLines.forEach(function (l) { st.map.removeLayer(l); });
    st.routeLines = [];
    if (st.trailLine) { st.map.removeLayer(st.trailLine); st.trailLine = null; }
    if (st.vehicleMarker) { st.map.removeLayer(st.vehicleMarker); st.vehicleMarker = null; }
    st.labelMarkers.forEach(function (m) { st.map.removeLayer(m); });
    st.labelMarkers = [];

    if (st.routeCoords.length < 2) return;

    var useMultiColor = st.routeSegments.length > 1;

    if (useMultiColor) {
      st.routeSegments.forEach(function (seg) {
        var pts = [];
        for (var i = seg.start; i <= seg.end; i++) {
          pts.push([st.routeCoords[i].lat, st.routeCoords[i].lng]);
        }
        if (pts.length >= 2) {
          var line = L.polyline(pts, {
            color: seg.color, weight: st.routeWidth, opacity: 0.35, dashArray: '8 4'
          }).addTo(st.map);
          st.routeLines.push(line);
        }
      });
    } else {
      var line = L.polyline(
        st.routeCoords.map(function (p) { return [p.lat, p.lng]; }),
        { color: st.routeColor, weight: st.routeWidth, opacity: 0.35, dashArray: '8 4' }
      ).addTo(st.map);
      st.routeLines.push(line);
    }

    st.trailLine = L.polyline([], {
      color: st.routeColor, weight: st.routeWidth, opacity: 0.9
    }).addTo(st.map);

    var iconHtml;
    if (st.customVehiclePng) {
      iconHtml = '<div class="vehicle-rot"><img src="' + st.customVehiclePng + '" style="width:' + st.vehicleSize + 'px;height:' + st.vehicleSize + 'px"></div>';
    } else {
      iconHtml = '<div class="vehicle-rot">' + vehicleSvg(st.transportType, st.routeColor) + '</div>';
    }

    st.vehicleMarker = L.marker([st.routeCoords[0].lat, st.routeCoords[0].lng], {
      icon: L.divIcon({
        html: iconHtml,
        iconSize: [st.vehicleSize, st.vehicleSize],
        iconAnchor: [st.vehicleSize / 2, st.vehicleSize / 2],
        className: 'map-vehicle-icon'
      }),
      zIndexOffset: 1000
    }).addTo(st.map);

    drawCityLabels();

    fitMapToRoute();
  }

  function drawCityLabels() {
    st.labelMarkers.forEach(function (m) { st.map.removeLayer(m); });
    st.labelMarkers = [];

    if (!st.showLabels) return;

    st.waypoints.forEach(function (wp, i) {
      if (!wp.lat || !wp.lng || !wp.name) return;
      var isStart = i === 0;
      var isEnd = i === st.waypoints.length - 1;
      if (!isStart && !isEnd) return;

      var labelColor = isStart ? '#22c55e' : '#f43f5e';
      var label = L.marker([wp.lat, wp.lng], {
        icon: L.divIcon({
          html: '<div class="map-city-label" style="--lc:' + labelColor + '">' + wp.name + '</div>',
          iconSize: [0, 0],
          iconAnchor: [0, -20],
          className: 'map-city-label-wrapper'
        }),
        zIndexOffset: 900
      }).addTo(st.map);
      st.labelMarkers.push(label);
    });
  }

  function fitMapToRoute() {
    if (!st.map || st.routeCoords.length < 2) return;
    var bounds = L.latLngBounds(st.routeCoords.map(function (p) { return [p.lat, p.lng]; }));
    st.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }

  function onMapClick(e) {
    if (st.animating) return;
    if (!st.map) return;

    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    if (st.activeInputIdx >= 0 && st.activeInputIdx < st.waypoints.length) {
      var idx = st.activeInputIdx;
      reverseGeocode(lat, lng).then(function (name) {
        updateWaypoint(idx, lat, lng, name.split(',')[0]);
        renderWaypointList();
      });
    } else {
      var emptyIdx = st.waypoints.findIndex(function (w) { return !w.lat && !w.lng; });
      if (emptyIdx >= 0) {
        reverseGeocode(lat, lng).then(function (name) {
          updateWaypoint(emptyIdx, lat, lng, name.split(',')[0]);
          renderWaypointList();
        });
      } else {
        addWaypoint(lat, lng, '');
        reverseGeocode(lat, lng).then(function (name) {
          st.waypoints[st.waypoints.length - 1].name = name.split(',')[0];
          renderWaypointList();
        });
      }
    }
  }

  function computeLegFractions(coords, segments, numLegs) {
    var cumDist = [0];
    for (var i = 1; i < coords.length; i++) {
      cumDist.push(cumDist[i - 1] + haversine(coords[i - 1], coords[i]));
    }
    var totalDist = cumDist[cumDist.length - 1] || 1;
    var starts = [];
    var ends = [];
    if (segments.length >= numLegs) {
      for (var si = 0; si < numLegs; si++) {
        starts.push(cumDist[segments[si].start] / totalDist);
        if (si < numLegs - 1) {
          ends.push(cumDist[segments[si + 1].start] / totalDist);
        } else {
          ends.push(1);
        }
      }
    } else {
      starts = [0];
      ends = [1];
    }
    return { starts: starts, ends: ends };
  }

  function startAnimation() {
    if (st.routeCoords.length < 2) return;
    if (st.animating) stopAnimation();

    st.animating = true;
    st.animStartTime = performance.now();
    var coords = st.routeCoords;
    var useMultiColor = st.routeSegments.length > 1;

    var wps = st.waypoints.filter(function (w) { return w.lat || w.lng; });
    var numLegs = Math.max(wps.length - 1, 1);
    var numPauses = Math.max(0, numLegs - 1);
    var checkpointPauseMs = 400;
    var totalPauseMs = numPauses * checkpointPauseMs;
    var totalDurationMs = st.animDuration * 1000;
    var moveBudget = totalDurationMs - totalPauseMs;
    if (moveBudget < totalDurationMs * 0.5) moveBudget = totalDurationMs * 0.5;
    var legMoveMs = moveBudget / numLegs;

    var frac = computeLegFractions(coords, st.routeSegments, numLegs);
    var legTStart = frac.starts;
    var legTEnd = frac.ends;
    numLegs = legTStart.length;

    var trailLines = [];
    if (useMultiColor) {
      st.routeSegments.forEach(function (seg, si) {
        trailLines.push(L.polyline([], {
          color: seg.color, weight: st.routeWidth, opacity: 0.9
        }).addTo(st.map));
      });
    } else {
      trailLines.push(L.polyline([], {
        color: st.routeColor, weight: st.routeWidth, opacity: 0.9
      }).addTo(st.map));
    }

    function getT(elapsed) {
      if (elapsed <= 0) return legTStart[0];
      var time = elapsed;
      for (var leg = 0; leg < numLegs; leg++) {
        if (time <= legMoveMs) {
          var localT = time / legMoveMs;
          if (st.easing) localT = easeInOut(localT);
          return legTStart[leg] + (legTEnd[leg] - legTStart[leg]) * localT;
        }
        time -= legMoveMs;
        if (leg < numPauses) {
          if (time <= checkpointPauseMs) {
            return legTEnd[leg];
          }
          time -= checkpointPauseMs;
        }
      }
      return 1;
    }

      var smoothCam = { lat: coords[0].lat, lng: coords[0].lng, heading: 0 };
      var cachedVehicleInner = null;
      var noRotate = st.transportType === 'train';

      function frame(now) {
        var elapsed = now - st.animStartTime;
        var rawT = Math.min(elapsed / totalDurationMs, 1);
        var t = getT(Math.min(elapsed, totalDurationMs));
        t = Math.max(0, Math.min(1, t));
        var pos = interpolatePath(coords, t);

        smoothCam.heading = lerpAngle(smoothCam.heading, pos.heading, 0.15);

        if (st.vehicleMarker) {
          st.vehicleMarker.setLatLng([pos.lat, pos.lng]);
          if (!cachedVehicleInner) {
            var el = st.vehicleMarker.getElement();
            if (el) cachedVehicleInner = el.querySelector('.vehicle-rot');
          }
          if (cachedVehicleInner) {
            cachedVehicleInner.style.transform = 'rotate(' + (noRotate ? 0 : smoothCam.heading) + 'deg)';
          }
        }

        var steps = 60;
        var cachedDists = buildCumulativeDists(coords);
        trailLines.forEach(function (tl, si) {
          var segStart = legTStart[si] || 0;
          var segEnd = legTEnd[si] != null ? legTEnd[si] : 1;
          var effEnd = Math.min(t, segEnd);
          if (effEnd <= segStart) { tl.setLatLngs([]); return; }
          var pts = [];
          for (var k = 0; k <= steps; k++) {
            var tt = segStart + (k / steps) * (effEnd - segStart);
            var p = interpolatePath(coords, tt, cachedDists);
            pts.push([p.lat, p.lng]);
          }
          tl.setLatLngs(pts);
        });

        if (st.cameraMode === 'follow' && st.map) {
          smoothCam.lat += (pos.lat - smoothCam.lat) * 0.12;
          smoothCam.lng += (pos.lng - smoothCam.lng) * 0.12;
          st.map.setView([smoothCam.lat, smoothCam.lng], st.zoom, { animate: false });
        }

      if (rawT < 1) {
        st.animRaf = requestAnimationFrame(frame);
      } else {
        st.animating = false;
        trailLines.forEach(function (tl) { st.map.removeLayer(tl); });
        var btn = $('#mapPlayBtn');
        if (btn) btn.querySelector('span').textContent = 'Podgl\u0105d';
      }
    }

    st.animRaf = requestAnimationFrame(frame);
    var btn = $('#mapPlayBtn');
    if (btn) btn.querySelector('span').textContent = 'Gram...';
  }

  function stopAnimation() {
    if (st.animRaf) cancelAnimationFrame(st.animRaf);
    st.animating = false;
    st.animRaf = null;

    var btn = $('#mapPlayBtn');
    if (btn) btn.querySelector('span').textContent = 'Podgl\u0105d';

    if (st.trailLine) st.trailLine.setLatLngs([]);
    if (st.vehicleMarker && st.routeCoords.length) {
      st.vehicleMarker.setLatLng([st.routeCoords[0].lat, st.routeCoords[0].lng]);
      var el = st.vehicleMarker.getElement();
      if (el) {
        var inner = el.querySelector('.vehicle-rot');
        if (inner) inner.style.transform = 'rotate(0deg)';
      }
    }
    if (st.map && st.routeCoords.length >= 2) fitMapToRoute();
  }

  function updateMapPreviewSize() {
    var area = $('[data-tool="map"] .preview-area');
    var wrapper = $('#mapPreviewWrapper');
    if (!area || !wrapper) return;

    var res = getResolution();
    var w = res[0], h = res[1];
    var aw = area.clientWidth;
    var ah = area.clientHeight;
    var scale = Math.min(aw / w, ah / h, 1);
    var pw = Math.round(w * scale);
    var ph = Math.round(h * scale);

    wrapper.style.width = pw + 'px';
    wrapper.style.height = ph + 'px';

    if (st.map) {
      setTimeout(function () { st.map.invalidateSize(); }, 50);
    }

    var info = $('#mapResolutionInfo');
    if (info) info.textContent = w + ' \u00d7 ' + h;
  }

  function buildOffscreenHtml(opts) {
    var mathJs = [
      'var _d2r=function(d){return d*Math.PI/180};',
      'var _r2d=function(r){return r*180/Math.PI};',
      'var _hav=function(a,b){var R=6371e3,dL=_d2r(b.lat-a.lat),dG=_d2r(b.lng-a.lng),x=Math.pow(Math.sin(dL/2),2)+Math.cos(_d2r(a.lat))*Math.cos(_d2r(b.lat))*Math.pow(Math.sin(dG/2),2);return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))};',
      'var _brg=function(f,t){var dG=_d2r(t.lng-f.lng),y=Math.sin(dG)*Math.cos(_d2r(t.lat)),x=Math.cos(_d2r(f.lat))*Math.sin(_d2r(t.lat))-Math.sin(_d2r(f.lat))*Math.cos(_d2r(t.lat))*Math.cos(dG);return(_r2d(Math.atan2(y,x))+360)%360};',
      'var _buildDs=function(pts){var ds=[0];for(var i=1;i<pts.length;i++)ds.push(ds[i-1]+_hav(pts[i-1],pts[i]));return ds};',
      'var _bsearch=function(ds,tgt){var lo=1,hi=ds.length-1;while(lo<hi){var mid=(lo+hi)>>>1;if(ds[mid]<tgt)lo=mid+1;else hi=mid}return lo};',
      'var _interp=function(pts,t,_cd){',
      'if(!pts.length)return{lat:0,lng:0,heading:0};',
      'if(pts.length===1||t<=0)return{lat:pts[0].lat,lng:pts[0].lng,heading:pts.length>1?_brg(pts[0],pts[1]):0};',
      'if(t>=1)return{lat:pts[pts.length-1].lat,lng:pts[pts.length-1].lng,heading:_brg(pts[pts.length-2],pts[pts.length-1])};',
      'var ds=_cd||_buildDs(pts);var tot=ds[ds.length-1];if(tot===0)return{lat:pts[0].lat,lng:pts[0].lng,heading:0};',
      'var tgt=t*tot;var j=_bsearch(ds,tgt);var s=ds[j]-ds[j-1],f=s>0?(tgt-ds[j-1])/s:0;',
      'var _lat=pts[j-1].lat+(pts[j].lat-pts[j-1].lat)*f,_lng=pts[j-1].lng+(pts[j].lng-pts[j-1].lng)*f;',
      'var _lk=Math.max(1,Math.round(pts.length*0.03)),_ib=Math.max(0,j-_lk),_if=Math.min(pts.length-1,j+_lk);',
      'while(_ib<_if&&_hav(pts[_ib],pts[_if])<50){_lk++;_ib=Math.max(0,j-_lk);_if=Math.min(pts.length-1,j+_lk)}',
      'return{lat:_lat,lng:_lng,heading:_brg(pts[_ib],pts[_if])}};',
      'var _ease=function(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};'
    ].join('\n');

    var routeJson = JSON.stringify(opts.routeCoords);
    var routeLL = JSON.stringify(opts.routeCoords.map(function (p) { return [p.lat, p.lng]; }));
    var tileUrlEsc = JSON.stringify(opts.tileUrl);
    var vehicleHtmlEsc = JSON.stringify(opts.vehicleHtml);
    var segmentsJson = JSON.stringify(opts.segments);
    var multiColor = opts.segments && opts.segments.length > 1;

    var segmentLineCode = '';
    if (multiColor) {
      segmentLineCode = 'var _segs=' + segmentsJson + ';var _slines=[];' +
        '_segs.forEach(function(seg){var pts=[];for(var i=seg.start;i<=seg.end;i++)pts.push(_rl[i]);' +
        '_slines.push(L.polyline(pts,{color:seg.color,weight:' + opts.routeWidth + ',opacity:0.35,dashArray:"8 4"}).addTo(_map))});';
    } else {
      segmentLineCode = 'var _rline=L.polyline(_rl,{color:' + JSON.stringify(opts.routeColor) + ',weight:' + opts.routeWidth + ',opacity:0.35,dashArray:"8 4"}).addTo(_map);';
    }

    var trailCode;
    if (multiColor) {
      trailCode = 'var _tlines=[];_segs.forEach(function(seg){' +
        '_tlines.push(L.polyline([],{color:seg.color,weight:' + opts.routeWidth + ',opacity:0.9}).addTo(_map))});';
    } else {
      trailCode = 'var _tlines=[L.polyline([],{color:' + JSON.stringify(opts.routeColor) + ',weight:' + opts.routeWidth + ',opacity:0.9}).addTo(_map)];';
    }

    var boundsCode = multiColor
      ? 'var allPts=[];_segs.forEach(function(seg){for(var i=seg.start;i<=seg.end;i++)allPts.push(_rl[i])});' +
        'var _rbounds=L.latLngBounds(allPts);_map.fitBounds(_rbounds,{padding:[50,50],maxZoom:14});'
      : 'var _rbounds=_rline.getBounds();_map.fitBounds(_rbounds,{padding:[50,50],maxZoom:14});';

    var legFracs = computeLegFractions(opts.routeCoords, opts.segments || [],
      opts.segments.length > 0 ? opts.segments.length : 1);
    var legS = JSON.stringify(legFracs.starts);
    var legE = JSON.stringify(legFracs.ends);

    var noRotate = opts.transportType === 'train';
    var updateFrameCode = 'var _legS=' + legS + ',_legE=' + legE + ';' +
      'var _cam={lat:_rc[0].lat,lng:_rc[0].lng};' +
      'var _noRot=' + JSON.stringify(noRotate) + ';' +
      'window._updateFrame=function(t,cm,z){' +
      'var _cd=_buildDs(_rc);' +
      'var p=_interp(_rc,t,_cd);' +
      '_vm.setLatLng([p.lat,p.lng]);' +
      'var el=_vm.getElement();' +
      'if(el){var inn=el.querySelector(".vehicle-rot");if(inn)inn.style.transform="rotate("+(_noRot?0:p.heading)+"deg)"}' +
      '_tlines.forEach(function(tl,si){' +
      'var s0=_legS[si]||0,s1=_legE[si]!=null?_legE[si]:1;' +
      'var eEnd=Math.min(t,s1);if(eEnd<=s0){tl.setLatLngs([]);return}' +
      'var pts=[];for(var k=0;k<=60;k++){var tt=s0+(k/60)*(eEnd-s0);var q=_interp(_rc,tt,_cd);pts.push([q.lat,q.lng])}' +
      'tl.setLatLngs(pts)});' +
      'if(cm==="follow"){_cam.lat+=(p.lat-_cam.lat)*0.1;_cam.lng+=(p.lng-_cam.lng)*0.1;' +
      '_map.setView([_cam.lat,_cam.lng],z,{animate:false})}' +
      'else if(cm==="overview"){_map.fitBounds(_rbounds,{padding:[50,50],maxZoom:z,animate:false})}};';

    var labelsCode = '';
    if (opts.labels && opts.labels.length) {
      labelsCode = opts.labels.map(function (lb) {
        return 'L.marker([' + lb.lat + ',' + lb.lng + '],{icon:L.divIcon({html:\'' +
          '<div class="map-city-label" style="--lc:' + lb.color + '">' + lb.name.replace(/'/g, "\\'") + '</div>\',' +
          'iconSize:[0,0],iconAnchor:[0,-20],className:"map-city-label-wrapper"}),zIndexOffset:900}).addTo(_map);';
      }).join('');
    }

    return '<!DOCTYPE html><html><head><meta charset="UTF-8">\n' +
      '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">\n' +
      '<style>\n' +
      '*{margin:0;padding:0;box-sizing:border-box}\n' +
      'html,body,#map{width:' + opts.width + 'px;height:' + opts.height + 'px;overflow:hidden;background:#000}\n' +
      '.leaflet-control-attribution,.leaflet-control-zoom{display:none!important}\n' +
      '.map-vehicle-icon{background:none!important;border:none!important}\n' +
      '.map-city-label-wrapper{background:none!important;border:none!important}\n' +
      '.map-city-label{color:#fff;font-size:13px;font-weight:700;font-family:system-ui,sans-serif;white-space:nowrap;text-shadow:0 0 8px var(--lc),0 0 20px var(--lc),0 1px 3px rgba(0,0,0,0.8);pointer-events:none}\n' +
      '</style>\n' +
      '</head><body>\n' +
      '<div id="map"></div>\n' +
      '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>\n' +
      '<script>\n' +
      mathJs + '\n' +
      'var _rc=' + routeJson + ';\n' +
      'var _rl=' + routeLL + ';\n' +
      'var _map=L.map("map",{zoomControl:false,attributionControl:false}).setView([0,0],3);\n' +
      'L.tileLayer(' + tileUrlEsc + ',{maxZoom:19}).addTo(_map);\n' +
      segmentLineCode + '\n' +
      trailCode + '\n' +
      boundsCode + '\n' +
      'var _vhtml=' + vehicleHtmlEsc + ';\n' +
      'var _vs=' + opts.vehicleSize + ';\n' +
      'var _vi=L.divIcon({html:_vhtml,iconSize:[_vs,_vs],iconAnchor:[_vs/2,_vs/2],className:"map-vehicle-icon"});\n' +
      'var _vm=L.marker([0,0],{icon:_vi,zIndexOffset:1000}).addTo(_map);\n' +
      labelsCode + '\n' +
      updateFrameCode + '\n' +
      'window._waitTiles=function(){\n' +
      '  return new Promise(function(resolve){\n' +
      '    var tries=0;\n' +
      '    function check(){tries++;var ts=document.querySelectorAll(".leaflet-tile");var ok=true;\n' +
      '    ts.forEach(function(t){if(!t.complete)ok=false});\n' +
      '    if(ok||tries>30)resolve();else setTimeout(check,200)}\n' +
      '    setTimeout(check,500)\n' +
      '  })\n' +
      '};\n' +
      '<\/script>\n' +
      '</body></html>';
  }

  async function exportMp4() {
    if (st.routeCoords.length < 2 || st.animating) return;

    var savePath = await ipcRenderer.invoke('save-dialog', {
      defaultName: 'map-travel-' + Date.now() + '.mp4',
      filters: [{ name: 'MP4', extensions: ['mp4'] }]
    });
    if (!savePath) return;

    var res = getResolution();
    var w = res[0], h = res[1];
    var fps = 30;
    var totalFrames = Math.round(st.animDuration * fps);
    var checkpointPauseMs = 400;

    var setExporting = function (active, label, pct) {
      var prog = $('#mapExportProgress');
      if (!prog) return;
      prog.classList.toggle('active', active);
      if (label) $('#mapExportLabel').textContent = label;
      if (pct !== undefined) $('#mapExportBarFill').style.width = pct + '%';
      if (!active) $('#mapExportBarFill').style.width = '0%';
    };

    setExporting(true, 'Przygotowuję map\u0119...', 0);

    var iconHtml;
    if (st.customVehiclePng) {
      iconHtml = '<div class="vehicle-rot"><img src="' + st.customVehiclePng + '" style="width:' + st.vehicleSize + 'px;height:' + st.vehicleSize + 'px"></div>';
    } else {
      iconHtml = '<div class="vehicle-rot">' + vehicleSvg(st.transportType, st.routeColor) + '</div>';
    }

    var labels = [];
    if (st.showLabels) {
      st.waypoints.forEach(function (wp, i) {
        if (!wp.lat || !wp.lng || !wp.name) return;
        if (i === 0) labels.push({ lat: wp.lat, lng: wp.lng, name: wp.name, color: '#22c55e' });
        else if (i === st.waypoints.length - 1) labels.push({ lat: wp.lat, lng: wp.lng, name: wp.name, color: '#f43f5e' });
      });
    }

    var html = buildOffscreenHtml({
      width: w, height: h,
      tileUrl: MAP_TILES[st.mapStyle],
      routeCoords: st.routeCoords,
      routeColor: st.routeColor,
      routeWidth: st.routeWidth,
      vehicleHtml: iconHtml,
      vehicleSize: st.vehicleSize,
      segments: st.routeSegments,
      labels: labels,
      transportType: st.transportType
    });

    await ipcRenderer.invoke('bg-load-html', { html: html, width: w, height: h });

    setExporting(true, '\u0141adowanie mapy...', 5);
    await ipcRenderer.invoke('bg-eval', 'window._waitTiles()');

    if (st.cameraMode === 'overview') {
      await ipcRenderer.invoke('bg-eval',
        '_map.fitBounds(_rbounds,{padding:[50,50],maxZoom:' + st.zoom + ',animate:false});' +
        'new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})})'
      );
    }

    setExporting(true, 'Renderowanie klatek...', 10);

    var wps = st.waypoints.filter(function (w) { return w.lat || w.lng; });
    var numLegs = Math.max(wps.length - 1, 1);
    var exportFrac = computeLegFractions(st.routeCoords, st.routeSegments, numLegs);
    var wpTPositions = exportFrac.starts.concat([exportFrac.ends[exportFrac.ends.length - 1]]);
    if (wpTPositions.length < 2) wpTPositions = [0, 1];

    var numSegments = wpTPositions.length - 1;
    var checkpointFrames = Math.round((checkpointPauseMs / 1000) * fps);
    var totalCheckpointFrames = Math.max(0, numSegments - 1) * checkpointFrames;
    var moveFrames = Math.max(totalFrames - totalCheckpointFrames, fps);
    var framesPerSegment = Math.round(moveFrames / numSegments);

    var frames = [];
    var batchItems = [];
    var batchMeta = [];
    var batchSize = 10;

    for (var seg = 0; seg < numSegments; seg++) {
      var tStart = wpTPositions[seg];
      var tEnd = wpTPositions[seg + 1];
      for (var f = 0; f < framesPerSegment; f++) {
        var rawSegT = framesPerSegment === 1 ? 0 : f / (framesPerSegment - 1);
        var segT = st.easing ? easeInOut(rawSegT) : rawSegT;
        var globalT = tStart + (tEnd - tStart) * segT;
        batchItems.push({ js: 'window._updateFrame(' + globalT + ',"' + st.cameraMode + '",' + st.zoom + ')', delay: 30 });
        batchMeta.push({ checkpoint: false });

        if (batchItems.length >= batchSize) {
          var batchData = await ipcRenderer.invoke('bg-eval-capture-batch', { frames: batchItems });
          for (var b = 0; b < batchData.length; b++) {
            frames.push({ data: batchData[b], duration: 1 });
          }
          batchItems = [];
          batchMeta = [];
          var doneFrames = frames.length;
          var pct = 10 + Math.round((doneFrames / (totalFrames + totalCheckpointFrames)) * 70);
          setExporting(true, 'Klatka ' + doneFrames, pct);
        }
      }

      if (seg < numSegments - 1 && frames.length > 0) {
        for (var cp = 0; cp < checkpointFrames; cp++) {
          frames.push({ data: frames[frames.length - 1].data, duration: 1 });
        }
      }
    }

    if (batchItems.length > 0) {
      var batchData = await ipcRenderer.invoke('bg-eval-capture-batch', { frames: batchItems });
      for (var b = 0; b < batchData.length; b++) {
        frames.push({ data: batchData[b], duration: 1 });
      }
    }

    frames.push({ data: frames[frames.length - 1].data, duration: Math.round(fps * 1.5) });

    setExporting(true, 'Koduj\u0119 MP4...', 90);
    await ipcRenderer.invoke('export-mp4', { frames: frames, savePath: savePath, fps: fps, width: w, height: h });
    await ipcRenderer.invoke('bg-cleanup');

    setExporting(false);
  }

  function initLeaflet() {
    var container = $('#mapContainer');
    if (!container || st.map) return;

    st.map = L.map(container, {
      center: [50, 15],
      zoom: 4,
      zoomControl: false,
      attributionControl: false
    });

    st.tileLayer = L.tileLayer(MAP_TILES[st.mapStyle], { maxZoom: 19 }).addTo(st.map);
    st.map.on('click', onMapClick);

    addWaypoint(52.2297, 21.0122, 'Warszawa');
    addWaypoint(48.8566, 2.3522, 'Pary\u017c');
  }

  function updateVehiclePreview() {
    var preview = $('#mapVehiclePreview');
    if (!preview) return;
    if (st.customVehiclePng) {
      preview.innerHTML = '<img src="' + st.customVehiclePng + '" style="width:32px;height:32px">';
    } else {
      preview.innerHTML = vehicleSvg(st.transportType, st.routeColor);
    }
  }

  function bindControls() {
    $$('#mapStyleGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#mapStyleGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.mapStyle = btn.dataset.style;
        if (st.tileLayer && st.map) {
          st.map.removeLayer(st.tileLayer);
          st.tileLayer = L.tileLayer(MAP_TILES[st.mapStyle], { maxZoom: 19 }).addTo(st.map);
        }
      });
    });

    $$('#mapTransportGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#mapTransportGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.transportType = btn.dataset.transport;
        updateVehiclePreview();
        if (st.map) fetchRoute();
      });
    });

    $('#mapAddWaypoint').addEventListener('click', function () {
      addWaypoint(0, 0, '');
      setTimeout(function () {
        var inputs = $$('.map-wp-input');
        if (inputs.length) inputs[inputs.length - 1].focus();
      }, 50);
    });

    $('#mapRouteColor').addEventListener('input', function (e) {
      st.routeColor = e.target.value;
      if (st.map) drawRoute();
      updateVehiclePreview();
    });

    $('#mapRouteWidth').addEventListener('input', function (e) {
      st.routeWidth = parseInt(e.target.value);
      $('#mapRouteWidthVal').textContent = st.routeWidth;
      if (st.map) drawRoute();
    });

    $$('#mapCameraGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#mapCameraGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.cameraMode = btn.dataset.camera;
      });
    });

    $('#mapDuration').addEventListener('input', function (e) {
      st.animDuration = parseFloat(e.target.value);
      $('#mapDurationVal').textContent = st.animDuration + 's';
    });

    $('#mapZoom').addEventListener('input', function (e) {
      st.zoom = parseInt(e.target.value);
      $('#mapZoomVal').textContent = st.zoom;
    });

    $$('#mapFormatGroup .control-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#mapFormatGroup .control-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        st.format = btn.dataset.format;
        updateMapPreviewSize();
      });
    });

    $('#mapResolutionSelect').addEventListener('change', function (e) {
      st.resolution = e.target.value;
      updateMapPreviewSize();
    });

    $('#mapPlayBtn').addEventListener('click', function () {
      if (st.animating) stopAnimation();
      else startAnimation();
    });

    $('#mapStopBtn').addEventListener('click', function () {
      stopAnimation();
    });

    $('#mapExportBtn').addEventListener('click', function () {
      exportMp4();
    });

    $('#mapVehicleFile').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        st.customVehiclePng = ev.target.result;
        $('#mapVehicleClear').style.display = '';
        updateVehiclePreview();
        if (st.map) drawRoute();
      };
      reader.readAsDataURL(file);
    });

    $('#mapVehicleClear').addEventListener('click', function () {
      st.customVehiclePng = null;
      $('#mapVehicleFile').value = '';
      $('#mapVehicleClear').style.display = 'none';
      updateVehiclePreview();
      if (st.map) drawRoute();
    });

    $('#mapEasingToggle').addEventListener('change', function (e) {
      st.easing = e.target.checked;
    });

    $('#mapLabelsToggle').addEventListener('change', function (e) {
      st.showLabels = e.target.checked;
      if (st.map) drawCityLabels();
    });

    updateVehiclePreview();
  }

  window.initMapTool = function () {
    bindControls();
    renderWaypointList();
  };

  window.mapActivate = function () {
    if (!st.map) {
      initLeaflet();
    }
    setTimeout(function () {
      updateMapPreviewSize();
      if (st.map) st.map.invalidateSize();
    }, 100);
  };

  window.mapUpdatePreviewSize = function () {
    updateMapPreviewSize();
  };
})();
