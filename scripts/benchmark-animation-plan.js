const AnimationCore = require('../shared/animation');

const fps = 30;
const plan = AnimationCore.buildFramePlan({
  durationSeconds: 3,
  holdSeconds: 1.5,
}, fps);

console.log(JSON.stringify({
  fps,
  logicalFrames: plan.totalFrames,
  captures: plan.frames.length,
  legacyGuiRecords: plan.frames.length + 1,
  compactRecords: plan.frames.length,
  exactFrameCount: plan.frames.reduce((sum, frame) => sum + frame.duration, 0) === plan.totalFrames,
  exactEndpoints: plan.frames[0].progress === 0 && plan.frames[plan.frames.length - 1].progress === 1,
}));
