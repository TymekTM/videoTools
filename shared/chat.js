(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ChatCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function framesForMs(milliseconds, fps, minimum = 0) {
    return Math.max(minimum, Math.round(milliseconds / 1000 * fps));
  }

  function buildFramePlan(options, fps) {
    const messageCount = options.messageCount ?? (options.messages || []).length;
    const speed = options.animSpeed > 0 ? options.animSpeed : 600;
    const typingMs = Math.min(speed * 0.6, 800);
    const phases = [{
      type: 'empty',
      messageIndex: -1,
      duration: framesForMs(options.initialPauseMs ?? 600, fps),
    }];

    for (let index = 0; index < messageCount; index++) {
      if (options.animSpeed > 0) {
        const typingDuration = framesForMs(typingMs, fps, 1);
        phases.push({
          type: 'typing',
          messageIndex: index,
          duration: typingDuration,
          animationDuration: typingDuration,
          renderDelay: Math.max(1, Math.round(typingMs / typingDuration)),
        });
      }
      const animationDuration = framesForMs(options.bubbleMs ?? 350, fps, 1);
      const holdDuration = framesForMs(options.pauseMs ?? 600, fps);
      phases.push({
        type: 'message',
        messageIndex: index,
        duration: animationDuration + holdDuration,
        animationDuration,
        holdDuration,
        renderDelay: options.bubbleRenderDelayMs ?? 450,
      });
    }

    phases.push({
      type: 'end',
      messageIndex: messageCount - 1,
      duration: framesForMs(options.endPauseMs ?? 1500, fps),
    });
    return {
      phases,
      totalFrames: phases.reduce((sum, phase) => sum + phase.duration, 0),
      typingMs,
    };
  }

  return { buildFramePlan, framesForMs };
});
