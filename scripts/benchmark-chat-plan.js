const ChatCore = require('../shared/chat');

const FPS = Number(process.env.VT_BENCH_FPS || 30);
const messageCount = Number(process.env.VT_BENCH_MESSAGES || 5);
const options = { messageCount, animSpeed: 600 };
const plan = ChatCore.buildFramePlan(options, FPS);

const legacyRecords = [];
for (const phase of plan.phases) {
  if (phase.type === 'typing') {
    for (let i = 0; i < phase.duration; i++) {
      legacyRecords.push({ type: phase.type, messageIndex: phase.messageIndex, duration: 1 });
    }
  } else {
    legacyRecords.push({ ...phase });
  }
}

function expand(records) {
  return records.flatMap((record) => Array.from(
    { length: record.duration },
    () => `${record.type}:${record.messageIndex}`
  ));
}

const legacyFrames = expand(legacyRecords);
const compactFrames = expand(plan.phases);
console.log(JSON.stringify({
  fps: FPS,
  messages: messageCount,
  logicalFrames: plan.totalFrames,
  legacyRecords: legacyRecords.length,
  compactRecords: plan.phases.length,
  recordReduction: Number((legacyRecords.length / plan.phases.length).toFixed(2)),
  exactPhaseMatch: legacyFrames.length === compactFrames.length
    && legacyFrames.every((frame, index) => frame === compactFrames[index]),
}));
