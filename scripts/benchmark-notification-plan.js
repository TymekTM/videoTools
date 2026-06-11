const NotificationCore = require('../shared/notification');

const options = {
  notificationCount: 5,
  animSpeed: 800,
  slideDuration: 400,
  tailMs: 2000,
};
const fps = 30;
const plan = NotificationCore.buildFramePlan(options, fps);

console.log(JSON.stringify({
  fps,
  notifications: options.notificationCount,
  logicalFrames: plan.totalFrames,
  legacyCaptures: plan.totalFrames,
  compactCaptures: plan.frames.length,
  captureReduction: Number((plan.totalFrames / plan.frames.length).toFixed(2)),
  exactFrameCount: plan.frames.reduce((sum, frame) => sum + frame.duration, 0) === plan.totalFrames,
}));
