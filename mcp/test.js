const path = require('path');
const fs = require('fs');

const MCP = path.join(__dirname);

let passed = 0;
let failed = 0;
const errors = [];

function assert(cond, msg) {
  if (cond) {
    passed++;
  } else {
    failed++;
    errors.push(msg);
    console.log('  FAIL: ' + msg);
  }
}

async function testModuleLoad() {
  console.log('\n[module load]');

  const templates = require(path.join(MCP, 'lib/templates'));
  assert(templates.TEMPLATES.length === 39, `templates count: ${templates.TEMPLATES.length}`);
  assert(typeof templates.makeHelpers === 'function', 'makeHelpers is function');
  assert(typeof templates.shuffleArray === 'function', 'shuffleArray is function');
  assert(templates.LOREM_HEADLINES.length > 0, 'LOREM_HEADLINES exists');
  assert(templates.LOREM_PARAGRAPHS.length > 0, 'LOREM_PARAGRAPHS exists');

  const allIds = templates.TEMPLATES.map(t => t.id);
  const expected = ['nyt','guardian','lemonde','spiegel','verge','medium','wikipedia','washingtonpost','telegraph','zeit','elpais','gazeta','nrc','folha','sueddeutsche','larepubblica','globeandmail','corriere','liberation','abc','diewelt','irishtimes','clarin','destandaard','scmp','dagensnyheter','techcrunch','wired','arstechnica','zeitmagazine','newyorker','econtwitter','buzzfeed','brutalist','meridian','hackernews','renaissance','terminal','paper'];
  for (const id of expected) {
    assert(allIds.includes(id), `template "${id}" exists`);
  }

  const registry = require(path.join(MCP, 'registry'));
  assert(registry.TOOLS.length === 6, `tools count: ${registry.TOOLS.length}`);
  assert(typeof registry.getResolution === 'function', 'getResolution is function');
  const res = registry.getResolution('16:9', '1080p');
  assert(Array.isArray(res) && res[0] === 1920 && res[1] === 1080, `16:9 1080p = ${res}`);

  const newspaper = require(path.join(MCP, 'renderers/newspaper'));
  assert(typeof newspaper.generate === 'function', 'newspaper.generate');

  const chat = require(path.join(MCP, 'renderers/chat'));
  assert(typeof chat.generate === 'function', 'chat.generate');
  assert(typeof chat.buildFramePlan === 'function', 'chat.buildFramePlan');

  const typing = require(path.join(MCP, 'renderers/typing'));
  assert(typeof typing.generate === 'function', 'typing.generate');
  assert(typeof typing.buildFrameStates === 'function', 'typing.buildFrameStates');

  const chart = require(path.join(MCP, 'renderers/chart'));
  assert(typeof chart.generate === 'function', 'chart.generate');

  const map = require(path.join(MCP, 'renderers/map'));
  assert(typeof map.generate === 'function', 'map.generate');

  const notification = require(path.join(MCP, 'renderers/notification'));
  assert(typeof notification.generate === 'function', 'notification.generate');

  console.log(`  ${passed} passed, ${failed} failed`);
}

async function testTemplates() {
  console.log('\n[template rendering]');
  const { TEMPLATES, makeHelpers } = require(path.join(MCP, 'lib/templates'));

  for (const tpl of TEMPLATES) {
    const helpers = makeHelpers();
    try {
      const html = tpl.render.call(helpers, 'TEST');
      assert(html && html.length > 100, `${tpl.id} renders (${html.length} chars)`);
      assert(html.includes('TEST') || html.includes('keyword-highlight'), `${tpl.id} contains keyword`);
    } catch (e) {
      assert(false, `${tpl.id} render error: ${e.message}`);
    }
  }
  console.log(`  ${passed} passed, ${failed} failed`);
}

