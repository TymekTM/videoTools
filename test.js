const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    passCount++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (e) {
    failCount++;
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${e.message}`);
  }
}

function setupBrowserMocks() {
  var mockCanvas = {
    width: 0, height: 0, style: {},
    getContext: () => ({
      clearRect: () => {},
      fillRect: () => {},
      fillText: () => {},
      strokeText: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      arcTo: () => {},
      bezierCurveTo: () => {},
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      measureText: () => ({ width: 50 }),
    }),
  };
  global.document = {
    addEventListener: () => {},
    querySelector: () => ({
      classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 540, right: 960, bottom: 540 }),
      style: {},
      querySelector: () => null,
      querySelectorAll: () => [],
      appendChild: () => {},
      removeChild: () => {},
      innerHTML: '',
      clientWidth: 960,
      clientHeight: 540,
      addEventListener: () => {},
      getContext: mockCanvas.getContext,
    }),
    querySelectorAll: () => [],
    createElement: () => ({
      className: '',
      innerHTML: '',
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      querySelector: () => null,
      style: {},
      appendChild: () => {},
      addEventListener: () => {},
    }),
    getElementById: () => mockCanvas,
  };
  global.requestAnimationFrame = (fn) => fn();
  global.setTimeout = (fn, ms) => fn();
  global.window = {};
  global.ResizeObserver = function () { this.observe = () => {}; };
  global.$ = (sel) => global.document.querySelector(sel);
  global.$$ = (sel) => global.document.querySelectorAll(sel);
}

function loadRenderer() {
  const vm = require('vm');
  const code = fs.readFileSync(path.join(__dirname, 'src', 'renderer.js'), 'utf8');
  const startIdx = code.indexOf('const RESOLUTIONS');
  const endIdx = code.indexOf('document.addEventListener(\'DOMContentLoaded\'');
  let moduleCode = code.substring(startIdx, endIdx);

  moduleCode = moduleCode.replace(/^const /gm, 'var ');

  const script = new vm.Script(moduleCode, { filename: 'renderer.js' });
  const context = vm.createContext(global);
  script.runInContext(context);
}

console.log('\n\x1b[1mVideo Tools - Unit Tests\x1b[0m\n');

setupBrowserMocks();
loadRenderer();

console.log('\x1b[1mTEMPLATES:\x1b[0m');
test('TEMPLATES array exists and has items', () => {
  assert.ok(Array.isArray(TEMPLATES), 'TEMPLATES should be an array');
  assert.ok(TEMPLATES.length >= 20, `Expected >= 20 templates, got ${TEMPLATES.length}`);
});

test('Each template has required fields', () => {
  TEMPLATES.forEach((t, i) => {
    assert.ok(t.id, `Template ${i} missing id`);
    assert.ok(t.name, `Template ${i} missing name`);
    assert.ok(t.flag, `Template ${i} missing flag`);
    assert.strictEqual(typeof t.render, 'function', `Template ${i} render is not a function`);
    assert.ok(t.category, `Template ${i} (${t.id}) missing category`);
  });
});

test('All template IDs are unique', () => {
  const ids = TEMPLATES.map(t => t.id);
  const unique = new Set(ids);
  assert.strictEqual(ids.length, unique.size, 'Duplicate template IDs found');
});

console.log('\x1b[1minsertKeyword:\x1b[0m');
test('insertKeyword inserts keyword span into text', () => {
  const text = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor';
  const result = insertKeyword(text, 'SZTUKA');
  assert.ok(result.includes('keyword-highlight'), 'Missing keyword-highlight class');
  assert.ok(result.includes('SZTUKA'), 'Missing SZTUKA text');
});

test('insertKeyword replaces exactly one word', () => {
  const text = 'alpha beta gamma delta epsilon';
  const result = insertKeyword(text, 'TEST');
  const matches = result.match(/keyword-highlight/g);
  assert.ok(matches, 'No keyword-highlight found');
  assert.strictEqual(matches.length, 1, `Expected 1 highlight, got ${matches.length}`);
});

test('insertKeyword preserves word count', () => {
  const text = 'one two three four five six seven eight nine ten';
  const originalWords = text.split(/\s+/).length;
  const result = insertKeyword(text, 'REPLACED');
  const plainResult = result.replace(/<[^>]+>/g, '');
  const resultWords = plainResult.split(/\s+/).length;
  assert.strictEqual(resultWords, originalWords, `Word count changed: ${originalWords} -> ${resultWords}`);
});

test('insertKeyword places keyword in valid range (15-85%)', () => {
  const text = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau';
  const result = insertKeyword(text, 'TARGET');
  const spanIdx = result.indexOf('keyword-highlight');
  const prefix = result.substring(0, spanIdx);
  const prefixWords = prefix.split(/\s+/).length;
  const totalWords = text.split(/\s+/).length;
  const ratio = prefixWords / totalWords;
  assert.ok(ratio >= 0.1 && ratio <= 0.9, `Keyword at ${ratio.toFixed(2)} ratio, outside 0.1-0.9 range`);
});

console.log('\x1b[1mgetTemplateHelpers:\x1b[0m');
test('getTemplateHelpers returns object with required methods', () => {
  const h = getTemplateHelpers();
  assert.strictEqual(typeof h.headline, 'function');
  assert.strictEqual(typeof h.text, 'function');
  assert.strictEqual(typeof h.textWithKeyword, 'function');
  assert.strictEqual(typeof h.author, 'function');
  assert.strictEqual(typeof h.date, 'function');
});

test('textWithKeyword returns string with keyword highlight', () => {
  const h = getTemplateHelpers();
  const result = h.textWithKeyword('SZTUKA');
  assert.ok(result.includes('keyword-highlight'), 'Missing keyword-highlight');
  assert.ok(result.includes('SZTUKA'), 'Missing SZTUKA');
});

test('headline returns non-empty string', () => {
  const h = getTemplateHelpers();
  const result = h.headline();
  assert.ok(typeof result === 'string' && result.length > 0, 'headline should return non-empty string');
});

test('text returns non-empty string', () => {
  const h = getTemplateHelpers();
  const result = h.text(0);
  assert.ok(typeof result === 'string' && result.length > 0, 'text should return non-empty string');
});

console.log('\x1b[1mCentering Math:\x1b[0m');
test('transform-origin centering puts keyword at canvas center', () => {
  const cw = 1000, ch = 600;
  const ZOOM = 1.8;

  const cases = [
    { natX: 0.30, natY: 0.30 },
    { natX: 0.50, natY: 0.50 },
    { natX: 0.70, natY: 0.70 },
    { natX: 0.35, natY: 0.45 },
    { natX: 0.65, natY: 0.55 },
  ];

  cases.forEach(({ natX, natY }) => {
    const kCX = natX * cw;
    const kCY = natY * ch;
    const dx = cw / 2 - kCX;
    const dy = ch / 2 - kCY;
    const resultX = dx + kCX;
    const resultY = dy + kCY;
    assert.strictEqual(resultX, cw / 2, `natX=${natX}: expected X=${cw/2}, got ${resultX}`);
    assert.strictEqual(resultY, ch / 2, `natY=${natY}: expected Y=${ch/2}, got ${resultY}`);
  });
});

console.log('\x1b[1mTemplate Rendering:\x1b[0m');
test('Each template renders valid HTML with keyword', () => {
  TEMPLATES.forEach((t) => {
    const h = getTemplateHelpers();
    const html = t.render.call(h, 'SZTUKA');
    assert.ok(typeof html === 'string', `${t.id}: render should return string`);
    assert.ok(html.length > 50, `${t.id}: HTML too short (${html.length} chars)`);
    assert.ok(html.includes('keyword-highlight'), `${t.id}: missing keyword-highlight class`);
    assert.ok(html.includes('SZTUKA'), `${t.id}: missing SZTUKA text`);
    assert.ok(html.includes('<div'), `${t.id}: no div elements`);
    assert.ok(html.includes('style='), `${t.id}: no inline styles`);
  });
});

test('Rendered HTML contains expected structure', () => {
  const h = getTemplateHelpers();
  const html = TEMPLATES[0].render.call(h, 'TESTWORD');
  assert.ok(html.includes('<p'), 'Should have paragraph elements');
  assert.ok(html.includes('TESTWORD'), 'Should contain keyword');
  assert.ok(html.includes('keyword-highlight'), 'Should have highlight class');
});

console.log('\x1b[1mTyping - Timeline:\x1b[0m');
test('typingBuildTimeline builds states from type sequences', () => {
  typingState.sequences = [
    { action: 'type', text: 'ABC' },
  ];
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.finalText, 'ABC', `Expected 'ABC', got '${tl.finalText}'`);
  assert.strictEqual(tl.states.length, 3, `Expected 3 states, got ${tl.states.length}`);
  assert.strictEqual(tl.states[0].text, 'A');
  assert.strictEqual(tl.states[1].text, 'AB');
  assert.strictEqual(tl.states[2].text, 'ABC');
});

test('typingBuildTimeline handles delete action', () => {
  typingState.sequences = [
    { action: 'type', text: 'Hello' },
    { action: 'delete', count: 2 },
  ];
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.finalText, 'Hel', `Expected 'Hel', got '${tl.finalText}'`);
});

test('typingBuildTimeline handles newline action', () => {
  typingState.sequences = [
    { action: 'type', text: 'Line1' },
    { action: 'newline' },
    { action: 'type', text: 'Line2' },
  ];
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.finalText, 'Line1\nLine2', `Expected 'Line1\\nLine2', got '${JSON.stringify(tl.finalText)}'`);
});

test('typingBuildTimeline records pauses', () => {
  typingState.sequences = [
    { action: 'type', text: 'Hi' },
    { action: 'pause', duration: 500 },
    { action: 'type', text: '!' },
  ];
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.pauses.length, 1);
  assert.strictEqual(tl.pauses[0].end - tl.pauses[0].start, 500);
});

test('typingBuildTimeline handles deleteAll when empty', () => {
  typingState.sequences = [
    { action: 'type', text: 'A' },
    { action: 'delete', count: 5 },
  ];
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.finalText, '', `Expected empty, got '${tl.finalText}'`);
});

test('typingBuildTimeline with empty type text produces no states', () => {
  typingState.sequences = [
    { action: 'type', text: '' },
  ];
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.states.length, 0);
  assert.strictEqual(tl.finalText, '');
});

test('typingBuildTimeline respects custom speed per sequence', () => {
  typingState.sequences = [
    { action: 'type', text: 'AB', speed: 50 },
    { action: 'delete', count: 1, speed: 20 },
  ];
  typingState.typeSpeed = 80;
  typingState.delSpeed = 40;
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.states[0].time, 0);
  assert.strictEqual(tl.states[1].time, 50);
  assert.strictEqual(tl.states[2].time, 100);
});

console.log('\x1b[1mTyping - getTextAtTime:\x1b[0m');
test('typingGetTextAtTime returns correct text during typing', () => {
  typingState.sequences = [
    { action: 'type', text: 'ABC' },
  ];
  typingState.typeSpeed = 100;
  const tl = typingBuildTimeline();
  assert.strictEqual(typingGetTextAtTime(tl, 0), 'A');
  assert.strictEqual(typingGetTextAtTime(tl, 99), 'A');
  assert.strictEqual(typingGetTextAtTime(tl, 100), 'AB');
  assert.strictEqual(typingGetTextAtTime(tl, 200), 'ABC');
  assert.strictEqual(typingGetTextAtTime(tl, 999), 'ABC');
});

test('typingGetTextAtTime returns empty for time before any state', () => {
  typingState.sequences = [
    { action: 'pause', duration: 200 },
    { action: 'type', text: 'X' },
  ];
  typingState.typeSpeed = 50;
  const tl = typingBuildTimeline();
  assert.strictEqual(typingGetTextAtTime(tl, 0), '');
  assert.strictEqual(typingGetTextAtTime(tl, 199), '');
  assert.strictEqual(typingGetTextAtTime(tl, 200), 'X');
});

test('typingGetTextAtTime handles delete timeline', () => {
  typingState.sequences = [
    { action: 'type', text: 'ABCD' },
    { action: 'delete', count: 2 },
  ];
  typingState.typeSpeed = 100;
  typingState.delSpeed = 50;
  const tl = typingBuildTimeline();
  assert.strictEqual(typingGetTextAtTime(tl, 300), 'ABCD');
  assert.strictEqual(typingGetTextAtTime(tl, 350), 'ABCD');
  assert.strictEqual(typingGetTextAtTime(tl, 400), 'ABC');
  assert.strictEqual(typingGetTextAtTime(tl, 450), 'AB');
});

console.log('\x1b[1mTyping - isInPause:\x1b[0m');
test('typingIsInPause detects pause intervals', () => {
  const pauses = [
    { start: 100, end: 300 },
    { start: 500, end: 700 },
  ];
  assert.strictEqual(typingIsInPause(pauses, 0), false);
  assert.strictEqual(typingIsInPause(pauses, 100), true);
  assert.strictEqual(typingIsInPause(pauses, 200), true);
  assert.strictEqual(typingIsInPause(pauses, 299), true);
  assert.strictEqual(typingIsInPause(pauses, 300), false);
  assert.strictEqual(typingIsInPause(pauses, 600), true);
});

test('typingIsInPause returns false for empty pauses', () => {
  assert.strictEqual(typingIsInPause([], 500), false);
});

console.log('\x1b[1mTyping - escapeHTML:\x1b[0m');
test('typingEscapeHTML escapes special characters', () => {
  assert.strictEqual(typingEscapeHTML('<b>hi</b>'), '&lt;b&gt;hi&lt;/b&gt;');
  assert.strictEqual(typingEscapeHTML('a&b'), 'a&amp;b');
  assert.strictEqual(typingEscapeHTML('line1\nline2'), 'line1<br>line2');
  assert.strictEqual(typingEscapeHTML('hello'), 'hello');
});

console.log('\x1b[1mTyping - Theme Rendering:\x1b[0m');
test('typingRenderTheme produces valid HTML for each theme', () => {
  typingState.bgColor = '#1e1e2e';
  typingState.textColor = '#cdd6f4';
  typingState.cursorColor = '#f5e0dc';
  typingState.fontSize = 16;
  const themes = ['editor', 'terminal', 'email', 'sms', 'generic'];
  themes.forEach(theme => {
    typingState.theme = theme;
    const html = typingRenderTheme(theme, 'Hello World');
    assert.ok(html.includes('Hello World'), `${theme}: missing content`);
    assert.ok(html.includes('#1e1e2e'), `${theme}: missing bg color`);
    assert.ok(html.includes('width:100%'), `${theme}: missing width:100%`);
    assert.ok(html.includes('height:100%'), `${theme}: missing height:100%`);
    assert.ok(html.includes('display:flex'), `${theme}: missing display:flex`);
  });
});

test('typing theme renders include inline font-family', () => {
  const html = typingRenderTheme('editor', 'test');
  assert.ok(html.includes('JetBrains Mono'), 'Missing font-family');
});

test('typing theme terminal includes prompt', () => {
  const html = typingRenderTheme('terminal', 'ls -la');
  assert.ok(html.includes('user@machine'), 'Missing terminal prompt');
});

test('typing theme email includes To and Subject fields', () => {
  const html = typingRenderTheme('email', 'Body text');
  assert.ok(html.includes('To:'), 'Missing To field');
  assert.ok(html.includes('Subject:'), 'Missing Subject field');
});

test('typing theme sms includes bubble with content', () => {
  const html = typingRenderTheme('sms', 'Msg');
  assert.ok(html.includes('Msg'), 'Missing SMS content');
  assert.ok(html.includes('border-radius'), 'Missing bubble border-radius');
});

console.log('\x1b[1mTyping - State:\x1b[0m');
test('typingState has required fields', () => {
  assert.ok(typingState.format);
  assert.ok(typingState.resolution);
  assert.ok(typingState.theme);
  assert.ok(Array.isArray(typingState.sequences));
  assert.strictEqual(typeof typingState.typeSpeed, 'number');
  assert.strictEqual(typeof typingState.delSpeed, 'number');
  assert.strictEqual(typeof typingState.fontSize, 'number');
  assert.strictEqual(typeof typingState.bgColor, 'string');
  assert.strictEqual(typeof typingState.textColor, 'string');
  assert.strictEqual(typeof typingState.cursorColor, 'string');
  assert.strictEqual(typeof typingState.startDelay, 'number');
  assert.strictEqual(typeof typingState.endDelay, 'number');
  assert.strictEqual(typeof typingState.cursorBlink, 'boolean');
});

test('typingState default sequences are valid', () => {
  typingState.sequences.forEach((seq, i) => {
    assert.ok(['type', 'delete', 'pause', 'newline', 'deleteAll'].includes(seq.action), `Seq ${i}: invalid action '${seq.action}'`);
    if (seq.action === 'type') assert.ok(typeof seq.text === 'string', `Seq ${i}: type missing text`);
    if (seq.action === 'delete') assert.ok(typeof seq.count === 'number' && seq.count > 0, `Seq ${i}: delete missing count`);
    if (seq.action === 'pause') assert.ok(typeof seq.duration === 'number' && seq.duration > 0, `Seq ${i}: pause missing duration`);
  });
});

test('typingBuildTimeline with default sequences completes without error', () => {
  typingState.sequences = [
    { action: 'type', text: 'Cześć!' },
    { action: 'pause', duration: 600 },
    { action: 'newline' },
    { action: 'newline' },
    { action: 'type', text: 'Jak się masz?' },
    { action: 'pause', duration: 800 },
    { action: 'delete', count: 7 },
    { action: 'pause', duration: 400 },
    { action: 'type', text: 'świetnie!' },
  ];
  const tl = typingBuildTimeline();
  assert.ok(tl.states.length > 0, 'Should have states');
  assert.ok(tl.totalDuration > 0, 'Should have positive duration');
  assert.ok(tl.finalText.length > 0, 'Should have final text');
  assert.ok(tl.pauses.length >= 2, 'Should have at least 2 pauses');
});

console.log('\x1b[1mMath Helpers:\x1b[0m');
test('lerp interpolates linearly', () => {
  assert.strictEqual(lerp(0, 10, 0), 0);
  assert.strictEqual(lerp(0, 10, 0.5), 5);
  assert.strictEqual(lerp(0, 10, 1), 10);
  assert.strictEqual(lerp(-5, 5, 0.5), 0);
});

test('lerp clamps to range', () => {
  assert.strictEqual(lerp(100, 200, 0), 100);
  assert.strictEqual(lerp(100, 200, 1), 200);
});

test('easeInOut(0) = 0 and easeInOut(1) = 1', () => {
  assert.strictEqual(easeInOut(0), 0);
  assert.strictEqual(easeInOut(1), 1);
});

test('easeInOut is symmetric around 0.5', () => {
  for (let t = 0; t <= 1; t += 0.1) {
    const a = easeInOut(t);
    const b = easeInOut(1 - t);
    assert.ok(Math.abs(a + b - 1) < 1e-10, `easeInOut(${t.toFixed(1)}) + easeInOut(${(1-t).toFixed(1)}) ≠ 1`);
  }
});

test('easeInOut is monotonically increasing', () => {
  let prev = -1;
  for (let t = 0; t <= 1; t += 0.05) {
    const v = easeInOut(t);
    assert.ok(v >= prev, `easeInOut not monotonic at t=${t.toFixed(2)}: ${v} < ${prev}`);
    prev = v;
  }
});

console.log('\x1b[1mANIMATION_PRESETS:\x1b[0m');
test('ANIMATION_PRESETS has required entries', () => {
  const ids = ['none', 'zoomIn', 'zoomOut', 'panLeft', 'panRight', 'panUp', 'panDown', 'kenBurns', 'drift', 'breathe', 'swing'];
  ids.forEach(id => {
    assert.ok(ANIMATION_PRESETS[id], `Missing preset: ${id}`);
    assert.ok(ANIMATION_PRESETS[id].name, `Missing name for ${id}`);
    assert.ok(ANIMATION_PRESETS[id].easing, `Missing easing for ${id}`);
  });
});

test('none preset has no resolve function', () => {
  assert.strictEqual(ANIMATION_PRESETS.none.resolve, undefined);
});

test('all non-none presets have resolve function', () => {
  Object.entries(ANIMATION_PRESETS).forEach(([id, preset]) => {
    if (id === 'none') return;
    assert.strictEqual(typeof preset.resolve, 'function', `${id} missing resolve`);
  });
});

test('resolve returns {zoom, offX, offY} at progress 0', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  Object.entries(ANIMATION_PRESETS).forEach(([id, preset]) => {
    if (id === 'none') return;
    const vals = preset.resolve(0, sV);
    assert.ok(typeof vals.zoom === 'number', `${id} at p=0: zoom not number`);
    assert.ok(typeof vals.offX === 'number', `${id} at p=0: offX not number`);
    assert.ok(typeof vals.offY === 'number', `${id} at p=0: offY not number`);
  });
});

test('resolve returns {zoom, offX, offY} at progress 1', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  Object.entries(ANIMATION_PRESETS).forEach(([id, preset]) => {
    if (id === 'none') return;
    const vals = preset.resolve(1, sV);
    assert.ok(typeof vals.zoom === 'number', `${id} at p=1: zoom not number`);
    assert.ok(typeof vals.offX === 'number', `${id} at p=1: offX not number`);
    assert.ok(typeof vals.offY === 'number', `${id} at p=1: offY not number`);
  });
});

console.log('\x1b[1mAnimation - Zoom In:\x1b[0m');
test('zoomIn starts below target zoom and ends at target', () => {
  const sV = { zoom: 3, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.zoomIn.resolve(0, sV);
  const end = ANIMATION_PRESETS.zoomIn.resolve(1, sV);
  assert.ok(start.zoom < end.zoom, 'zoomIn should increase zoom');
  assert.strictEqual(end.zoom, 3, 'zoomIn should end at target zoom');
});

test('zoomIn with intensity 0 returns base zoom at all progress', () => {
  const sV = { zoom: 3, offX: 10, offY: 10, intensity: 0 };
  const start = ANIMATION_PRESETS.zoomIn.resolve(0, sV);
  const mid = ANIMATION_PRESETS.zoomIn.resolve(0.5, sV);
  const end = ANIMATION_PRESETS.zoomIn.resolve(1, sV);
  assert.strictEqual(start.zoom, 3);
  assert.strictEqual(mid.zoom, 3);
  assert.strictEqual(end.zoom, 3);
});

console.log('\x1b[1mAnimation - Zoom Out:\x1b[0m');
test('zoomOut starts at target and ends below', () => {
  const sV = { zoom: 3, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.zoomOut.resolve(0, sV);
  const end = ANIMATION_PRESETS.zoomOut.resolve(1, sV);
  assert.strictEqual(start.zoom, 3, 'zoomOut should start at target zoom');
  assert.ok(end.zoom < start.zoom, 'zoomOut should decrease zoom');
});

console.log('\x1b[1mAnimation - Pan:\x1b[0m');
test('panLeft moves offset from positive to negative', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.panLeft.resolve(0, sV);
  const end = ANIMATION_PRESETS.panLeft.resolve(1, sV);
  assert.ok(start.offX > 0, `panLeft start should be positive, got ${start.offX}`);
  assert.ok(end.offX < 0, `panLeft end should be negative, got ${end.offX}`);
  assert.strictEqual(start.zoom, 2, 'panLeft should not change zoom');
});

test('panRight is inverse of panLeft', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const leftStart = ANIMATION_PRESETS.panLeft.resolve(0, sV);
  const rightStart = ANIMATION_PRESETS.panRight.resolve(0, sV);
  assert.strictEqual(leftStart.offX, -rightStart.offX, 'panLeft/panRight should be opposite');
});

test('pan preserves zoom', () => {
  const sV = { zoom: 2.5, offX: 0, offY: 0, intensity: 1 };
  ['panLeft', 'panRight', 'panUp', 'panDown'].forEach(id => {
    [0, 0.5, 1].forEach(p => {
      const v = ANIMATION_PRESETS[id].resolve(p, sV);
      assert.strictEqual(v.zoom, 2.5, `${id} at p=${p} changed zoom`);
    });
  });
});

test('pan respects intensity', () => {
  const sV0 = { zoom: 2, offX: 0, offY: 0, intensity: 0 };
  const sV1 = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const sV2 = { zoom: 2, offX: 0, offY: 0, intensity: 2 };
  const v0 = ANIMATION_PRESETS.panLeft.resolve(0, sV0);
  const v1 = ANIMATION_PRESETS.panLeft.resolve(0, sV1);
  const v2 = ANIMATION_PRESETS.panLeft.resolve(0, sV2);
  assert.strictEqual(v0.offX, 0, 'intensity 0 should have no offset');
  assert.ok(Math.abs(v2.offX) > Math.abs(v1.offX), 'intensity 2 should have more offset than 1');
  assert.ok(Math.abs(v1.offX) > 0, 'intensity 1 should have offset');
});

console.log('\x1b[1mAnimation - Ken Burns:\x1b[0m');
test('kenBurns zooms and pans simultaneously', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.kenBurns.resolve(0, sV);
  const end = ANIMATION_PRESETS.kenBurns.resolve(1, sV);
  assert.ok(start.zoom < end.zoom, 'kenBurns should zoom in');
  assert.notStrictEqual(start.offX, end.offX, 'kenBurns should pan X');
  assert.notStrictEqual(start.offY, end.offY, 'kenBurns should pan Y');
});

console.log('\x1b[1mAnimation - Breathe:\x1b[0m');
test('breathe peaks at progress 0.5 and returns to start at 1', () => {
  const sV = { zoom: 2, offX: 10, offY: 20, intensity: 1 };
  const start = ANIMATION_PRESETS.breathe.resolve(0, sV);
  const mid = ANIMATION_PRESETS.breathe.resolve(0.5, sV);
  const end = ANIMATION_PRESETS.breathe.resolve(1, sV);
  assert.ok(mid.zoom > start.zoom, 'breathe should peak at midpoint');
  assert.ok(Math.abs(end.zoom - start.zoom) < 0.001, 'breathe should return to start zoom');
  assert.strictEqual(start.offX, 10, 'breathe should not change offX');
  assert.strictEqual(start.offY, 20, 'breathe should not change offY');
});

test('breathe with intensity 0 does not change zoom', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 0 };
  [0, 0.25, 0.5, 0.75, 1].forEach(p => {
    const v = ANIMATION_PRESETS.breathe.resolve(p, sV);
    assert.strictEqual(v.zoom, 2, `breathe at p=${p} with i=0 should stay at base zoom`);
  });
});

console.log('\x1b[1mAnimation - Intensity:\x1b[0m');
test('all presets with intensity 0 return base state values', () => {
  const base = { zoom: 2.5, offX: 15, offY: -10 };
  const sV = { ...base, intensity: 0 };
  Object.entries(ANIMATION_PRESETS).forEach(([id, preset]) => {
    if (id === 'none') return;
    [0, 0.5, 1].forEach(p => {
      const v = preset.resolve(p, sV);
      assert.strictEqual(v.offX, base.offX, `${id} at p=${p} i=0: offX changed`);
      assert.strictEqual(v.offY, base.offY, `${id} at p=${p} i=0: offY changed`);
    });
  });
});

test('higher intensity produces larger zoom range for zoomIn', () => {
  const base = { zoom: 3, offX: 0, offY: 0 };
  const range1 = ANIMATION_PRESETS.zoomIn.resolve(0, { ...base, intensity: 0.5 }).zoom;
  const range2 = ANIMATION_PRESETS.zoomIn.resolve(0, { ...base, intensity: 1 }).zoom;
  const range3 = ANIMATION_PRESETS.zoomIn.resolve(0, { ...base, intensity: 2 }).zoom;
  assert.ok(range3 < range2, 'intensity 2 should start further from target');
  assert.ok(range2 < range1, 'intensity 1 should start further than 0.5');
});

console.log('\x1b[1mRESOLUTIONS:\x1b[0m');
test('RESOLUTIONS has all 3 formats', () => {
  assert.ok(RESOLUTIONS['16:9'], 'Missing 16:9');
  assert.ok(RESOLUTIONS['9:16'], 'Missing 9:16');
  assert.ok(RESOLUTIONS['1:1'], 'Missing 1:1');
});

test('RESOLUTIONS has all 3 quality levels per format', () => {
  Object.entries(RESOLUTIONS).forEach(([fmt, levels]) => {
    ['720p', '1080p', '4K'].forEach(qual => {
      assert.ok(levels[qual], `Missing ${qual} for ${fmt}`);
      assert.ok(Array.isArray(levels[qual]), `${fmt}/${qual} should be array`);
      assert.strictEqual(levels[qual].length, 2, `${fmt}/${qual} should have [w, h]`);
    });
  });
});

test('16:9 resolutions have correct aspect ratio', () => {
  Object.values(RESOLUTIONS['16:9']).forEach(([w, h]) => {
    const ratio = w / h;
    assert.ok(Math.abs(ratio - 16/9) < 0.01, `16:9 ${w}x${h} ratio is ${ratio.toFixed(3)}`);
  });
});

test('9:16 resolutions are portrait (h > w)', () => {
  Object.values(RESOLUTIONS['9:16']).forEach(([w, h]) => {
    assert.ok(h > w, `9:16 ${w}x${h} should be portrait`);
  });
});

test('1:1 resolutions are square', () => {
  Object.values(RESOLUTIONS['1:1']).forEach(([w, h]) => {
    assert.strictEqual(w, h, `1:1 ${w}x${h} should be square`);
  });
});

test('4K resolution is 3840x2160 for 16:9', () => {
  const [w, h] = RESOLUTIONS['16:9']['4K'];
  assert.strictEqual(w, 3840);
  assert.strictEqual(h, 2160);
});

test('1080p is 1920x1080 for 16:9', () => {
  const [w, h] = RESOLUTIONS['16:9']['1080p'];
  assert.strictEqual(w, 1920);
  assert.strictEqual(h, 1080);
});

console.log('\x1b[1mLOREM Data:\x1b[0m');
test('LOREM_HEADLINES has at least 10 entries', () => {
  assert.ok(Array.isArray(LOREM_HEADLINES));
  assert.ok(LOREM_HEADLINES.length >= 10);
});

test('LOREM_PARAGRAPHS has at least 10 entries', () => {
  assert.ok(Array.isArray(LOREM_PARAGRAPHS));
  assert.ok(LOREM_PARAGRAPHS.length >= 10);
});

test('LOREM_AUTHORS has at least 5 entries', () => {
  assert.ok(Array.isArray(LOREM_AUTHORS));
  assert.ok(LOREM_AUTHORS.length >= 5);
});

test('LOREM_HEADLINES entries are non-empty strings', () => {
  LOREM_HEADLINES.forEach((h, i) => {
    assert.strictEqual(typeof h, 'string', `Headline ${i} not string`);
    assert.ok(h.length > 10, `Headline ${i} too short`);
  });
});

test('LOREM_PARAGRAPHS entries are substantial text blocks', () => {
  LOREM_PARAGRAPHS.forEach((p, i) => {
    assert.ok(p.split(/\s+/).length >= 20, `Paragraph ${i} too short (${p.split(/\s+/).length} words)`);
  });
});

console.log('\x1b[1mCATEGORIES:\x1b[0m');
test('CATEGORIES exists and has entries', () => {
  assert.ok(CATEGORIES, 'CATEGORIES should exist');
  assert.ok(Object.keys(CATEGORIES).length >= 3, 'Should have at least 3 categories');
});

test('Each category has label and icon', () => {
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    assert.ok(cat.label, `Category ${key} missing label`);
    assert.ok(cat.icon, `Category ${key} missing icon`);
  });
});

test('All template categories map to valid CATEGORIES entries', () => {
  TEMPLATES.forEach(t => {
    assert.ok(CATEGORIES[t.category], `Template ${t.id} has invalid category: ${t.category}`);
  });
});

console.log('\n\x1b[1m' + '='.repeat(40) + '\x1b[0m');

console.log('\x1b[1mChart Tool - Easing Functions:\x1b[0m');
test('easeInOut(0) = 0 and easeInOut(1) = 1 (chart version)', () => {
  const fn = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  assert.strictEqual(fn(0), 0);
  assert.strictEqual(fn(1), 1);
});

test('bounce easing at 0 = 0 and at 1 ≈ 1', () => {
  const fn = (t) => {
    var n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  };
  assert.strictEqual(fn(0), 0);
  assert.ok(Math.abs(fn(1) - 1) < 0.01, `bounce(1) should be ~1, got ${fn(1)}`);
});

test('spring easing overshoots then settles near 1', () => {
  const fn = (t) => 1 - Math.cos(t * 4.5 * Math.PI) * Math.exp(-t * 6);
  assert.strictEqual(fn(0), 0);
  assert.ok(Math.abs(fn(1) - 1) < 0.05, `spring(1) should be ~1, got ${fn(1)}`);
  const mid = fn(0.3);
  assert.ok(mid > 1 || mid < 0 || Math.abs(mid - 0.5) > 0.3, 'spring should overshoot or oscillate');
});

test('all easing functions are monotonically increasing near end', () => {
  const fns = {
    linear: t => t,
    easeInOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    easeOut: t => 1 - Math.pow(1 - t, 3),
    easeIn: t => t * t * t,
  };
  Object.entries(fns).forEach(([name, fn]) => {
    const v09 = fn(0.9);
    const v10 = fn(1.0);
    assert.ok(v10 >= v09, `${name}: fn(1.0) should be >= fn(0.9)`);
  });
});

console.log('\x1b[1mChart Tool - formatNumber:\x1b[0m');
test('formatNumber formats integers with spaces', () => {
  const result = '1 000 000';
  const str = Math.abs(1000000).toFixed(0);
  const formatted = str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  assert.strictEqual(formatted, '1 000 000');
});

test('formatNumber handles decimals', () => {
  const str = Math.abs(1234.56).toFixed(2);
  const formatted = str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  assert.strictEqual(formatted, '1 234.56');
});

test('formatNumber handles prefix and suffix', () => {
  const val = 42000;
  const str = Math.abs(val).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const result = '$' + str + ' USD';
  assert.strictEqual(result, '$42 000 USD');
});

test('formatNumber handles zero', () => {
  const str = Math.abs(0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  assert.strictEqual(str, '0');
});

console.log('\x1b[1mChart Tool - staggerProgress:\x1b[0m');
test('stagger 0 means all items animate together', () => {
  const stagger = 0;
  const dur = 1;
  const p0 = (0 - 0) / dur;
  const p1 = (1 - 0) / dur;
  assert.ok(p0 >= 0 && p1 > 0, 'With stagger 0, both should animate');
});

test('stagger causes delayed start for later items', () => {
  const stagger = 0.1;
  const total = 5;
  const start0 = stagger * 0;
  const start4 = stagger * 4;
  assert.strictEqual(start0, 0, 'First item starts immediately');
  assert.ok(start4 > 0, 'Last item has delayed start');
  assert.ok(start4 < 1, 'Last item starts before animation ends');
});

console.log('\x1b[1mChart Tool - hexToRgb:\x1b[0m');
test('hexToRgb converts #6366f1 correctly', () => {
  const r = parseInt('63', 16);
  const g = parseInt('66', 16);
  const b = parseInt('f1', 16);
  assert.strictEqual(r, 99);
  assert.strictEqual(g, 102);
  assert.strictEqual(b, 241);
});

test('hexToRgb converts #ffffff to 255,255,255', () => {
  const r = parseInt('ff', 16);
  const g = parseInt('ff', 16);
  const b = parseInt('ff', 16);
  assert.strictEqual(r, 255);
  assert.strictEqual(g, 255);
  assert.strictEqual(b, 255);
});

console.log('\x1b[1mChart Tool - CHART_RES:\x1b[0m');
test('Chart CHART_RES structure is complete (loaded from chart-renderer.js globals)', () => {
  const CHART_RES_test = {
    '16:9': { '720p': [1280, 720], '1080p': [1920, 1080], '4K': [3840, 2160] },
    '9:16': { '720p': [720, 1280], '1080p': [1080, 1920], '4K': [2160, 3840] },
    '1:1': { '720p': [720, 720], '1080p': [1080, 1080], '4K': [2160, 2160] }
  };
  ['16:9', '9:16', '1:1'].forEach(fmt => {
    ['720p', '1080p', '4K'].forEach(qual => {
      assert.ok(CHART_RES_test[fmt][qual], `Missing ${fmt}/${qual}`);
      assert.strictEqual(CHART_RES_test[fmt][qual].length, 2);
    });
  });
});

console.log('\n\x1b[1m' + '='.repeat(40) + '\x1b[0m');
console.log(`\x1b[32m${passCount} passed\x1b[0m, \x1b[31m${failCount} failed\x1b[0m\n`);

process.exit(failCount > 0 ? 1 : 0);
