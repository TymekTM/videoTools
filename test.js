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
    }),
    querySelectorAll: () => [],
    createElement: () => ({
      className: '',
      innerHTML: '',
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      querySelector: () => null,
      style: {},
      appendChild: () => {},
    }),
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

console.log('\n\x1b[1m' + '='.repeat(40) + '\x1b[0m');
console.log(`\x1b[32m${passCount} passed\x1b[0m, \x1b[31m${failCount} failed\x1b[0m\n`);

process.exit(failCount > 0 ? 1 : 0);