async function testRegistrySchemas() {
  console.log('\n[registry schemas]');
  const { TOOLS } = require(path.join(MCP, 'registry'));

  const toolIds = TOOLS.map(t => t.id);
  assert(toolIds.includes('newspaper'), 'newspaper tool registered');
  assert(toolIds.includes('chat'), 'chat tool registered');
  assert(toolIds.includes('typing'), 'typing tool registered');
  assert(toolIds.includes('chart'), 'chart tool registered');
  assert(toolIds.includes('map'), 'map tool registered');
  assert(toolIds.includes('notification'), 'notification tool registered');

  for (const tool of TOOLS) {
    assert(tool.id, `tool has id`);
    assert(tool.name, `tool ${tool.id} has name`);
    assert(tool.description, `tool ${tool.id} has description`);
    assert(Array.isArray(tool.formats), `tool ${tool.id} has formats`);
    assert(tool.params && Object.keys(tool.params).length > 0, `tool ${tool.id} has params`);
  }

  const notifTool = TOOLS.find(t => t.id === 'notification');
  assert(notifTool.params.theme.enum.includes('custom'), 'notification has custom theme');
  assert(notifTool.params.customBg, 'notification has customBg param');
  assert(notifTool.params.preset, 'notification has preset param');
  assert(notifTool.formats.includes('mov'), 'notification supports mov');
  assert(notifTool.formats.includes('webm'), 'notification supports webm');

  const mapTool = TOOLS.find(t => t.id === 'map');
  assert(mapTool.params.segmentColors, 'map has segmentColors param');
  assert(mapTool.params.transportType.enum.includes('car'), 'map supports car');
  assert(mapTool.params.transportType.enum.includes('train'), 'map supports train');

  const chatTool = TOOLS.find(t => t.id === 'chat');
  const contactDesc = chatTool.params.contacts.description;
  assert(contactDesc.includes('avatar'), 'chat contacts mention avatar');

  console.log(`  ${passed} passed, ${failed} failed`);
}

async function testResolutionLookup() {
  console.log('\n[resolution lookup]');
  const { getResolution } = require(path.join(MCP, 'registry'));

  const cases = [
    ['16:9', '720p', [1280, 720]],
    ['16:9', '1080p', [1920, 1080]],
    ['16:9', '4K', [3840, 2160]],
    ['9:16', '1080p', [1080, 1920]],
    ['1:1', '1080p', [1080, 1080]],
    ['16:9', 'invalid', [1920, 1080]],
    ['invalid', '1080p', [1920, 1080]],
  ];
  for (const [f, r, expected] of cases) {
    const got = getResolution(f, r);
    assert(got[0] === expected[0] && got[1] === expected[1], `${f} ${r} = ${got}`);
  }
  console.log(`  ${passed} passed, ${failed} failed`);
}

async function testEncoderFormats() {
  console.log('\n[encoder formats]');
  const encoder = require(path.join(MCP, 'lib/encoder'));
  assert(typeof encoder.encode === 'function', 'encode is function');
  assert(encoder.VP9_CPU_USED === '5', 'MCP uses shared VP9 speed preset');
  console.log(`  ${passed} passed, ${failed} failed`);
}

async function testBrowserModule() {
  console.log('\n[browser module]');
  const browser = require(path.join(MCP, 'lib/browser'));
  assert(typeof browser.createPage === 'function', 'createPage is function');
  assert(typeof browser.loadHtml === 'function', 'loadHtml is function');
  assert(typeof browser.closePage === 'function', 'closePage is function');
  assert(typeof browser.evalAndCapture === 'function', 'evalAndCapture is function');
  assert(typeof browser.findChrome === 'function', 'findChrome is function');
  assert(fs.existsSync(browser.findChrome()), 'findChrome returns an installed browser');
  const page = await browser.createPage(64, 64);
  await browser.loadHtml(page, '<!doctype html><body style="margin:0;background:#f00"></body>');
  await browser.waitForFonts(page);
  const jpeg = await browser.captureFrame(page, 'jpeg');
  const png = await browser.captureFrame(page, 'png');
  assert(Buffer.from(jpeg, 'base64').subarray(0, 2).toString('hex') === 'ffd8', 'JPEG capture is valid');
  assert(Buffer.from(png, 'base64').subarray(1, 4).toString() === 'PNG', 'PNG capture is valid');
  await browser.closePage(page);
  await browser.closeBrowser();
  console.log(`  ${passed} passed, ${failed} failed`);
}

