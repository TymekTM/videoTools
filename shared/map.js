(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MapCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function d2r(value) {
    return value * Math.PI / 180;
  }

  function haversine(a, b) {
    var dLat = d2r(b.lat - a.lat);
    var dLng = d2r(b.lng - a.lng);
    var lat1 = d2r(a.lat);
    var lat2 = d2r(b.lat);
    var sinLat = Math.sin(dLat / 2);
    var sinLng = Math.sin(dLng / 2);
    var value = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
    return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  }

  function buildSegmentBounds(coords, waypoints, colors) {
    var segments = [];
    if (!Array.isArray(coords) || !Array.isArray(waypoints) || waypoints.length < 2) {
      return segments;
    }

    var waypointIndexes = waypoints.map(function (waypoint) {
      var bestIndex = 0;
      var bestDistance = Infinity;
      for (var i = 0; i < coords.length; i++) {
        var distance = haversine(waypoint, coords[i]);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = i;
        }
      }
      return bestIndex;
    });

    for (var index = 0; index < waypointIndexes.length - 1; index++) {
      var segment = {
        start: waypointIndexes[index],
        end: Math.min(waypointIndexes[index + 1], coords.length - 1)
      };
      if (Array.isArray(colors) && colors.length) {
        segment.color = colors[index % colors.length];
      }
      segments.push(segment);
    }
    return segments;
  }

  function computeLegFractions(coords, segments, legCount) {
    var cumulative = [0];
    for (var i = 1; i < coords.length; i++) {
      cumulative.push(cumulative[i - 1] + haversine(coords[i - 1], coords[i]));
    }

    var totalDistance = cumulative[cumulative.length - 1] || 1;
    var starts = [];
    var ends = [];
    if (segments.length >= legCount) {
      for (var leg = 0; leg < legCount; leg++) {
        starts.push(cumulative[segments[leg].start] / totalDistance);
        ends.push(leg < legCount - 1
          ? cumulative[segments[leg + 1].start] / totalDistance
          : 1);
      }
    } else {
      starts = [0];
      ends = [1];
    }
    return { starts: starts, ends: ends };
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function buildFramePlan(options, fps) {
    options = options || {};
    fps = Math.max(1, Number(fps) || 30);

    var positions = Array.isArray(options.positions) && options.positions.length >= 2
      ? options.positions.slice()
      : [0, 1];
    var segmentCount = positions.length - 1;
    var animationFrames = Math.max(1, Math.round((Number(options.durationSeconds) || 0) * fps));
    var checkpointFrames = Math.max(0, Math.round((Number(options.checkpointPauseMs) || 0) / 1000 * fps));
    var checkpointTotal = Math.max(0, segmentCount - 1) * checkpointFrames;
    var moveFrames = Math.max(animationFrames - checkpointTotal, fps);
    var framesPerSegment = Math.max(1, Math.round(moveFrames / segmentCount));
    var frames = [];

    for (var segment = 0; segment < segmentCount; segment++) {
      var start = positions[segment];
      var end = positions[segment + 1];
      for (var frame = 0; frame < framesPerSegment; frame++) {
        var local = framesPerSegment === 1 ? 0 : frame / (framesPerSegment - 1);
        if (options.easing !== false) local = easeInOut(local);
        frames.push({
          progress: start + (end - start) * local,
          duration: 1,
          segment: segment
        });
      }
      if (segment < segmentCount - 1) {
        frames[frames.length - 1].duration += checkpointFrames;
      }
    }

    frames[frames.length - 1].duration += Math.round((Number(options.holdSeconds) || 0) * fps);

    return {
      frames: frames,
      animationFrames: animationFrames,
      captureFrames: frames.length,
      totalFrames: frames.reduce(function (sum, frame) {
        return sum + frame.duration;
      }, 0),
      framesPerSegment: framesPerSegment,
      checkpointFrames: checkpointFrames
    };
  }

  return {
    buildFramePlan: buildFramePlan,
    buildSegmentBounds: buildSegmentBounds,
    computeLegFractions: computeLegFractions,
    easeInOut: easeInOut,
    haversine: haversine
  };
});
