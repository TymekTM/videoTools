const MapCore = require('../shared/map');

const fps = 30;
const positions = [0, 0.35, 0.72, 1];
const plan = MapCore.buildFramePlan({
  positions,
  durationSeconds: 8,
  checkpointPauseMs: 400,
  holdSeconds: 1.5,
  easing: true,
}, fps);

const legacyRecords = plan.captureFrames +
  (positions.length - 2) * plan.checkpointFrames + 1;

console.log(JSON.stringify({
  fps,
  legs: positions.length - 1,
  logicalFrames: plan.totalFrames,
  legacyGuiRecords: legacyRecords,
  compactRecords: plan.frames.length,
  recordReduction: Number((legacyRecords / plan.frames.length).toFixed(2)),
  exactFrameCount: plan.frames.reduce((sum, frame) => sum + frame.duration, 0) === plan.totalFrames,
  exactEndpoints: plan.frames[0].progress === 0 && plan.frames[plan.frames.length - 1].progress === 1,
}));
