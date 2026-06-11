(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.NotificationCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function buildFramePlan(options, fps) {
    options = options || {};
    fps = Math.max(1, Number(fps) || 30);

    var notificationCount = Math.max(0, Number(options.notificationCount) ||
      (Array.isArray(options.notifications) ? options.notifications.length : 0));
    var animSpeed = Math.max(1, Number(options.animSpeed) || 800);
    var slideDuration = Math.max(1, Number(options.slideDuration) || 400);
    var tailMs = Math.max(0, Number(options.tailMs) || 2000);
    var totalMs = notificationCount * animSpeed + tailMs;
    var totalFrames = Math.max(1, Math.round(totalMs / 1000 * fps));
    var frames = [];

    for (var i = 0; i < totalFrames; i++) {
      var t = totalFrames === 1 ? 1 : i / (totalFrames - 1);
      var elapsed = t * totalMs;
      var visibleCount = Math.min(notificationCount, Math.floor(elapsed / animSpeed) + 1);
      var latestStart = Math.max(0, visibleCount - 1) * animSpeed;
      var isAnimating = visibleCount > 0 && elapsed - latestStart < slideDuration;
      var slideProgress = isAnimating
        ? Math.max(0, Math.min(1, (elapsed - latestStart) / slideDuration))
        : -1;
      var key = isAnimating ? 'frame:' + i : 'static:' + visibleCount;
      var last = frames[frames.length - 1];

      if (last && last.key === key) {
        last.duration++;
      } else {
        frames.push({
          key: key,
          t: t,
          duration: 1,
          visibleCount: visibleCount,
          slideProgress: slideProgress
        });
      }
    }

    return {
      frames: frames,
      totalFrames: totalFrames,
      totalMs: totalMs
    };
  }

  return {
    buildFramePlan: buildFramePlan
  };
});
