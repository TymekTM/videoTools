(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.AnimationCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function buildFramePlan(options, fps) {
    options = options || {};
    fps = Math.max(1, Number(fps) || 30);

    var durationSeconds = Math.max(0, Number(options.durationSeconds) || 0);
    var holdSeconds = Math.max(0, Number(options.holdSeconds) || 0);
    var frameCount = Math.max(1, Math.round(durationSeconds * fps));
    var frames = [];

    for (var i = 0; i < frameCount; i++) {
      frames.push({
        progress: frameCount === 1 ? 1 : i / (frameCount - 1),
        duration: 1
      });
    }

    frames[frames.length - 1].duration += Math.round(holdSeconds * fps);

    return {
      frames: frames,
      animationFrames: frameCount,
      totalFrames: frames.reduce(function (sum, frame) {
        return sum + frame.duration;
      }, 0)
    };
  }

  return {
    buildFramePlan: buildFramePlan
  };
});
