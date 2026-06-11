const { performance } = require('perf_hooks');
const TypingCore = require('../shared/typing');

const FPS = Number(process.env.VT_BENCH_FPS || 30);
const options = {
  sequences: [
    { action: 'type', text: 'Cześć!' },
    { action: 'pause', duration: 600 },
    { action: 'newline' },
    { action: 'newline' },
    { action: 'type', text: 'Jak się masz?' },
    { action: 'pause', duration: 800 },
    { action: 'delete', count: 7 },
    { action: 'pause', duration: 400 },
    { action: 'type', text: 'świetnie!' },
  ],
  typeSpeed: 80,
  delSpeed: 40,
  startDelay: 500,
  endDelay: 1500,
  cursorBlink: true,
};

function buildLegacyFrames() {
  const timeline = TypingCore.buildTimeline(options);
  const totalDuration = options.startDelay + timeline.totalDuration + options.endDelay;
  const totalFrames = Math.max(1, Math.ceil(totalDuration / 1000 * FPS));
  const frames = [];
  for (let frame = 0; frame < totalFrames; frame++) {
    const absoluteTime = frame / FPS * 1000;
    const timelineTime = absoluteTime - options.startDelay;
    let text;
    if (timelineTime < 0) text = '';
    else if (timelineTime >= timeline.totalDuration) text = timeline.finalText;
    else text = TypingCore.getTextAtTime(timeline, timelineTime);
    const cursor = Math.floor(absoluteTime / 530) % 2 === 0;
    frames.push({ text, cursor });
  }
  return frames;
}

function expandStates(states) {
  return states.flatMap((state) => Array.from(
    { length: state.duration },
    () => ({ text: state.text, cursor: state.cursor })
  ));
}

const legacyStarted = performance.now();
const legacyFrames = buildLegacyFrames();
const legacyPlanMs = performance.now() - legacyStarted;
const compactStarted = performance.now();
const plan = TypingCore.buildFrameStates(options, FPS);
const compactPlanMs = performance.now() - compactStarted;
const expanded = expandStates(plan.states);
const exactStateMatch = legacyFrames.length === expanded.length
  && legacyFrames.every((frame, index) => (
    frame.text === expanded[index].text
    && frame.cursor === expanded[index].cursor
  ));

console.log(JSON.stringify({
  fps: FPS,
  logicalFrames: legacyFrames.length,
  renderedStates: plan.states.length,
  captureReduction: Number((legacyFrames.length / plan.states.length).toFixed(2)),
  legacyPlanMs: Number(legacyPlanMs.toFixed(3)),
  compactPlanMs: Number(compactPlanMs.toFixed(3)),
  exactStateMatch,
}));
