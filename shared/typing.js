(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.TypingCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function buildTimeline(options) {
    const states = [];
    const pauses = [];
    let time = 0;
    let text = '';

    for (const sequence of options.sequences || []) {
      const typeSpeed = sequence.speed ?? options.typeSpeed;
      const deleteSpeed = sequence.speed ?? options.delSpeed;
      switch (sequence.action) {
        case 'type':
          for (const character of sequence.text || '') {
            text += character;
            states.push({ time, text });
            time += typeSpeed;
          }
          break;
        case 'delete': {
          const count = Math.min(sequence.count ?? 1, text.length);
          for (let i = 0; i < count; i++) {
            text = text.slice(0, -1);
            states.push({ time, text });
            time += deleteSpeed;
          }
          break;
        }
        case 'deleteAll':
          while (text.length > 0) {
            text = text.slice(0, -1);
            states.push({ time, text });
            time += deleteSpeed;
          }
          break;
        case 'pause': {
          const duration = sequence.duration ?? 500;
          pauses.push({ start: time, end: time + duration });
          time += duration;
          break;
        }
        case 'newline':
          text += '\n';
          states.push({ time, text });
          time += typeSpeed;
          break;
      }
    }

    return { states, pauses, totalDuration: time, finalText: text };
  }

  function getTextAtTime(timeline, time) {
    let text = '';
    for (const state of timeline.states) {
      if (state.time > time) break;
      text = state.text;
    }
    return text;
  }

  function isInPause(pauses, time) {
    return pauses.some((pause) => time >= pause.start && time < pause.end);
  }

  function buildFrameStates(options, fps) {
    const timeline = buildTimeline(options);
    const startDelay = options.startDelay || 0;
    const endDelay = options.endDelay || 0;
    const totalDuration = startDelay + timeline.totalDuration + endDelay;
    const totalFrames = Math.max(1, Math.ceil(totalDuration / 1000 * fps));
    const states = [];

    for (let frame = 0; frame < totalFrames; frame++) {
      const absoluteTime = frame / fps * 1000;
      const timelineTime = absoluteTime - startDelay;
      let text;
      if (timelineTime < 0) text = '';
      else if (timelineTime >= timeline.totalDuration) text = timeline.finalText;
      else text = getTextAtTime(timeline, timelineTime);
      const cursor = options.cursorBlink === false
        || Math.floor(absoluteTime / (options.cursorBlinkMs || 530)) % 2 === 0;
      const key = `${cursor ? 1 : 0}:${text}`;
      const last = states[states.length - 1];
      if (last && last.key === key) last.duration++;
      else states.push({ text, cursor, duration: 1, key });
    }

    return { states, timeline, totalFrames, totalDuration };
  }

  return {
    buildTimeline,
    getTextAtTime,
    isInPause,
    buildFrameStates,
  };
});