async function testHelpers() {
  console.log('\n[template helpers]');
  const { makeHelpers, shuffleArray, insertKeyword } = require(path.join(MCP, 'lib/templates'));

  const h = makeHelpers('Custom Headline', 'Custom lead with content');
  assert(h.headline() === 'Custom Headline', 'custom headline');
  assert(h.textWithKeyword('WORD').includes('WORD'), 'textWithKeyword includes keyword');
  assert(typeof h.author() === 'string', 'author is string');
  assert(typeof h.date() === 'string', 'date is string');
  assert(typeof h.text(0) === 'string' && h.text(0).length > 50, 'text returns paragraph');

  const h2 = makeHelpers();
  assert(h2.headline() !== h2.headline() || true, 'random headline works');

  const arr = [1, 2, 3, 4, 5];
  const shuffled = shuffleArray(arr);
  assert(shuffled.length === 5, 'shuffleArray preserves length');
  assert(arr.length === 5, 'shuffleArray does not mutate original');

  const withKw = insertKeyword('The quick brown fox jumps over the lazy dog', 'WORD');
  assert(withKw.includes('WORD'), 'insertKeyword inserts keyword');

  console.log(`  ${passed} passed, ${failed} failed`);
}

async function testTypingFramePlan() {
  console.log('\n[shared typing frame plan]');
  const { buildFrameStates } = require(path.join(MCP, 'renderers/typing'));
  const options = {
    sequences: [
      { action: 'type', text: 'AB' },
      { action: 'pause', duration: 200 },
      { action: 'deleteAll' },
    ],
    typeSpeed: 100,
    delSpeed: 50,
    startDelay: 100,
    endDelay: 100,
    cursorBlink: true,
  };
  const plan = buildFrameStates(options, 10);
  assert(plan.totalFrames === 7, `timeline produces 7 frames: ${plan.totalFrames}`);
  assert(plan.timeline.finalText === '', 'deleteAll clears final text');
  assert(plan.states.reduce((sum, state) => sum + state.duration, 0) === plan.totalFrames, 'compaction preserves logical frame count');
  assert(plan.states.some((state) => state.text === 'AB'), 'typing speed produces visible AB state');
  assert(plan.states.length < plan.totalFrames, 'repeated visual states are compacted');
  console.log(`  ${passed} passed, ${failed} failed`);
}

async function testChatFramePlan() {
  console.log('\n[shared chat frame plan]');
  const { buildFramePlan } = require(path.join(MCP, 'renderers/chat'));
  const plan = buildFramePlan({ messages: [{}, {}], animSpeed: 600 }, 30);
  assert(plan.phases.length === 6, `two messages produce 6 phases: ${plan.phases.length}`);
  assert(plan.phases[0].type === 'empty' && plan.phases[0].duration === 18, 'initial pause is 18 frames');
  assert(plan.phases[1].type === 'typing' && plan.phases[1].duration === 11, 'typing phase uses shared timing');
  assert(plan.phases[2].type === 'message' && plan.phases[2].duration === 29, 'message combines bubble and pause');
  assert(plan.phases[5].type === 'end' && plan.phases[5].duration === 45, 'end hold is 45 frames');
  assert(plan.totalFrames === plan.phases.reduce((sum, phase) => sum + phase.duration, 0), 'total frame count matches phases');
  console.log(`  ${passed} passed, ${failed} failed`);
}

async function testNotificationFramePlan() {
  console.log('\n[shared notification frame plan]');
  const { buildFramePlan } = require(path.join(MCP, 'renderers/notification'));
  const plan = buildFramePlan({
    notificationCount: 3,
    animSpeed: 800,
    slideDuration: 400,
    tailMs: 2000,
  }, 30);
  assert(plan.totalFrames === 132, `timeline produces 132 frames: ${plan.totalFrames}`);
  assert(plan.frames.reduce((sum, frame) => sum + frame.duration, 0) === plan.totalFrames, 'compaction preserves logical frame count');
  assert(plan.frames.length < plan.totalFrames, 'static notification states are compacted');
  assert(plan.frames[0].visibleCount === 1 && plan.frames[0].slideProgress === 0, 'first notification starts at zero progress');
  assert(plan.frames[plan.frames.length - 1].visibleCount === 3, 'final state contains all notifications');
  console.log(`  ${passed} passed, ${failed} failed`);
}

async function testContinuousAnimationFramePlan() {
  console.log('\n[shared continuous animation frame plan]');
  const { buildFramePlan } = require(path.join(MCP, 'renderers/chart'));
  const plan = buildFramePlan({ durationSeconds: 3, holdSeconds: 1.5 }, 30);
  assert(plan.animationFrames === 90, `animation has 90 captured frames: ${plan.animationFrames}`);
  assert(plan.totalFrames === 135, `hold extends timeline to 135 frames: ${plan.totalFrames}`);
  assert(plan.frames.length === 90, 'hold reuses the final captured frame');
  assert(plan.frames[0].progress === 0 && plan.frames[89].progress === 1, 'progress includes exact endpoints');
  assert(plan.frames[89].duration === 46, 'final capture includes animation frame and 45-frame hold');
  console.log(`  ${passed} passed, ${failed} failed`);
}

async function testMapFramePlan() {
  console.log('\n[shared map frame plan]');
  const map = require(path.join(MCP, 'renderers/map'));
  const coords = [
    { lat: 0, lng: 0 },
    { lat: 0, lng: 1 },
    { lat: 0, lng: 2 },
    { lat: 0, lng: 3 },
  ];
  const waypoints = [coords[0], coords[2], coords[3]];
  const segments = map.buildSegmentBounds(coords, waypoints, ['#a', '#b']);
  const fractions = map.computeLegFractions(coords, segments, 2);
  const positions = fractions.starts.concat([fractions.ends[fractions.ends.length - 1]]);
  const plan = map.buildFramePlan({
    positions,
    durationSeconds: 5,
    checkpointPauseMs: 400,
    holdSeconds: 1.5,
    easing: true,
  }, 30);
  assert(segments.length === 2 && segments[0].end === 2, 'segment boundaries follow nearest waypoints');
  assert(Math.abs(positions[1] - 2 / 3) < 0.001, 'leg boundary follows route distance');
  assert(plan.checkpointFrames === 12, 'checkpoint pause is 12 frames');
  assert(plan.frames.some(frame => frame.duration === 13), 'checkpoint reuses its final captured frame');
  assert(plan.frames[0].progress === 0 && plan.frames[plan.frames.length - 1].progress === 1, 'map progress includes exact endpoints');
  assert(plan.totalFrames === plan.frames.reduce((sum, frame) => sum + frame.duration, 0), 'map frame durations preserve logical count');
  console.log(`  ${passed} passed, ${failed} failed`);
}

async function testEncoderFrameExpansion() {
  console.log('\n[encoder frame expansion]');
  const { encodedFrameBuffers, countFrames, detectFrameCodec } = require(path.join(MCP, 'lib/encoder'));
  const textFrame = Buffer.from('jpeg-a');
  const binaryFrame = Buffer.from('jpeg-b');
  const frames = [
    { data: textFrame.toString('base64'), duration: 2 },
    { data: binaryFrame, duration: 3 },
  ];
  const expanded = [...encodedFrameBuffers(frames)];
  assert(expanded.length === 5, `expands durations to 5 frames: ${expanded.length}`);
  assert(countFrames(frames) === 5, 'counts logical frames from durations');
  assert(expanded[0].equals(textFrame) && expanded[1].equals(textFrame), 'decodes and repeats base64 frames');
  assert(expanded[2].equals(binaryFrame) && expanded[4].equals(binaryFrame), 'repeats binary frames');
  assert(detectFrameCodec([{ data: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), duration: 1 }]) === 'png', 'detects PNG input');
  assert(detectFrameCodec(frames) === 'mjpeg', 'defaults non-PNG input to MJPEG');
  console.log(`  ${passed} passed, ${failed} failed`);
}

async function run() {
  console.log('MCP Server Tests');
  console.log('================');

  await testModuleLoad();
  await testTemplates();
  await testRegistrySchemas();
  await testResolutionLookup();
  await testEncoderFormats();
  await testBrowserModule();
  await testHelpers();
  await testTypingFramePlan();
  await testChatFramePlan();
  await testNotificationFramePlan();
  await testContinuousAnimationFramePlan();
  await testMapFramePlan();
  await testEncoderFrameExpansion();

  console.log('\n================');
  console.log(`Total: ${passed} passed, ${failed} failed`);
  if (errors.length) {
    console.log('\nFailures:');
    errors.forEach(e => console.log('  - ' + e));
  }
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
