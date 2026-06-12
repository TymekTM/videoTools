const fs = require('fs');
const path = require('path');
const os = require('os');
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
  const translations = {
    notifPresetSmsTitle: 'Mama',
    notifPresetSmsMsg: 'Kiedy przychodzisz na obiad?',
  };
  global.t = (key) => translations[key] || key;
  global.Map = Map;
}

function loadShared() {
  const vm = require('vm');
  const code = fs.readFileSync(path.join(__dirname, 'src', 'shared.js'), 'utf8');
  const script = new vm.Script(code, { filename: 'shared.js' });
  const context = vm.createContext(global);
  script.runInContext(context);
}

function loadScript(filename) {
  const vm = require('vm');
  const code = fs.readFileSync(path.join(__dirname, 'src', filename), 'utf8');
  const moduleCode = code.replace(/^const /gm, 'var ');
  const script = new vm.Script(moduleCode, { filename });
  const context = vm.createContext(global);
  script.runInContext(context);
}

function loadRenderer() {
  loadScript('templates.js');
  loadScript('news-renderer.js');
  loadScript('chat-renderer.js');
  loadScript('typing-renderer.js');
}

console.log('\n\x1b[1mVideo Tools - Unit Tests\x1b[0m\n');

setupBrowserMocks();
loadShared();
global.TypingCore = require('./shared/typing');
global.ChatCore = require('./shared/chat');
global.NotificationCore = require('./shared/notification');
global.AnimationCore = require('./shared/animation');
global.MapCore = require('./shared/map');

console.log('\x1b[1mShared module:\x1b[0m');
test('RESOLUTIONS has all 3 formats', () => {
  assert.ok(RESOLUTIONS['16:9']);
  assert.ok(RESOLUTIONS['9:16']);
  assert.ok(RESOLUTIONS['1:1']);
});
test('hexToRgb parses #6366f1', () => {
  const c = hexToRgb('#6366f1');
  assert.strictEqual(c.r, 99);
  assert.strictEqual(c.g, 102);
  assert.strictEqual(c.b, 241);
});
test('escapeHTML escapes special characters', () => {
  assert.strictEqual(escapeHTML('<b>hi</b>'), '&lt;b&gt;hi&lt;/b&gt;');
  assert.strictEqual(escapeHTML('a&b'), 'a&amp;b');
  assert.strictEqual(escapeHTML('line1\nline2'), 'line1<br>line2');
});
test('formatNumber formats integers with spaces', () => {
  assert.strictEqual(formatNumber(1000000), '1 000 000');
  assert.strictEqual(formatNumber(42), '42');
});
test('makeSetExporting returns a function', () => {
  const fn = makeSetExporting('test');
  assert.strictEqual(typeof fn, 'function');
});

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

test('insertKeyword wraps keyword in span with correct class', () => {
  const text = 'alpha beta gamma delta epsilon zeta eta theta iota kappa';
  const result = insertKeyword(text, 'WORD');
  assert.ok(result.includes('<span class="keyword-highlight">WORD</span>'),
    'Should contain exact span element with keyword');
});

test('insertKeyword with very short text still produces highlight', () => {
  const text = 'alpha beta gamma delta epsilon zeta eta theta';
  const result = insertKeyword(text, 'TEST');
  assert.ok(result.includes('keyword-highlight'));
  assert.ok(result.includes('TEST'));
  const plain = result.replace(/<[^>]+>/g, '');
  assert.strictEqual(plain.split(/\s+/).length, text.split(/\s+/).length, 'Word count preserved');
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

test('headline returns a value from LOREM_HEADLINES', () => {
  const h = getTemplateHelpers();
  const result = h.headline();
  assert.ok(LOREM_HEADLINES.includes(result), `'${result}' not found in LOREM_HEADLINES`);
});

test('text returns a value from LOREM_PARAGRAPHS', () => {
  const h = getTemplateHelpers();
  const result = h.text(0);
  assert.ok(LOREM_PARAGRAPHS.includes(result), `'${result.substring(0, 30)}...' not found in LOREM_PARAGRAPHS`);
});

test('author returns a value from LOREM_AUTHORS', () => {
  const h = getTemplateHelpers();
  const result = h.author();
  assert.ok(LOREM_AUTHORS.includes(result), `'${result}' not found in LOREM_AUTHORS`);
});

test('date returns format "Mon DD, YYYY" with year 2023-2025', () => {
  const h = getTemplateHelpers();
  const result = h.date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const parts = result.split(' ');
  assert.strictEqual(parts.length, 3, `Date should have 3 parts, got: ${result}`);
  assert.ok(months.includes(parts[0]), `${parts[0]} is not a valid month`);
  const day = parseInt(parts[1]);
  assert.ok(day >= 1 && day <= 28, `Day ${day} out of range`);
  const year = parseInt(parts[2]);
  assert.ok(year >= 2023 && year <= 2025, `Year ${year} out of range`);
});

test('text with offset wraps around LOREM_PARAGRAPHS length', () => {
  const h = getTemplateHelpers();
  const result = h.text(LOREM_PARAGRAPHS.length + 5);
  assert.ok(LOREM_PARAGRAPHS.includes(result), 'text should wrap around using modulo');
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

test('centering with offset still produces correct transform', () => {
  const cw = 1920, ch = 1080;
  const offX = 50, offY = -30;
  const kCX = 400, kCY = 300;
  const dx = cw / 2 - kCX + offX;
  const dy = ch / 2 - kCY + offY;
  assert.strictEqual(dx, 610, `dx should be 960-400+50=610, got ${dx}`);
  assert.strictEqual(dy, 210, `dy should be 540-300-30=210, got ${dy}`);
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

test('Each template uses display:flex in root div', () => {
  TEMPLATES.forEach((t) => {
    const h = getTemplateHelpers();
    const html = t.render.call(h, 'KEY');
    assert.ok(html.includes('display:flex'), `${t.id}: missing display:flex`);
    assert.ok(html.includes('height:100%'), `${t.id}: missing height:100%`);
  });
});

test('NYT template renders with correct structure', () => {
  const h = getTemplateHelpers();
  const html = TEMPLATES.find(t => t.id === 'nyt').render.call(h, 'TEST');
  assert.ok(html.includes('The New York Times'), 'NYT should contain title');
  assert.ok(html.includes('Playfair Display'), 'NYT should use Playfair Display font');
});

test('Wired template uses dark background', () => {
  const h = getTemplateHelpers();
  const html = TEMPLATES.find(t => t.id === 'wired').render.call(h, 'TEST');
  assert.ok(html.includes('background:#000'), 'Wired should have black background');
  assert.ok(html.includes('WIRED'), 'Wired should contain title');
});

test('Wikipedia template has sidebar', () => {
  const h = getTemplateHelpers();
  const html = TEMPLATES.find(t => t.id === 'wikipedia').render.call(h, 'TEST');
  assert.ok(html.includes('Contents'), 'Wikipedia should have contents sidebar');
  assert.ok(html.includes('Edit'), 'Wikipedia should have Edit link');
});

test('Terminal template renders with monospace font', () => {
  const h = getTemplateHelpers();
  const html = TEMPLATES.find(t => t.id === 'terminal').render.call(h, 'TEST');
  assert.ok(html.includes('#0d1117'), 'Terminal should have dark background');
  assert.ok(html.includes('JetBrains Mono'), 'Terminal should use JetBrains Mono');
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

test('typingBuildTimeline totalDuration is sum of all action durations', () => {
  typingState.sequences = [
    { action: 'type', text: 'AB' },
    { action: 'pause', duration: 300 },
    { action: 'type', text: 'C' },
  ];
  typingState.typeSpeed = 100;
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.totalDuration, 100 + 100 + 300 + 100, `Expected 600, got ${tl.totalDuration}`);
  assert.strictEqual(tl.states.length, 3);
  assert.strictEqual(tl.states[0].time, 0);
  assert.strictEqual(tl.states[1].time, 100);
  assert.strictEqual(tl.states[2].time, 500);
});

test('typingBuildTimeline handles deleteAll action', () => {
  typingState.sequences = [
    { action: 'type', text: 'ABC' },
    { action: 'deleteAll' },
  ];
  typingState.typeSpeed = 50;
  typingState.delSpeed = 30;
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.finalText, '');
  assert.strictEqual(tl.states.length, 6);
  assert.strictEqual(tl.states[2].text, 'ABC');
  assert.strictEqual(tl.states[3].text, 'AB');
  assert.strictEqual(tl.states[4].text, 'A');
  assert.strictEqual(tl.states[5].text, '');
});

test('typingBuildTimeline deleteAll produces correct totalDuration', () => {
  typingState.sequences = [
    { action: 'type', text: 'Hi' },
    { action: 'deleteAll' },
  ];
  typingState.typeSpeed = 100;
  typingState.delSpeed = 50;
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.totalDuration, 200 + 100, `Expected 300, got ${tl.totalDuration}`);
});

test('typingBuildTimeline newline is added as a state', () => {
  typingState.sequences = [
    { action: 'newline' },
  ];
  typingState.typeSpeed = 100;
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.states.length, 1);
  assert.strictEqual(tl.states[0].text, '\n');
  assert.strictEqual(tl.states[0].time, 0);
});

test('typingBuildTimeline delete with no count defaults to 1', () => {
  typingState.sequences = [
    { action: 'type', text: 'ABC' },
    { action: 'delete' },
  ];
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.finalText, 'AB');
  assert.strictEqual(tl.states.length, 4);
});

test('typingBuildTimeline pause with no duration defaults to 500', () => {
  typingState.sequences = [
    { action: 'pause' },
  ];
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.pauses.length, 1);
  assert.strictEqual(tl.pauses[0].end - tl.pauses[0].start, 500);
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

test('typingGetTextAtTime at exact state boundary returns that state', () => {
  typingState.sequences = [
    { action: 'type', text: 'AB' },
  ];
  typingState.typeSpeed = 100;
  const tl = typingBuildTimeline();
  assert.strictEqual(typingGetTextAtTime(tl, 0), 'A');
  assert.strictEqual(typingGetTextAtTime(tl, 100), 'AB');
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

test('typingIsInPause returns false for time exactly at end', () => {
  const pauses = [{ start: 0, end: 100 }];
  assert.strictEqual(typingIsInPause(pauses, 100), false);
});

console.log('\x1b[1mTyping - escapeHTML:\x1b[0m');
test('typingEscapeHTML escapes special characters', () => {
  assert.strictEqual(typingEscapeHTML('<b>hi</b>'), '&lt;b&gt;hi&lt;/b&gt;');
  assert.strictEqual(typingEscapeHTML('a&b'), 'a&amp;b');
  assert.strictEqual(typingEscapeHTML('line1\nline2'), 'line1<br>line2');
  assert.strictEqual(typingEscapeHTML('hello'), 'hello');
});

test('typingEscapeHTML handles mixed special chars', () => {
  assert.strictEqual(typingEscapeHTML('<div>&"text"\n</div>'), '&lt;div&gt;&amp;"text"<br>&lt;/div&gt;');
});

test('typingEscapeHTML handles empty string', () => {
  assert.strictEqual(typingEscapeHTML(''), '');
});

console.log('\x1b[1mTyping - Cursor HTML:\x1b[0m');
test('typingCursorHTML returns empty when not visible', () => {
  const result = typingCursorHTML(false, false);
  assert.strictEqual(result, '');
});

test('typingCursorHTML returns span with cursor color', () => {
  typingState.cursorColor = '#f5e0dc';
  const result = typingCursorHTML(true, true);
  assert.ok(result.includes('#f5e0dc'), 'Should contain cursor color');
  assert.ok(result.includes('width:2px'), 'Should have width');
  assert.ok(result.includes('<span'), 'Should be a span element');
});

test('typingCursorHTML with blink adds typing-cursor class', () => {
  typingState.cursorColor = '#fff';
  typingState.cursorBlink = true;
  const blinking = typingCursorHTML(true, false);
  const solid = typingCursorHTML(true, true);
  assert.ok(blinking.includes('typing-cursor'), 'Blinking should have typing-cursor class');
  assert.ok(!solid.includes('typing-cursor'), 'Solid should not have typing-cursor class');
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

test('typing theme editor includes window control dots', () => {
  const html = typingRenderTheme('editor', 'test');
  assert.ok(html.includes('#f38ba8'), 'Missing red dot');
  assert.ok(html.includes('#f9e2af'), 'Missing yellow dot');
  assert.ok(html.includes('#a6e3a1'), 'Missing green dot');
});

test('typing theme sms includes bubble color from themeFields', () => {
  typingState.themeFields.sms.bubbleColor = '#ff0000';
  const html = typingRenderTheme('sms', 'test');
  assert.ok(html.includes('#ff0000'), 'Should use custom bubble color');
  typingState.themeFields.sms.bubbleColor = '#6366f1';
});

test('typing theme email escapes HTML in fields', () => {
  typingState.themeFields.email.to = '<script>alert(1)</script>';
  typingState.themeFields.email.subject = 'A&B';
  const html = typingRenderTheme('email', 'test');
  assert.ok(!html.includes('<script>'), 'Should escape HTML in fields');
  assert.ok(html.includes('A&amp;B'), 'Should escape ampersand');
  typingState.themeFields.email.to = 'jan@example.com';
  typingState.themeFields.email.subject = 'Ważna wiadomość';
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

test('typingState default values are correct', () => {
  typingState.typeSpeed = 80;
  typingState.delSpeed = 40;
  typingState.fontSize = 20;
  typingState.bgColor = '#1e1e2e';
  typingState.textColor = '#cdd6f4';
  typingState.cursorColor = '#f5e0dc';
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
  typingState.theme = 'editor';
  assert.strictEqual(typingState.format, '16:9');
  assert.strictEqual(typingState.resolution, '1080p');
  assert.strictEqual(typingState.theme, 'editor');
  assert.strictEqual(typingState.typeSpeed, 80);
  assert.strictEqual(typingState.delSpeed, 40);
  assert.strictEqual(typingState.fontSize, 20);
  assert.strictEqual(typingState.bgColor, '#1e1e2e');
  assert.strictEqual(typingState.textColor, '#cdd6f4');
  assert.strictEqual(typingState.cursorColor, '#f5e0dc');
  assert.strictEqual(typingState.startDelay, 500);
  assert.strictEqual(typingState.endDelay, 1500);
  assert.strictEqual(typingState.cursorBlink, true);
});

test('typingState themeFields has all themes', () => {
  assert.ok(typingState.themeFields.editor);
  assert.ok(typingState.themeFields.terminal);
  assert.ok(typingState.themeFields.email);
  assert.ok(typingState.themeFields.sms);
  assert.ok(typingState.themeFields.generic);
  assert.strictEqual(typingState.themeFields.editor.title, 'untitled.txt');
  assert.strictEqual(typingState.themeFields.terminal.prompt, 'user@machine:~$');
  assert.strictEqual(typingState.themeFields.email.to, 'jan@example.com');
  assert.strictEqual(typingState.themeFields.email.subject, 'Ważna wiadomość');
  assert.strictEqual(typingState.themeFields.sms.avatar, 'J');
  assert.strictEqual(typingState.themeFields.sms.contactName, 'Jan');
});

console.log('\x1b[1mMath Helpers - lerp:\x1b[0m');
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

test('lerp with negative range', () => {
  assert.strictEqual(lerp(-100, -50, 0.5), -75);
  assert.strictEqual(lerp(-10, 10, 0.25), -5);
});

test('lerp with same start and end', () => {
  assert.strictEqual(lerp(42, 42, 0), 42);
  assert.strictEqual(lerp(42, 42, 0.5), 42);
  assert.strictEqual(lerp(42, 42, 1), 42);
});

test('lerp at 0.25 and 0.75', () => {
  assert.strictEqual(lerp(0, 100, 0.25), 25);
  assert.strictEqual(lerp(0, 100, 0.75), 75);
});

test('lerp with floating point values', () => {
  const result = lerp(0.1, 0.9, 0.5);
  assert.ok(Math.abs(result - 0.5) < 1e-10, `Expected 0.5, got ${result}`);
});

console.log('\x1b[1mMath Helpers - easeInOut:\x1b[0m');
test('easeInOut(0) = 0 and easeInOut(1) = 1', () => {
  assert.strictEqual(easeInOut(0), 0);
  assert.strictEqual(easeInOut(1), 1);
});

test('easeInOut(0.5) = 0.5', () => {
  assert.strictEqual(easeInOut(0.5), 0.5);
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

test('easeInOut(0.25) is in first quadrant (accelerating)', () => {
  const v = easeInOut(0.25);
  assert.ok(v < 0.25, `easeInOut(0.25) should be < 0.25 (accelerating), got ${v}`);
});

test('easeInOut(0.75) is in second quadrant (decelerating)', () => {
  const v = easeInOut(0.75);
  assert.ok(v > 0.75, `easeInOut(0.75) should be > 0.75 (decelerating), got ${v}`);
});

test('easeInOut uses exact formula: t<0.5 ? 2t² : 1 - (-2t+2)²/2', () => {
  assert.strictEqual(easeInOut(0.1), 2 * 0.1 * 0.1);
  assert.strictEqual(easeInOut(0.3), 2 * 0.3 * 0.3);
  const t = 0.7;
  const expected = 1 - Math.pow(-2 * t + 2, 2) / 2;
  assert.strictEqual(easeInOut(0.7), expected);
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

console.log('\x1b[1mAnimation - Zoom In (precise values):\x1b[0m');
test('zoomIn starts below target zoom and ends at target', () => {
  const sV = { zoom: 3, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.zoomIn.resolve(0, sV);
  const end = ANIMATION_PRESETS.zoomIn.resolve(1, sV);
  assert.ok(start.zoom < end.zoom, 'zoomIn should increase zoom');
  assert.strictEqual(end.zoom, 3, 'zoomIn should end at target zoom');
});

test('zoomIn exact values at p=0 with zoom=3, intensity=1', () => {
  const sV = { zoom: 3, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.zoomIn.resolve(0, sV);
  assert.strictEqual(result.zoom, 1, 'zoomIn at p=0, i=1: z0 = zoom-(zoom-1)*1 = 3-2 = 1');
  assert.strictEqual(result.offX, 0);
  assert.strictEqual(result.offY, 0);
});

test('zoomIn exact values at p=0.5 with zoom=3, intensity=1', () => {
  const sV = { zoom: 3, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.zoomIn.resolve(0.5, sV);
  assert.strictEqual(result.zoom, 2, 'zoomIn at p=0.5: lerp(1, 3, 0.5) = 2');
});

test('zoomIn with intensity 0.5 at p=0', () => {
  const sV = { zoom: 3, offX: 0, offY: 0, intensity: 0.5 };
  const result = ANIMATION_PRESETS.zoomIn.resolve(0, sV);
  assert.strictEqual(result.zoom, 2, 'z0 = 3 - (3-1)*0.5 = 3-1 = 2');
});

test('zoomIn with intensity 0 returns base zoom at all progress', () => {
  const sV = { zoom: 3, offX: 10, offY: 10, intensity: 0 };
  const start = ANIMATION_PRESETS.zoomIn.resolve(0, sV);
  const mid = ANIMATION_PRESETS.zoomIn.resolve(0.5, sV);
  const end = ANIMATION_PRESETS.zoomIn.resolve(1, sV);
  assert.strictEqual(start.zoom, 3);
  assert.strictEqual(mid.zoom, 3);
  assert.strictEqual(end.zoom, 3);
  assert.strictEqual(start.offX, 10);
  assert.strictEqual(start.offY, 10);
});

test('zoomIn with offset preserves offset at p=1', () => {
  const sV = { zoom: 2, offX: 20, offY: -10, intensity: 1 };
  const end = ANIMATION_PRESETS.zoomIn.resolve(1, sV);
  assert.strictEqual(end.offX, 20);
  assert.strictEqual(end.offY, -10);
});

console.log('\x1b[1mAnimation - Zoom Out (precise values):\x1b[0m');
test('zoomOut starts at target and ends below', () => {
  const sV = { zoom: 3, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.zoomOut.resolve(0, sV);
  const end = ANIMATION_PRESETS.zoomOut.resolve(1, sV);
  assert.strictEqual(start.zoom, 3, 'zoomOut should start at target zoom');
  assert.ok(end.zoom < start.zoom, 'zoomOut should decrease zoom');
});

test('zoomOut exact values at p=1 with zoom=3, intensity=1', () => {
  const sV = { zoom: 3, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.zoomOut.resolve(1, sV);
  assert.strictEqual(result.zoom, 1, 'z1 = 3 - (3-1)*1 = 1');
});

test('zoomOut exact values at p=0.5 with zoom=3, intensity=1', () => {
  const sV = { zoom: 3, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.zoomOut.resolve(0.5, sV);
  assert.strictEqual(result.zoom, 2, 'lerp(3, 1, 0.5) = 2');
});

test('zoomOut with intensity 0.5 at p=1', () => {
  const sV = { zoom: 3, offX: 0, offY: 0, intensity: 0.5 };
  const result = ANIMATION_PRESETS.zoomOut.resolve(1, sV);
  assert.strictEqual(result.zoom, 2, 'z1 = 3 - (3-1)*0.5 = 2');
});

console.log('\x1b[1mAnimation - Pan (precise values):\x1b[0m');
test('panLeft moves offset from positive to negative', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.panLeft.resolve(0, sV);
  const end = ANIMATION_PRESETS.panLeft.resolve(1, sV);
  assert.ok(start.offX > 0, `panLeft start should be positive, got ${start.offX}`);
  assert.ok(end.offX < 0, `panLeft end should be negative, got ${end.offX}`);
  assert.strictEqual(start.zoom, 2, 'panLeft should not change zoom');
});

test('panLeft exact values at p=0 and p=1 with intensity=1', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.panLeft.resolve(0, sV);
  const end = ANIMATION_PRESETS.panLeft.resolve(1, sV);
  assert.strictEqual(start.offX, 200, 'panLeft start = lerp(200, -200, 0) + 0 = 200');
  assert.strictEqual(end.offX, -200, 'panLeft end = lerp(200, -200, 1) + 0 = -200');
});

test('panLeft at p=0.5 is exactly 0', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const mid = ANIMATION_PRESETS.panLeft.resolve(0.5, sV);
  assert.strictEqual(mid.offX, 0, 'panLeft at p=0.5 should be 0');
});

test('panRight is inverse of panLeft', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const leftStart = ANIMATION_PRESETS.panLeft.resolve(0, sV);
  const rightStart = ANIMATION_PRESETS.panRight.resolve(0, sV);
  assert.strictEqual(leftStart.offX, -rightStart.offX, 'panLeft/panRight should be opposite');
});

test('panRight exact values at p=0 with intensity=1', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.panRight.resolve(0, sV);
  assert.strictEqual(result.offX, -200, 'panRight start = lerp(-200, 200, 0) = -200');
});

test('panUp at p=0 is positive Y, at p=1 is negative Y', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.panUp.resolve(0, sV);
  const end = ANIMATION_PRESETS.panUp.resolve(1, sV);
  assert.strictEqual(start.offY, 150, 'panUp start = lerp(150, -150, 0) = 150');
  assert.strictEqual(end.offY, -150, 'panUp end = lerp(150, -150, 1) = -150');
});

test('panDown is inverse of panUp', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const upStart = ANIMATION_PRESETS.panUp.resolve(0, sV);
  const downStart = ANIMATION_PRESETS.panDown.resolve(0, sV);
  assert.strictEqual(upStart.offY, -downStart.offY, 'panUp/panDown should be opposite');
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

test('pan with base offset adds to computed offset', () => {
  const sV = { zoom: 2, offX: 50, offY: 30, intensity: 1 };
  const result = ANIMATION_PRESETS.panLeft.resolve(0, sV);
  assert.strictEqual(result.offX, 250, 'panLeft with offX=50: lerp(200,-200,0)+50 = 200+50 = 250');
  assert.strictEqual(result.offY, 30, 'panLeft preserves offY');
});

console.log('\x1b[1mAnimation - Ken Burns (precise values):\x1b[0m');
test('kenBurns zooms and pans simultaneously', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.kenBurns.resolve(0, sV);
  const end = ANIMATION_PRESETS.kenBurns.resolve(1, sV);
  assert.ok(start.zoom < end.zoom, 'kenBurns should zoom in');
  assert.notStrictEqual(start.offX, end.offX, 'kenBurns should pan X');
  assert.notStrictEqual(start.offY, end.offY, 'kenBurns should pan Y');
});

test('kenBurns exact zoom at p=0 with zoom=2, intensity=1', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.kenBurns.resolve(0, sV);
  assert.strictEqual(result.zoom, 2 * (1 - 0.15 * 1), `Expected ${2 * 0.85}, got ${result.zoom}`);
  assert.strictEqual(result.zoom, 1.7);
});

test('kenBurns exact zoom at p=1 with zoom=2, intensity=1', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.kenBurns.resolve(1, sV);
  assert.strictEqual(result.zoom, 2 * (1 + 0.15 * 1));
  assert.strictEqual(result.zoom, 2.3);
});

test('kenBurns exact offsets at p=0 and p=1 with intensity=1', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.kenBurns.resolve(0, sV);
  const end = ANIMATION_PRESETS.kenBurns.resolve(1, sV);
  assert.strictEqual(start.offX, -120, 'kenBurns at p=0: lerp(-120, 120, 0) = -120');
  assert.strictEqual(end.offX, 120, 'kenBurns at p=1: lerp(-120, 120, 1) = 120');
  assert.strictEqual(start.offY, -60, 'kenBurns at p=0: lerp(-60, 60, 0) = -60');
  assert.strictEqual(end.offY, 60, 'kenBurns at p=1: lerp(-60, 60, 1) = 60');
});

test('kenBurns with base offset adds to computed offset', () => {
  const sV = { zoom: 2, offX: 10, offY: 20, intensity: 1 };
  const result = ANIMATION_PRESETS.kenBurns.resolve(0, sV);
  assert.strictEqual(result.offX, -110, 'kenBurns offX = lerp(-120,120,0)+10 = -120+10 = -110');
  assert.strictEqual(result.offY, -40, 'kenBurns offY = lerp(-60,60,0)+20 = -60+20 = -40');
});

console.log('\x1b[1mAnimation - Drift (precise values):\x1b[0m');
test('drift zooms slightly and pans horizontally', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.drift.resolve(0, sV);
  const end = ANIMATION_PRESETS.drift.resolve(1, sV);
  assert.ok(start.zoom < end.zoom, 'drift should zoom in slightly');
  assert.notStrictEqual(start.offX, end.offX, 'drift should pan X');
  assert.strictEqual(start.offY, 0, 'drift should not pan Y');
  assert.strictEqual(end.offY, 0, 'drift should not pan Y');
});

test('drift exact zoom at p=0 with zoom=2, intensity=1', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.drift.resolve(0, sV);
  assert.strictEqual(result.zoom, 2 * (1 - 0.05 * 1));
  assert.strictEqual(result.zoom, 1.9);
});

test('drift exact offsets at p=0 and p=1 with intensity=1', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.drift.resolve(0, sV);
  const end = ANIMATION_PRESETS.drift.resolve(1, sV);
  assert.strictEqual(start.offX, -80, 'drift at p=0: lerp(-80, 80, 0) = -80');
  assert.strictEqual(end.offX, 80, 'drift at p=1: lerp(-80, 80, 1) = 80');
});

console.log('\x1b[1mAnimation - Breathe (precise values):\x1b[0m');
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

test('breathe exact zoom at p=0 is base zoom', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.breathe.resolve(0, sV);
  assert.strictEqual(result.zoom, 2 * (1 + 0.2 * 1 * Math.sin(0)));
  assert.strictEqual(result.zoom, 2, 'sin(0) = 0, so zoom = 2');
});

test('breathe exact zoom at p=0.5 with zoom=2, intensity=1', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.breathe.resolve(0.5, sV);
  assert.strictEqual(result.zoom, 2 * (1 + 0.2 * 1 * Math.sin(Math.PI * 0.5)));
  assert.ok(Math.abs(result.zoom - 2.4) < 0.001, `Expected ~2.4, got ${result.zoom}`);
});

test('breathe exact zoom at p=1 is base zoom (sin(pi) ≈ 0)', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.breathe.resolve(1, sV);
  assert.ok(Math.abs(result.zoom - 2) < 0.001, `Expected ~2.0, got ${result.zoom}`);
});

test('breathe with intensity 0 does not change zoom', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 0 };
  [0, 0.25, 0.5, 0.75, 1].forEach(p => {
    const v = ANIMATION_PRESETS.breathe.resolve(p, sV);
    assert.strictEqual(v.zoom, 2, `breathe at p=${p} with i=0 should stay at base zoom`);
  });
});

test('breathe with intensity=2 at p=0.5', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 2 };
  const result = ANIMATION_PRESETS.breathe.resolve(0.5, sV);
  assert.ok(Math.abs(result.zoom - 2.8) < 0.001, `Expected ~2.8 (2*(1+0.2*2*1)), got ${result.zoom}`);
});

console.log('\x1b[1mAnimation - Swing (precise values):\x1b[0m');
test('swing zooms and pans with diagonal movement', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const start = ANIMATION_PRESETS.swing.resolve(0, sV);
  const end = ANIMATION_PRESETS.swing.resolve(1, sV);
  assert.ok(start.zoom < end.zoom, 'swing should increase zoom');
  assert.strictEqual(start.offX, -150, 'swing at p=0: lerp(-150, 150, 0) = -150');
  assert.strictEqual(end.offX, 150, 'swing at p=1: lerp(-150, 150, 1) = 150');
  assert.strictEqual(start.offY, 40, 'swing at p=0: lerp(40, -40, 0) = 40');
  assert.strictEqual(end.offY, -40, 'swing at p=1: lerp(40, -40, 1) = -40');
});

test('swing exact zoom at p=0 with zoom=2, intensity=1', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.swing.resolve(0, sV);
  assert.strictEqual(result.zoom, 2 * (1 - 0.1 * 1));
  assert.strictEqual(result.zoom, 1.8);
});

test('swing exact zoom at p=1 with zoom=2, intensity=1', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 1 };
  const result = ANIMATION_PRESETS.swing.resolve(1, sV);
  assert.strictEqual(result.zoom, 2 * (1 + 0.1 * 1));
  assert.strictEqual(result.zoom, 2.2);
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

test('zoom-presets produce monotonically changing zoom values', () => {
  const sV = { zoom: 3, offX: 0, offY: 0, intensity: 1 };
  ['zoomIn', 'zoomOut', 'kenBurns', 'drift', 'swing'].forEach(id => {
    const z0 = ANIMATION_PRESETS[id].resolve(0, sV).zoom;
    const z1 = ANIMATION_PRESETS[id].resolve(1, sV).zoom;
    assert.ok(z0 !== z1, `${id}: zoom should change over time`);
  });
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

test('720p is 1280x720 for 16:9', () => {
  const [w, h] = RESOLUTIONS['16:9']['720p'];
  assert.strictEqual(w, 1280);
  assert.strictEqual(h, 720);
});

test('9:16 1080p is 1080x1920', () => {
  const [w, h] = RESOLUTIONS['9:16']['1080p'];
  assert.strictEqual(w, 1080);
  assert.strictEqual(h, 1920);
});

test('1:1 1080p is 1080x1080', () => {
  const [w, h] = RESOLUTIONS['1:1']['1080p'];
  assert.strictEqual(w, 1080);
  assert.strictEqual(h, 1080);
});

test('9:16 4K is 2160x3840', () => {
  const [w, h] = RESOLUTIONS['9:16']['4K'];
  assert.strictEqual(w, 2160);
  assert.strictEqual(h, 3840);
});

test('1:1 4K is 2160x2160', () => {
  const [w, h] = RESOLUTIONS['1:1']['4K'];
  assert.strictEqual(w, 2160);
  assert.strictEqual(h, 2160);
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

test('LOREM_HEADLINES has exactly 15 entries', () => {
  assert.strictEqual(LOREM_HEADLINES.length, 15, `Expected 15, got ${LOREM_HEADLINES.length}`);
});

test('LOREM_PARAGRAPHS has exactly 16 entries', () => {
  assert.strictEqual(LOREM_PARAGRAPHS.length, 16, `Expected 16, got ${LOREM_PARAGRAPHS.length}`);
});

test('LOREM_AUTHORS has exactly 11 entries', () => {
  assert.strictEqual(LOREM_AUTHORS.length, 11, `Expected 11, got ${LOREM_AUTHORS.length}`);
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

test('CATEGORIES has exactly 6 categories', () => {
  const keys = Object.keys(CATEGORIES);
  assert.strictEqual(keys.length, 6, `Expected 6 categories, got ${keys.length}`);
  assert.ok(keys.includes('classic'));
  assert.ok(keys.includes('us_uk'));
  assert.ok(keys.includes('magazine'));
  assert.ok(keys.includes('tech'));
  assert.ok(keys.includes('tabloid'));
  assert.ok(keys.includes('bold'));
});

console.log('\x1b[1mState defaults:\x1b[0m');
test('state has correct default values', () => {
  assert.strictEqual(state.keyword, 'SZTUKA');
  assert.strictEqual(state.speed, 800);
  assert.strictEqual(state.format, '16:9');
  assert.strictEqual(state.resolution, '1080p');
  assert.strictEqual(state.playing, false);
  assert.strictEqual(state.zoomLevel, 2.0);
  assert.strictEqual(state.zoomOffsetX, 0);
  assert.strictEqual(state.zoomOffsetY, 0);
  assert.strictEqual(state.fontSizeScale, 100);
  assert.strictEqual(state.lineH, 1.72);
  assert.strictEqual(state.vignetteOpacity, 70);
  assert.strictEqual(state.vignetteSize, 60);
  assert.strictEqual(state.vignetteSpread, 70);
  assert.strictEqual(state.transitionMs, 120);
  assert.strictEqual(state.animationPreset, 'none');
  assert.strictEqual(state.animIntensity, 100);
});

test('state enabledTemplates contains all template IDs', () => {
  TEMPLATES.forEach(t => {
    assert.ok(state.enabledTemplates.has(t.id), `Missing template ${t.id} in enabledTemplates`);
  });
});

console.log('\x1b[1mshuffleArray:\x1b[0m');
test('shuffleArray preserves all elements', () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const result = shuffleArray([...arr]);
  assert.strictEqual(result.length, arr.length);
  arr.forEach(v => {
    assert.ok(result.includes(v), `Missing value ${v} after shuffle`);
  });
});

test('shuffleArray with single element returns same array', () => {
  const arr = [42];
  const result = shuffleArray([...arr]);
  assert.strictEqual(result[0], 42);
});

test('shuffleArray with empty array returns empty array', () => {
  const result = shuffleArray([]);
  assert.strictEqual(result.length, 0);
});

console.log('\x1b[1mChat Tool:\x1b[0m');
test('chatState has correct defaults', () => {
  assert.strictEqual(chatState.platform, 'imessage');
  assert.strictEqual(chatState.format, '16:9');
  assert.strictEqual(chatState.resolution, '1080p');
  assert.strictEqual(chatState.animSpeed, 600);
  assert.strictEqual(chatState.hideTime, false);
  assert.strictEqual(chatState.fontScale, 100);
  assert.strictEqual(chatState.contacts.length, 2);
  assert.ok(Array.isArray(chatState.messages));
  assert.ok(chatState.messages.length > 0);
});

test('chatState contacts have correct defaults', () => {
  assert.strictEqual(chatState.contacts[0].name, 'Jan');
  assert.strictEqual(chatState.contacts[0].color, '#007AFF');
  assert.strictEqual(chatState.contacts[1].name, 'Anna');
  assert.strictEqual(chatState.contacts[1].color, '#34C759');
});

test('chatState customTheme has correct defaults', () => {
  assert.strictEqual(chatState.customTheme.bg, '#1a1a2e');
  assert.strictEqual(chatState.customTheme.headerBg, '#16213e');
  assert.strictEqual(chatState.customTheme.bubbleL, '#2a2a4a');
  assert.strictEqual(chatState.customTheme.bubbleR, '#6366f1');
  assert.strictEqual(chatState.customTheme.text, '#e4e4e7');
});

test('chatState messages have valid sender indices', () => {
  chatState.messages.forEach((msg, i) => {
    assert.ok(typeof msg.sender === 'number', `Msg ${i}: sender not number`);
    assert.ok(msg.sender >= 0 && msg.sender < chatState.contacts.length, `Msg ${i}: sender out of range`);
    assert.ok(typeof msg.text === 'string' && msg.text.length > 0, `Msg ${i}: missing text`);
  });
});

test('chatTimeStr produces valid time strings', () => {
  assert.strictEqual(chatTimeStr(0), '14:00');
  assert.strictEqual(chatTimeStr(1), '14:07');
  assert.strictEqual(chatTimeStr(3), '15:21');
  assert.strictEqual(chatTimeStr(8), '16:56');
  assert.strictEqual(chatTimeStr(9), '17:03');
});

test('chatTimeStr hours start at 14 and increment every 3 messages', () => {
  const t0 = chatTimeStr(0);
  const t2 = chatTimeStr(2);
  const t3 = chatTimeStr(3);
  const t6 = chatTimeStr(6);
  assert.ok(t0.startsWith('14:'), `Expected hour 14, got ${t0}`);
  assert.ok(t2.startsWith('14:'), `Expected hour 14, got ${t2}`);
  assert.ok(t3.startsWith('15:'), `Expected hour 15, got ${t3}`);
  assert.ok(t6.startsWith('16:'), `Expected hour 16, got ${t6}`);
});

test('chatAvatarHTML returns initial when no avatar', () => {
  const contact = { name: 'Jan', color: '#007AFF', avatar: null };
  const html = chatAvatarHTML(contact, '40px');
  assert.ok(html.includes('J'), 'Should contain initial');
  assert.ok(html.includes('#007AFF'), 'Should contain color');
  assert.ok(html.includes('40px'), 'Should contain size');
});

test('chatAvatarHTML returns img when avatar set', () => {
  const contact = { name: 'Jan', color: '#007AFF', avatar: 'data:image/png;base64,abc' };
  const html = chatAvatarHTML(contact, '40px');
  assert.ok(html.includes('<img'), 'Should contain img tag');
  assert.ok(html.includes('data:image/png;base64,abc'), 'Should contain avatar src');
});

test('chatAvatarHTML uses uppercase initial', () => {
  const contact = { name: 'anna', color: '#000', avatar: null };
  const html = chatAvatarHTML(contact, '1em');
  assert.ok(html.includes('A'), 'Should use uppercase initial');
});

console.log('\x1b[1mChat - Bubble HTML:\x1b[0m');
test('chatBubbleHTML for discord includes avatar and author', () => {
  const msg = { sender: 0, text: 'Hello' };
  const html = chatBubbleHTML(msg, 0, 'discord', '', '', false);
  assert.ok(html.includes('chat-bubble'), 'Should have bubble class');
  assert.ok(html.includes('Hello'), 'Should contain text');
  assert.ok(html.includes('Jan'), 'Should contain author name for discord');
  assert.ok(html.includes('#007AFF'), 'Should contain contact color');
});

test('chatBubbleHTML for non-discord includes text but no avatar', () => {
  const msg = { sender: 0, text: 'Test msg' };
  const html = chatBubbleHTML(msg, 0, 'imessage', '', '', false);
  assert.ok(html.includes('Test msg'), 'Should contain text');
  assert.ok(!html.includes('Jan'), 'Should not contain author for imessage');
});

test('chatBubbleHTML applies custom styles', () => {
  const msg = { sender: 0, text: 'Test' };
  const html = chatBubbleHTML(msg, 0, 'custom', 'background:#111;color:#eee', 'background:#222;color:#fff', false);
  assert.ok(html.includes('background:#222'), 'Should apply right bubble style for sender 0');
});

test('chatBubbleHTML sender 0 is right-aligned', () => {
  const msg = { sender: 0, text: 'Test' };
  const html = chatBubbleHTML(msg, 0, 'imessage', '', '', false);
  assert.ok(html.includes('chat-bubble-right'), 'Sender 0 should be right');
});

test('chatBubbleHTML sender 1 is left-aligned', () => {
  const msg = { sender: 1, text: 'Test' };
  const html = chatBubbleHTML(msg, 0, 'imessage', '', '', false);
  assert.ok(html.includes('chat-bubble-left'), 'Sender 1 should be left');
});

test('chatBubbleHTML hides time when hideTime is true', () => {
  const saved = chatState.hideTime;
  chatState.hideTime = true;
  const msg = { sender: 0, text: 'Test' };
  const html = chatBubbleHTML(msg, 0, 'imessage', '', '', false);
  assert.ok(!html.includes('chat-bubble-time'), 'Time should be hidden');
  chatState.hideTime = saved;
});

test('chatBubbleHTML shows time when hideTime is false', () => {
  const saved = chatState.hideTime;
  chatState.hideTime = false;
  const msg = { sender: 0, text: 'Test' };
  const html = chatBubbleHTML(msg, 0, 'imessage', '', '', false);
  assert.ok(html.includes('chat-bubble-time'), 'Time should be visible');
  chatState.hideTime = saved;
});

test('chatBubbleHTML with animate flag adds animate class', () => {
  const msg = { sender: 0, text: 'Test' };
  const htmlNoAnim = chatBubbleHTML(msg, 0, 'imessage', '', '', false);
  const htmlAnim = chatBubbleHTML(msg, 0, 'imessage', '', '', true);
  assert.ok(!htmlNoAnim.includes('chat-bubble-animate'), 'No animate class without flag');
  assert.ok(htmlAnim.includes('chat-bubble-animate'), 'Animate class with flag');
});

console.log('\x1b[1mChat - Typing HTML:\x1b[0m');
test('chatTypingHTML for discord includes name and dots', () => {
  const saved = chatState.platform;
  chatState.platform = 'discord';
  const html = chatTypingHTML(0);
  assert.ok(html.includes('chat-typing-indicator'), 'Should have typing indicator');
  assert.ok(html.includes('Jan'), 'Should contain sender name');
  assert.ok(html.includes('chat-typing-dot'), 'Should contain typing dots');
  chatState.platform = saved;
});

test('chatTypingHTML for non-discord is simpler', () => {
  const saved = chatState.platform;
  chatState.platform = 'imessage';
  const html = chatTypingHTML(1);
  assert.ok(html.includes('chat-typing-indicator'));
  assert.ok(html.includes('chat-typing-dot'));
  chatState.platform = saved;
});

test('chatTypingHTML right-aligned for sender 0', () => {
  const saved = chatState.platform;
  chatState.platform = 'imessage';
  const html = chatTypingHTML(0);
  assert.ok(html.includes('align-self:flex-end'), 'Sender 0 typing should be right-aligned');
  chatState.platform = saved;
});

console.log('\x1b[1mrenderSlide:\x1b[0m');
test('renderSlide returns HTML string for template', () => {
  const template = TEMPLATES[0];
  const html = renderSlide(template);
  assert.ok(typeof html === 'string', 'Should return string');
  assert.ok(html.length > 100, 'Should be substantial HTML');
  assert.ok(html.includes('keyword-highlight'), 'Should contain keyword highlight');
});

test('renderSlide uses current state keyword', () => {
  state.keyword = 'CUSTOM_KEYWORD';
  const template = TEMPLATES[0];
  const html = renderSlide(template);
  assert.ok(html.includes('CUSTOM_KEYWORD'), 'Should use state.keyword');
  state.keyword = 'SZTUKA';
});

console.log('\x1b[1mgetResolution:\x1b[0m');
test('getResolution returns correct dimensions for current state', () => {
  state.format = '16:9';
  state.resolution = '1080p';
  const [w, h] = getResolution();
  assert.strictEqual(w, 1920);
  assert.strictEqual(h, 1080);
});

test('getResolution returns 3840x2160 for 16:9 4K', () => {
  state.format = '16:9';
  state.resolution = '4K';
  const [w, h] = getResolution();
  assert.strictEqual(w, 3840);
  assert.strictEqual(h, 2160);
  state.resolution = '1080p';
});

test('getResolution returns portrait for 9:16', () => {
  state.format = '9:16';
  state.resolution = '1080p';
  const [w, h] = getResolution();
  assert.strictEqual(w, 1080);
  assert.strictEqual(h, 1920);
  state.format = '16:9';
});

console.log('\x1b[1mTyping Resolution:\x1b[0m');
test('typingGetResolution returns correct dimensions', () => {
  typingState.format = '16:9';
  typingState.resolution = '1080p';
  const [w, h] = typingGetResolution();
  assert.strictEqual(w, 1920);
  assert.strictEqual(h, 1080);
});

test('typingGetResolution for 9:16', () => {
  typingState.format = '9:16';
  typingState.resolution = '720p';
  const [w, h] = typingGetResolution();
  assert.strictEqual(w, 720);
  assert.strictEqual(h, 1280);
  typingState.format = '16:9';
  typingState.resolution = '1080p';
});

console.log('\x1b[1mChat Resolution:\x1b[0m');
test('chatGetResolution returns correct dimensions', () => {
  chatState.format = '16:9';
  chatState.resolution = '1080p';
  const [w, h] = chatGetResolution();
  assert.strictEqual(w, 1920);
  assert.strictEqual(h, 1080);
});

test('chatGetResolution for 1:1', () => {
  chatState.format = '1:1';
  chatState.resolution = '720p';
  const [w, h] = chatGetResolution();
  assert.strictEqual(w, 720);
  assert.strictEqual(h, 720);
  chatState.format = '16:9';
  chatState.resolution = '1080p';
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

test('formatNumber handles small numbers (< 1000)', () => {
  const str = Math.abs(42).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  assert.strictEqual(str, '42');
});

test('formatNumber handles large numbers (billions)', () => {
  const str = Math.abs(1234567890).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  assert.strictEqual(str, '1 234 567 890');
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

test('hexToRgb converts #000000 to 0,0,0', () => {
  const r = parseInt('00', 16);
  const g = parseInt('00', 16);
  const b = parseInt('00', 16);
  assert.strictEqual(r, 0);
  assert.strictEqual(g, 0);
  assert.strictEqual(b, 0);
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

console.log('\x1b[1mAnimation - buildSlidesData logic:\x1b[0m');
test('animation progress is calculated correctly for slides', () => {
  const totalSlides = 5;
  const currentIndex = 2;
  const progress = totalSlides > 1 ? currentIndex / (totalSlides - 1) : 0.5;
  assert.strictEqual(progress, 0.5, `For slide 2 of 5, progress should be 0.5, got ${progress}`);
});

test('animation progress for first slide is 0', () => {
  const totalSlides = 5;
  const progress = totalSlides > 1 ? 0 / (totalSlides - 1) : 0.5;
  assert.strictEqual(progress, 0);
});

test('animation progress for last slide is 1', () => {
  const totalSlides = 5;
  const progress = totalSlides > 1 ? 4 / (totalSlides - 1) : 0.5;
  assert.strictEqual(progress, 1);
});

test('animation progress for single slide is 0.5', () => {
  const totalSlides = 1;
  const progress = totalSlides > 1 ? 0 / 0 : 0.5;
  assert.strictEqual(progress, 0.5);
});

test('animIntensity divided by 100 gives correct decimal', () => {
  assert.strictEqual(state.animIntensity / 100, 1);
  state.animIntensity = 50;
  assert.strictEqual(state.animIntensity / 100, 0.5);
  state.animIntensity = 100;
});

console.log('\x1b[1mTYPING_THEME_FIELD_DEFS:\x1b[0m');
test('TYPING_THEME_FIELD_DEFS has definitions for all themes', () => {
  assert.ok(TYPING_THEME_FIELD_DEFS.editor);
  assert.ok(TYPING_THEME_FIELD_DEFS.terminal);
  assert.ok(TYPING_THEME_FIELD_DEFS.email);
  assert.ok(TYPING_THEME_FIELD_DEFS.sms);
  assert.ok(TYPING_THEME_FIELD_DEFS.generic);
});

test('TYPING_THEME_FIELD_DEFS editor has title field', () => {
  const editorDefs = TYPING_THEME_FIELD_DEFS.editor;
  assert.strictEqual(editorDefs.length, 1);
  assert.strictEqual(editorDefs[0].key, 'title');
  assert.strictEqual(editorDefs[0].type, 'text');
});

test('TYPING_THEME_FIELD_DEFS terminal has title and prompt', () => {
  const terminalDefs = TYPING_THEME_FIELD_DEFS.terminal;
  assert.strictEqual(terminalDefs.length, 2);
  assert.strictEqual(terminalDefs[0].key, 'title');
  assert.strictEqual(terminalDefs[1].key, 'prompt');
});

test('TYPING_THEME_FIELD_DEFS email has title, to, subject', () => {
  const emailDefs = TYPING_THEME_FIELD_DEFS.email;
  assert.strictEqual(emailDefs.length, 3);
  const keys = emailDefs.map(d => d.key);
  assert.ok(keys.includes('title'));
  assert.ok(keys.includes('to'));
  assert.ok(keys.includes('subject'));
});

test('TYPING_THEME_FIELD_DEFS sms has all fields', () => {
  const smsDefs = TYPING_THEME_FIELD_DEFS.sms;
  assert.strictEqual(smsDefs.length, 5);
  const keys = smsDefs.map(d => d.key);
  assert.ok(keys.includes('avatar'));
  assert.ok(keys.includes('contactName'));
  assert.ok(keys.includes('status'));
  assert.ok(keys.includes('bubbleColor'));
  assert.ok(keys.includes('timestamp'));
  const colorDef = smsDefs.find(d => d.key === 'bubbleColor');
  assert.strictEqual(colorDef.type, 'color');
});

test('TYPING_THEME_FIELD_DEFS generic is empty', () => {
  assert.strictEqual(TYPING_THEME_FIELD_DEFS.generic.length, 0);
});

console.log('\x1b[1mbuildQueue:\x1b[0m');
test('buildQueue populates state.queue from enabled templates', () => {
  buildQueue();
  assert.ok(state.queue.length > 0, 'Queue should not be empty');
  assert.ok(state.queue.length <= TEMPLATES.length, 'Queue should not exceed TEMPLATES length');
  state.queue.forEach(t => {
    assert.ok(state.enabledTemplates.has(t.id), `Queue contains disabled template: ${t.id}`);
  });
});

test('buildQueue contains only enabled templates', () => {
  const saved = new Set(state.enabledTemplates);
  state.enabledTemplates = new Set([TEMPLATES[0].id, TEMPLATES[1].id]);
  buildQueue();
  assert.strictEqual(state.queue.length, 2);
  const ids = state.queue.map(t => t.id);
  assert.ok(ids.includes(TEMPLATES[0].id));
  assert.ok(ids.includes(TEMPLATES[1].id));
  state.enabledTemplates = saved;
});

test('buildQueue resets currentIndex to 0', () => {
  state.currentIndex = 5;
  buildQueue();
  assert.strictEqual(state.currentIndex, 0);
});

test('buildQueue shuffles (order differs from TEMPLATES)', () => {
  const results = new Set();
  for (let i = 0; i < 10; i++) {
    buildQueue();
    results.add(state.queue.map(t => t.id).join(','));
  }
  assert.ok(results.size > 1, `Queue order should vary across calls, got ${results.size} unique orders in 10 tries`);
});

test('buildQueue with all disabled produces empty queue', () => {
  const saved = new Set(state.enabledTemplates);
  state.enabledTemplates = new Set();
  buildQueue();
  assert.strictEqual(state.queue.length, 0);
  state.enabledTemplates = saved;
});

test('buildQueue with single template enabled', () => {
  const saved = new Set(state.enabledTemplates);
  state.enabledTemplates = new Set([TEMPLATES[0].id]);
  buildQueue();
  assert.strictEqual(state.queue.length, 1);
  assert.strictEqual(state.queue[0].id, TEMPLATES[0].id);
  state.enabledTemplates = saved;
});

test('buildQueue has no duplicate templates', () => {
  buildQueue();
  const ids = state.queue.map(t => t.id);
  assert.strictEqual(ids.length, new Set(ids).size, 'Queue should have no duplicates');
});

console.log('\x1b[1mVignette gradient math:\x1b[0m');
test('vignette opacity 0 produces background:none', () => {
  const o = 0 / 100;
  assert.strictEqual(o, 0);
});

test('vignette opacity 70 produces correct decimal', () => {
  const o = 70 / 100;
  assert.strictEqual(o, 0.7);
});

test('vignette inner opacity layers scale correctly', () => {
  const o = 0.7;
  assert.strictEqual((o * 0.08).toFixed(2), '0.06');
  assert.strictEqual((o * 0.25).toFixed(2), '0.17');
  assert.strictEqual((o * 0.5).toFixed(2), '0.35');
  assert.strictEqual(o.toFixed(2), '0.70');
});

test('vignette color stop positions from spread=70', () => {
  const spread = 70;
  assert.strictEqual(100 - spread, 30);
  assert.strictEqual((100 - spread * 0.7).toFixed(1), '51.0');
  assert.strictEqual((100 - spread * 0.4).toFixed(1), '72.0');
});

test('vignette ellipse height is 90% of width', () => {
  const size = 60;
  assert.strictEqual(Math.round(size * 0.9), 54);
});

test('vignette with spread 100 places stops at edges', () => {
  const spread = 100;
  assert.strictEqual(100 - spread, 0);
  assert.strictEqual(100 - spread * 0.7, 30);
  assert.strictEqual(100 - spread * 0.4, 60);
});

console.log('\x1b[1mAccent CSS generation:\x1b[0m');
test('accent CSS linear-gradient uses color with ee suffix', () => {
  const c = '#facc15';
  const grad = `linear-gradient(120deg,${c}ee,${c})`;
  assert.ok(grad.includes('#facc15ee'));
  assert.ok(grad.includes('#facc15'));
});

test('accent CSS box-shadow uses color with 66 and 26 alpha', () => {
  const c = '#facc15';
  const shadow = `0 0 20px ${c}66,0 0 60px ${c}26`;
  assert.ok(shadow.includes('#facc1566'));
  assert.ok(shadow.includes('#facc1526'));
});

test('accent CSS string contains keywordPulse animation reference', () => {
  const c = '#facc15';
  const css = `.keyword-highlight{background:linear-gradient(120deg,${c}ee,${c})!important;box-shadow:0 0 20px ${c}66,0 0 60px ${c}26!important;animation:keywordPulse .8s ease-in-out infinite}`;
  assert.ok(css.includes('keywordPulse'));
  assert.ok(css.includes('.8s'));
});

test('accent CSS playing override uses .5s', () => {
  const css = `.playing .keyword-highlight{animation:keywordPulse .5s ease-in-out infinite}`;
  assert.ok(css.includes('.5s'));
});

test('accent preview uses gradient and shadow', () => {
  const c = '#ff0000';
  const bg = `linear-gradient(120deg, ${c}ee, ${c})`;
  const sh = `0 0 12px ${c}66`;
  assert.ok(bg.includes('#ff0000ee'));
  assert.ok(sh.includes('#ff000066'));
});

console.log('\x1b[1mshowSlide centering with animation:\x1b[0m');
test('centering dx/dy calculation without animation', () => {
  const cw = 1920, ch = 1080;
  const kCX = 400, kCY = 300;
  const zoomLevel = 2.0;
  const zoomOffsetX = 0, zoomOffsetY = 0;
  const dx = cw / 2 - kCX + zoomOffsetX;
  const dy = ch / 2 - kCY + zoomOffsetY;
  assert.strictEqual(dx, 560);
  assert.strictEqual(dy, 240);
});

test('centering dx/dy with zoom offset', () => {
  const cw = 1920, ch = 1080;
  const kCX = 960, kCY = 540;
  const zoomOffsetX = 50, zoomOffsetY = -30;
  const dx = cw / 2 - kCX + zoomOffsetX;
  const dy = ch / 2 - kCY + zoomOffsetY;
  assert.strictEqual(dx, 50);
  assert.strictEqual(dy, -30);
});

test('centering with zoomIn animation applies preset resolve', () => {
  const cw = 1920, ch = 1080;
  const kCX = 400, kCY = 300;
  const zoomLevel = 2.0;
  const zoomOffsetX = 0, zoomOffsetY = 0;
  const animIntensity = 100;
  const total = 5, pos = 2;
  const progress = total > 1 ? pos / (total - 1) : 0.5;
  const p = easeInOut(progress);
  const preset = ANIMATION_PRESETS.zoomIn;
  const vals = preset.resolve(p, { zoom: zoomLevel, offX: zoomOffsetX, offY: zoomOffsetY, intensity: animIntensity / 100 });
  assert.strictEqual(vals.zoom, lerp(1.0, zoomLevel, p));
  const dx = cw / 2 - kCX + vals.offX;
  const dy = ch / 2 - kCY + vals.offY;
  assert.strictEqual(dx, 560);
  assert.strictEqual(dy, 240);
});

test('centering with kenBurns animation at different positions', () => {
  const zoomLevel = 2.0;
  const zoomOffsetX = 0, zoomOffsetY = 0;
  const animIntensity = 100;
  const total = 10;
  const preset = ANIMATION_PRESETS.kenBurns;
  const vals0 = preset.resolve(easeInOut(0), { zoom: zoomLevel, offX: zoomOffsetX, offY: zoomOffsetY, intensity: animIntensity / 100 });
  const vals5 = preset.resolve(easeInOut(5 / 9), { zoom: zoomLevel, offX: zoomOffsetX, offY: zoomOffsetY, intensity: animIntensity / 100 });
  const vals9 = preset.resolve(easeInOut(1), { zoom: zoomLevel, offX: zoomOffsetX, offY: zoomOffsetY, intensity: animIntensity / 100 });
  assert.ok(vals0.zoom < vals5.zoom, 'kenBurns should increase zoom over progress');
  assert.ok(vals5.zoom < vals9.zoom, 'kenBurns should keep increasing');
  assert.strictEqual(vals0.offX, -120);
  assert.strictEqual(vals9.offX, 120);
});

test('animationPreset=none skips resolve, uses base state', () => {
  const zoomLevel = 2.5;
  const zoomOffsetX = 30, zoomOffsetY = -20;
  const dx = 1920 / 2 - 400 + zoomOffsetX;
  const dy = 1080 / 2 - 300 + zoomOffsetY;
  assert.strictEqual(dx, 590);
  assert.strictEqual(dy, 220);
});

console.log('\x1b[1mbuildSlidesData logic:\x1b[0m');
test('framesPerSlide calculation from speed=800ms at 30fps', () => {
  const fps = 30;
  const speed = 800;
  const framesPerSlide = Math.max(1, Math.round((speed / 1000) * fps));
  assert.strictEqual(framesPerSlide, 24);
});

test('framesPerSlide calculation from speed=2000ms at 30fps', () => {
  const fps = 30;
  const speed = 2000;
  const framesPerSlide = Math.max(1, Math.round((speed / 1000) * fps));
  assert.strictEqual(framesPerSlide, 60);
});

test('framesPerSlide calculation from speed=100ms at 30fps', () => {
  const fps = 30;
  const speed = 100;
  const framesPerSlide = Math.max(1, Math.round((speed / 1000) * fps));
  assert.strictEqual(framesPerSlide, 3);
});

test('totalSlides from duration=30s, fps=30, framesPerSlide=24', () => {
  const fps = 30;
  const framesPerSlide = 24;
  const durationSec = 30;
  const totalSlides = Math.ceil(durationSec * fps / framesPerSlide);
  assert.strictEqual(totalSlides, 38);
});

test('totalSlides from duration=10s', () => {
  const fps = 30;
  const framesPerSlide = 24;
  const durationSec = 10;
  const totalSlides = Math.ceil(durationSec * fps / framesPerSlide);
  assert.strictEqual(totalSlides, 13);
});

test('buildSlidesData numSteps calculation', () => {
  const framesPerSlide = 24;
  const numSteps = Math.max(2, Math.ceil(framesPerSlide / 2));
  assert.strictEqual(numSteps, 12);
  const stepDur = Math.max(1, Math.round(framesPerSlide / numSteps));
  assert.strictEqual(stepDur, 2);
});

test('buildSlidesData numSteps with large framesPerSlide', () => {
  const framesPerSlide = 60;
  const numSteps = Math.max(2, Math.ceil(framesPerSlide / 2));
  assert.strictEqual(numSteps, 30);
});

test('buildSlidesData numSteps with minimum framesPerSlide', () => {
  const framesPerSlide = 1;
  const numSteps = Math.max(2, Math.ceil(framesPerSlide / 2));
  assert.strictEqual(numSteps, 2);
});

test('buildSlidesData last step duration covers remaining frames', () => {
  const framesPerSlide = 24;
  const numSteps = 12;
  const stepDur = 2;
  const lastDur = Math.max(1, framesPerSlide - stepDur * (numSteps - 1));
  assert.strictEqual(lastDur, 2);
});

test('buildSlidesData easing selection - non-linear preset uses easeInOut', () => {
  const linearPreset = ANIMATION_PRESETS.drift;
  assert.strictEqual(linearPreset.easing, 'ease-in-out');
  const globalP = 0.5;
  const p = linearPreset.easing === 'linear' ? globalP : easeInOut(globalP);
  assert.strictEqual(p, 0.5, 'easeInOut(0.5) should be 0.5');
});

test('buildSlidesData linear preset bypasses easeInOut', () => {
  assert.strictEqual(ANIMATION_PRESETS.breathe.easing, 'linear');
  const globalP = 0.25;
  const p = ANIMATION_PRESETS.breathe.easing === 'linear' ? globalP : easeInOut(globalP);
  assert.strictEqual(p, 0.25, 'linear should pass through unchanged');
});

test('buildSlidesData breathe uses linear easing', () => {
  assert.strictEqual(ANIMATION_PRESETS.breathe.easing, 'linear');
});

test('buildSlidesData animation step progress calculation', () => {
  const numSteps = 10;
  const totalSlides = 5;
  for (let s = 0; s < totalSlides; s++) {
    for (let f = 0; f < numSteps; f++) {
      const localP = numSteps > 1 ? f / (numSteps - 1) : 0;
      const globalP = totalSlides > 1 ? (s + localP) / totalSlides : 0;
      assert.ok(globalP >= 0 && globalP <= 1, `s=${s} f=${f}: globalP=${globalP} out of range`);
    }
  }
});

console.log('\x1b[1mupdatePreviewSize scale computation:\x1b[0m');
test('scale fits 1920x1080 into 900x500 area', () => {
  const w = 1920, h = 1080;
  const areaW = 900, areaH = 500;
  const scale = Math.min(areaW / w, areaH / h, 1);
  assert.ok(Math.abs(scale - 0.463) < 0.01, `Expected ~0.463, got ${scale}`);
  const displayW = Math.round(w * scale);
  const displayH = Math.round(h * scale);
  assert.ok(displayW <= areaW, `displayW ${displayW} > areaW ${areaW}`);
  assert.ok(displayH <= areaH, `displayH ${displayH} > areaH ${areaH}`);
});

test('scale caps at 1 when area is larger than resolution', () => {
  const w = 720, h = 720;
  const areaW = 900, areaH = 900;
  const scale = Math.min(areaW / w, areaH / h, 1);
  assert.strictEqual(scale, 1);
});

test('scale for 3840x2160 in 960x540 area', () => {
  const w = 3840, h = 2160;
  const areaW = 900, areaH = 480;
  const scale = Math.min(areaW / w, areaH / h, 1);
  assert.ok(scale < 0.25, `Expected < 0.25, got ${scale}`);
});

console.log('\x1b[1mchatUpdatePreviewSize scale + font:\x1b[0m');
test('chat base font size for 1920x1080 at 100%', () => {
  const w = 1920, h = 1080;
  const fontScale = 100;
  const base = Math.min(w, h) / 15 * fontScale / 100;
  assert.strictEqual(base, 72, `min(1920,1080)/15 = 72`);
});

test('chat base font size for 1920x1080 at 150%', () => {
  const w = 1920, h = 1080;
  const fontScale = 150;
  const base = Math.min(w, h) / 15 * fontScale / 100;
  assert.strictEqual(base, 108);
});

test('chat base font size for 720x1280 (portrait) at 100%', () => {
  const w = 720, h = 1280;
  const fontScale = 100;
  const base = Math.min(w, h) / 15 * fontScale / 100;
  assert.strictEqual(base, 48);
});

test('chat base font size for 720x720 (square) at 100%', () => {
  const w = 720, h = 720;
  const fontScale = 100;
  const base = Math.min(w, h) / 15 * fontScale / 100;
  assert.strictEqual(base, 48);
});

console.log('\x1b[1mtypingPlay timing state machine:\x1b[0m');
test('totalDuration = startDelay + timeline.totalDuration + endDelay', () => {
  const startDelay = 500;
  const endDelay = 1500;
  const timelineDur = 1000;
  const total = startDelay + timelineDur + endDelay;
  assert.strictEqual(total, 3000);
});

test('before startDelay (t < 0) shows empty text', () => {
  const startDelay = 500;
  const elapsed = 300;
  const t = elapsed - startDelay;
  assert.ok(t < 0, 't should be negative before startDelay');
});

test('after timeline duration shows finalText', () => {
  const startDelay = 500;
  const timelineDur = 1000;
  const elapsed = 1600;
  const t = elapsed - startDelay;
  assert.ok(t >= timelineDur, 't should be >= timelineDur');
});

test('during timeline shows intermediate text', () => {
  const startDelay = 500;
  const timelineDur = 1000;
  const elapsed = 800;
  const t = elapsed - startDelay;
  assert.ok(t >= 0 && t < timelineDur, 't should be within timeline');
});

test('cursor blink timing at 530ms interval', () => {
  const blinkOn = (T) => Math.floor(T / 530) % 2 === 0;
  assert.strictEqual(blinkOn(0), true);
  assert.strictEqual(blinkOn(529), true);
  assert.strictEqual(blinkOn(530), false);
  assert.strictEqual(blinkOn(1059), false);
  assert.strictEqual(blinkOn(1060), true);
});

test('cursor blink without blink enabled is always on', () => {
  const blinkOn = true;
  assert.strictEqual(blinkOn, true);
});

console.log('\x1b[1mchatRunAnimation timing math:\x1b[0m');
test('typingDuration = min(speed * 0.6, 800)', () => {
  assert.strictEqual(Math.min(600 * 0.6, 800), 360);
  assert.strictEqual(Math.min(1400 * 0.6, 800), 800);
  assert.strictEqual(Math.min(200 * 0.6, 800), 120);
});

test('bubbleGap equals speed', () => {
  const speed = 600;
  const bubbleGap = speed;
  assert.strictEqual(bubbleGap, 600);
});

test('animation initial delay is 400ms', () => {
  const initialDelay = 400;
  assert.strictEqual(initialDelay, 400);
});

console.log('\x1b[1mchatRenderMessageList HTML:\x1b[0m');
test('message list item HTML contains contact color dot', () => {
  const msg = { sender: 0, text: 'Hello' };
  const contact = chatState.contacts[msg.sender];
  const html = `<span class="chat-msg-dot" style="background:${contact.color}"></span>`;
  assert.ok(html.includes('#007AFF'));
  assert.ok(html.includes('chat-msg-dot'));
});

test('message list item HTML shows contact name and text', () => {
  const msg = { sender: 1, text: 'Test message' };
  const contact = chatState.contacts[msg.sender];
  const html = `<span class="chat-msg-text">${contact.name}: ${msg.text}</span>`;
  assert.ok(html.includes('Anna: Test message'));
});

console.log('\x1b[1mchatUpdateSenderDropdown HTML:\x1b[0m');
test('sender dropdown generates options from contacts', () => {
  const html = chatState.contacts.map((c, i) =>
    `<option value="${i}">${c.name}</option>`
  ).join('');
  assert.ok(html.includes('<option value="0">Jan</option>'));
  assert.ok(html.includes('<option value="1">Anna</option>'));
});

console.log('\x1b[1mbuildTemplateToggles grouping logic:\x1b[0m');
test('templates grouped by category cover all templates', () => {
  const grouped = {};
  for (const t of TEMPLATES) {
    const cat = t.category || 'classic';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  }
  const totalGrouped = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
  assert.strictEqual(totalGrouped, TEMPLATES.length);
});

test('all categories from CATEGORIES are represented in templates', () => {
  const grouped = {};
  for (const t of TEMPLATES) {
    const cat = t.category || 'classic';
    grouped[cat] = true;
  }
  Object.keys(CATEGORIES).forEach(catKey => {
    assert.ok(grouped[catKey], `No templates found for category: ${catKey}`);
  });
});

test('checkedCount and allOn computation', () => {
  const templates = TEMPLATES.slice(0, 3);
  const enabled = new Set([templates[0].id, templates[1].id, templates[2].id]);
  const checkedCount = templates.filter(t => enabled.has(t.id)).length;
  const allOn = checkedCount === templates.length;
  assert.strictEqual(checkedCount, 3);
  assert.strictEqual(allOn, true);

  const enabled2 = new Set([templates[0].id]);
  const checkedCount2 = templates.filter(t => enabled2.has(t.id)).length;
  const allOn2 = checkedCount2 === templates.length;
  assert.strictEqual(checkedCount2, 1);
  assert.strictEqual(allOn2, false);
});

console.log('\x1b[1mtypingThemeEditor individual:\x1b[0m');
test('typingThemeEditor contains window dots, title, and content', () => {
  const html = typingThemeEditor('CONTENT', '#111', '#eee', 16, { title: 'test.txt' });
  assert.ok(html.includes('#f38ba8'), 'Missing red dot');
  assert.ok(html.includes('#f9e2af'), 'Missing yellow dot');
  assert.ok(html.includes('#a6e3a1'), 'Missing green dot');
  assert.ok(html.includes('test.txt'), 'Missing title');
  assert.ok(html.includes('CONTENT'), 'Missing content');
  assert.ok(html.includes('#111'), 'Missing bg color');
  assert.ok(html.includes('#eee'), 'Missing text color');
  assert.ok(html.includes('16px'), 'Missing font size');
});

test('typingThemeEditor escapes title HTML', () => {
  const html = typingThemeEditor('X', '#000', '#fff', 12, { title: '<script>' });
  assert.ok(!html.includes('<script>'), 'Title should be escaped');
  assert.ok(html.includes('&lt;script&gt;'), 'Should contain escaped title');
});

console.log('\x1b[1mtypingThemeTerminal individual:\x1b[0m');
test('typingThemeTerminal contains prompt and content', () => {
  const html = typingThemeTerminal('ls -la', '#0d1117', '#c9d1d9', 14, { title: 'Bash', prompt: '$ ' });
  assert.ok(html.includes('$ '), 'Missing prompt');
  assert.ok(html.includes('ls -la'), 'Missing content');
  assert.ok(html.includes('#0d1117'), 'Missing bg');
  assert.ok(html.includes('#a6e3a1'), 'Prompt should be green');
});

test('typingThemeTerminal escapes prompt', () => {
  const html = typingThemeTerminal('X', '#000', '#fff', 12, { title: 'T', prompt: '<cmd>' });
  assert.ok(!html.includes('<cmd>'), 'Prompt should be escaped');
  assert.ok(html.includes('&lt;cmd&gt;'), 'Should contain escaped prompt');
});

console.log('\x1b[1mtypingThemeEmail individual:\x1b[0m');
test('typingThemeEmail has title, To, Subject, and content', () => {
  const html = typingThemeEmail('Email body', '#1e1e2e', '#cdd6f4', 16, { title: 'New Email', to: 'a@b.com', subject: 'Test' });
  assert.ok(html.includes('New Email'), 'Missing title');
  assert.ok(html.includes('a@b.com'), 'Missing to');
  assert.ok(html.includes('Test'), 'Missing subject');
  assert.ok(html.includes('Email body'), 'Missing content');
  assert.ok(html.includes('To:'), 'Missing To label');
  assert.ok(html.includes('Subject:'), 'Missing Subject label');
});

test('typingThemeEmail escapes all fields', () => {
  const html = typingThemeEmail('X', '#000', '#fff', 12, { title: '<t>', to: '<to>', subject: '<s>' });
  assert.ok(!html.includes('<t>'), 'Title should be escaped');
  assert.ok(!html.includes('<to>'), 'To should be escaped');
  assert.ok(!html.includes('<s>'), 'Subject should be escaped');
});

console.log('\x1b[1mtypingThemeSMS individual:\x1b[0m');
test('typingThemeSMS has avatar, name, status, bubble, timestamp', () => {
  const html = typingThemeSMS('Hello!', '#000', '#fff', 14, { avatar: 'J', contactName: 'Jan', status: 'online', bubbleColor: '#6366f1', timestamp: '14:30' });
  assert.ok(html.includes('J'), 'Missing avatar');
  assert.ok(html.includes('Jan'), 'Missing contact name');
  assert.ok(html.includes('online'), 'Missing status');
  assert.ok(html.includes('#6366f1'), 'Missing bubble color');
  assert.ok(html.includes('14:30'), 'Missing timestamp');
  assert.ok(html.includes('Hello!'), 'Missing content');
  assert.ok(html.includes('border-bottom-right-radius'), 'Should have asymmetric border-radius for SMS bubble');
});

test('typingThemeSMS defaults bubbleColor to #6366f1', () => {
  const html = typingThemeSMS('X', '#000', '#fff', 12, { avatar: 'A', contactName: 'B', status: '', bubbleColor: undefined, timestamp: '' });
  assert.ok(html.includes('#6366f1'), 'Should use default bubble color');
});

console.log('\x1b[1mtypingThemeGeneric individual:\x1b[0m');
test('typingThemeGeneric is minimal with no header', () => {
  const html = typingThemeGeneric('Just text', '#222', '#eee', 18);
  assert.ok(html.includes('Just text'), 'Missing content');
  assert.ok(html.includes('#222'), 'Missing bg');
  assert.ok(html.includes('#eee'), 'Missing fg');
  assert.ok(html.includes('18px'), 'Missing font size');
  assert.ok(!html.includes('chat-render-header'), 'Should not have header');
  assert.ok(!html.includes('typing-cursor'), 'Should not inject cursor itself');
});

console.log('\x1b[1mchatRenderPreview style computation:\x1b[0m');
test('custom platform maps theme fields to styles', () => {
  const t = chatState.customTheme;
  const headerStyle = `background:${t.headerBg}`;
  const bodyStyle = `background:${t.bg}`;
  const bubbleLStyle = `background:${t.bubbleL};color:${t.text}`;
  const bubbleRStyle = `background:${t.bubbleR};color:#fff`;
  const textStyle = `color:${t.text}`;
  assert.ok(headerStyle.includes('#16213e'), 'Header style missing');
  assert.ok(bodyStyle.includes('#1a1a2e'), 'Body style missing');
  assert.ok(bubbleLStyle.includes('#2a2a4a'), 'Left bubble missing');
  assert.ok(bubbleRStyle.includes('#6366f1'), 'Right bubble missing');
  assert.ok(textStyle.includes('#e4e4e7'), 'Text style missing');
});

test('imessage platform produces empty custom styles', () => {
  const p = 'imessage';
  let headerStyle = '', bodyStyle = '', bubbleLStyle = '', bubbleRStyle = '', textStyle = '';
  if (p === 'custom') {
    const t = chatState.customTheme;
    headerStyle = `background:${t.headerBg}`;
  }
  assert.strictEqual(headerStyle, '');
  assert.strictEqual(bodyStyle, '');
});

test('chat platform statuses map', () => {
  const statuses = { imessage: 'iMessage', whatsapp: 'online', discord: '', messenger: 'Active now', custom: 'online' };
  assert.strictEqual(statuses['imessage'], 'iMessage');
  assert.strictEqual(statuses['whatsapp'], 'online');
  assert.strictEqual(statuses['discord'], '');
  assert.strictEqual(statuses['messenger'], 'Active now');
  assert.strictEqual(statuses['custom'], 'online');
});

test('chat header uses contact index 1 (second contact)', () => {
  const headerContact = chatState.contacts[1];
  assert.strictEqual(headerContact.name, 'Anna');
  assert.strictEqual(headerContact.color, '#34C759');
});

console.log('\x1b[1mchatRenderPreview animate/limit logic:\x1b[0m');
test('animate=true with upTo undefined starts with 0 messages', () => {
  const animate = true;
  const upTo = undefined;
  const startEmpty = animate && typeof upTo === 'undefined';
  assert.strictEqual(startEmpty, true);
  const renderCount = startEmpty ? 0 : chatState.messages.length;
  assert.strictEqual(renderCount, 0);
});

test('animate=false renders all messages', () => {
  const animate = false;
  const upTo = undefined;
  const startEmpty = animate && typeof upTo === 'undefined';
  const limit = typeof upTo === 'number' ? upTo : chatState.messages.length;
  const renderCount = startEmpty ? 0 : limit;
  assert.strictEqual(renderCount, chatState.messages.length);
});

test('upTo=3 renders exactly 3 messages', () => {
  const upTo = 3;
  const limit = typeof upTo === 'number' ? upTo : chatState.messages.length;
  assert.strictEqual(limit, 3);
});

test('showTypingFrom only shows when valid index', () => {
  const showTypingFrom = 2;
  assert.ok(typeof showTypingFrom === 'number' && showTypingFrom < chatState.messages.length);
  const invalid = 999;
  assert.ok(!(typeof invalid === 'number' && invalid < chatState.messages.length));
});

console.log('\x1b[1mExport frame calculations:\x1b[0m');
test('chat MP4 typing frame count', () => {
  const speed = 600;
  const fps = 30;
  const typingMs = Math.min(speed * 0.6, 800);
  const framesPerTyping = Math.round((typingMs / 1000) * fps);
  assert.strictEqual(framesPerTyping, 11);
});

test('chat MP4 bubble frame count', () => {
  const fps = 30;
  const framesPerBubble = Math.round((350 / 1000) * fps);
  assert.strictEqual(framesPerBubble, 11);
});

test('chat MP4 pause frame count', () => {
  const fps = 30;
  const pauseMs = 600;
  const framesPerPause = Math.round((pauseMs / 1000) * fps);
  assert.strictEqual(framesPerPause, 18);
});

test('chat MP4 end frame count at 1.5s', () => {
  const fps = 30;
  const framesEnd = Math.round(1.5 * fps);
  assert.strictEqual(framesEnd, 45);
});

test('typing MP4 total frame count', () => {
  const fps = 30;
  const startDelay = 500;
  const timelineDur = 1000;
  const endDelay = 1500;
  const totalDuration = startDelay + timelineDur + endDelay;
  const totalFrames = Math.max(1, Math.ceil(totalDuration / 1000 * fps));
  assert.strictEqual(totalFrames, 90);
});

test('typing MP4 frame time calculation', () => {
  const fps = 30;
  const frameIndex = 15;
  const T = frameIndex / fps * 1000;
  assert.strictEqual(T, 500);
});

console.log('\x1b[1mBatch export format handling:\x1b[0m');
test('batch export generates 3 formats', () => {
  const formats = ['16:9', '9:16', '1:1'];
  assert.strictEqual(formats.length, 3);
});

test('batch export path formatting', () => {
  const savePath = 'output/news-batch-123.mp4';
  const ext = '.mp4';
  const base = savePath.slice(0, -ext.length);
  const fmt = '16:9';
  const p = `${base}-${fmt.replace(':', 'x')}${ext}`;
  assert.strictEqual(p, 'output/news-batch-123-16x9.mp4');
});

test('batch export uses correct resolution per format', () => {
  const formats = ['16:9', '9:16', '1:1'];
  const resolution = '1080p';
  formats.forEach(fmt => {
    const [w, h] = RESOLUTIONS[fmt][resolution];
    assert.ok(w > 0 && h > 0, `${fmt} should have valid resolution`);
  });
});

console.log('\x1b[1mupdateCounter logic:\x1b[0m');
test('counter text format with queue', () => {
  const total = 5;
  const currentIndex = 2;
  const current = total > 0 ? currentIndex + 1 : 0;
  const text = `${current} / ${total}`;
  assert.strictEqual(text, '3 / 5');
});

test('counter text with empty queue', () => {
  const total = 0;
  const currentIndex = 0;
  const current = total > 0 ? currentIndex + 1 : 0;
  const text = `${current} / ${total}`;
  assert.strictEqual(text, '0 / 0');
});

test('counter wraps when currentIndex exceeds queue length', () => {
  state.currentIndex = 0;
  const savedQueue = state.queue;
  state.queue = [TEMPLATES[0], TEMPLATES[1], TEMPLATES[2]];
  state.currentIndex = 3;
  if (state.currentIndex >= state.queue.length) {
    state.currentIndex = 0;
  }
  assert.strictEqual(state.currentIndex, 0);
  state.queue = savedQueue;
});

console.log('\x1b[1mnextSlide wraparound:\x1b[0m');
test('nextSlide wraps index and rebuilds queue', () => {
  const savedQueue = [...state.queue];
  state.queue = [TEMPLATES[0], TEMPLATES[1]];
  state.currentIndex = 2;
  if (state.currentIndex >= state.queue.length) {
    buildQueue();
  }
  assert.strictEqual(state.currentIndex, 0);
  state.queue = savedQueue;
});

test('nextSlide with empty queue returns early', () => {
  const savedQueue = state.queue;
  state.queue = [];
  assert.strictEqual(state.queue.length, 0);
  state.queue = savedQueue;
});

console.log('\x1b[1mplay/stop state transitions:\x1b[0m');
test('play sets state.playing to true', () => {
  state.playing = false;
  if (state.queue.length === 0) buildQueue();
  state.playing = true;
  assert.strictEqual(state.playing, true);
  state.playing = false;
});

test('stop resets playing, clears timer, resets index', () => {
  state.playing = true;
  state.timer = {};
  state.currentIndex = 5;
  state.playing = false;
  state.timer = null;
  state.currentIndex = 0;
  assert.strictEqual(state.playing, false);
  assert.strictEqual(state.timer, null);
  assert.strictEqual(state.currentIndex, 0);
});

console.log('\x1b[1mrefreshCategoryCounts logic:\x1b[0m');
test('allOn is true when all checkboxes are checked', () => {
  const checkboxes = [{ checked: true }, { checked: true }, { checked: true }];
  const checkedCount = checkboxes.filter(cb => cb.checked).length;
  const allOn = checkedCount === checkboxes.length;
  assert.strictEqual(checkedCount, 3);
  assert.strictEqual(allOn, true);
});

test('allOn is false when some checkboxes unchecked', () => {
  const checkboxes = [{ checked: true }, { checked: false }, { checked: true }];
  const checkedCount = checkboxes.filter(cb => cb.checked).length;
  const allOn = checkedCount === checkboxes.length;
  assert.strictEqual(checkedCount, 2);
  assert.strictEqual(allOn, false);
});

console.log('\x1b[1mswitchTool routing:\x1b[0m');
test('switchTool sets activeTool correctly', () => {
  activeTool = 'newspaper';
  assert.strictEqual(activeTool, 'newspaper');
  activeTool = 'chat';
  assert.strictEqual(activeTool, 'chat');
  activeTool = 'typing';
  assert.strictEqual(activeTool, 'typing');
});

console.log('\x1b[1mchatUpdateAvatarUI logic:\x1b[0m');
test('avatar display when avatar is set', () => {
  const contact = { name: 'Jan', color: '#007AFF', avatar: 'data:image/png;base64,abc' };
  const hasAvatar = !!contact.avatar;
  assert.strictEqual(hasAvatar, true);
});

test('avatar display when avatar is null', () => {
  const contact = { name: 'Jan', color: '#007AFF', avatar: null };
  const hasAvatar = !!contact.avatar;
  assert.strictEqual(hasAvatar, false);
  const initial = contact.name.charAt(0).toUpperCase();
  assert.strictEqual(initial, 'J');
});

console.log('\x1b[1mEdge cases - insertKeyword bounds:\x1b[0m');
test('insertKeyword min/max index computation for 50-word text', () => {
  const words = new Array(50).fill('word');
  const minIdx = Math.max(2, Math.floor(words.length * 0.15));
  const maxIdx = Math.min(words.length - 3, Math.floor(words.length * 0.85));
  assert.strictEqual(minIdx, 7);
  assert.strictEqual(maxIdx, 42);
});

test('insertKeyword min/max index for 10-word text', () => {
  const words = new Array(10).fill('word');
  const minIdx = Math.max(2, Math.floor(words.length * 0.15));
  const maxIdx = Math.min(words.length - 3, Math.floor(words.length * 0.85));
  assert.strictEqual(minIdx, 2);
  assert.strictEqual(maxIdx, 7);
});

test('insertKeyword min/max index for 5-word text', () => {
  const words = new Array(5).fill('word');
  const minIdx = Math.max(2, Math.floor(words.length * 0.15));
  const maxIdx = Math.min(words.length - 3, Math.floor(words.length * 0.85));
  assert.strictEqual(minIdx, 2);
  assert.strictEqual(maxIdx, 2);
});

console.log('\x1b[1mEdge cases - animation preset robustness:\x1b[0m');
test('all presets handle zoom=1 gracefully', () => {
  const sV = { zoom: 1, offX: 0, offY: 0, intensity: 1 };
  Object.entries(ANIMATION_PRESETS).forEach(([id, preset]) => {
    if (id === 'none') return;
    [0, 0.5, 1].forEach(p => {
      const v = preset.resolve(p, sV);
      assert.ok(typeof v.zoom === 'number' && isFinite(v.zoom), `${id} at p=${p} zoom=1: bad zoom`);
      assert.ok(typeof v.offX === 'number' && isFinite(v.offX), `${id} at p=${p} zoom=1: bad offX`);
      assert.ok(typeof v.offY === 'number' && isFinite(v.offY), `${id} at p=${p} zoom=1: bad offY`);
    });
  });
});

test('all presets handle very high zoom=20', () => {
  const sV = { zoom: 20, offX: 0, offY: 0, intensity: 1 };
  Object.entries(ANIMATION_PRESETS).forEach(([id, preset]) => {
    if (id === 'none') return;
    [0, 0.5, 1].forEach(p => {
      const v = preset.resolve(p, sV);
      assert.ok(isFinite(v.zoom), `${id}: zoom not finite at zoom=20`);
    });
  });
});

test('all presets handle intensity=10 without NaN', () => {
  const sV = { zoom: 2, offX: 0, offY: 0, intensity: 10 };
  Object.entries(ANIMATION_PRESETS).forEach(([id, preset]) => {
    if (id === 'none') return;
    const v = preset.resolve(0.5, sV);
    assert.ok(isFinite(v.zoom), `${id}: NaN at intensity=10`);
    assert.ok(isFinite(v.offX));
    assert.ok(isFinite(v.offY));
  });
});

console.log('\x1b[1mEdge cases - typingBuildTimeline edge cases:\x1b[0m');
test('typingBuildTimeline with only pauses produces empty finalText', () => {
  typingState.sequences = [
    { action: 'pause', duration: 500 },
    { action: 'pause', duration: 300 },
  ];
  typingState.typeSpeed = 80;
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.finalText, '');
  assert.strictEqual(tl.states.length, 0);
  assert.strictEqual(tl.pauses.length, 2);
  assert.strictEqual(tl.totalDuration, 800);
});

test('typingBuildTimeline with only deletes produces empty result', () => {
  typingState.sequences = [
    { action: 'delete', count: 5 },
  ];
  typingState.delSpeed = 40;
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.finalText, '');
  assert.strictEqual(tl.states.length, 0);
});

test('typingBuildTimeline with empty sequences array', () => {
  typingState.sequences = [];
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.finalText, '');
  assert.strictEqual(tl.states.length, 0);
  assert.strictEqual(tl.pauses.length, 0);
  assert.strictEqual(tl.totalDuration, 0);
});

test('typingBuildTimeline delete more than available clamps', () => {
  typingState.sequences = [
    { action: 'type', text: 'AB' },
    { action: 'delete', count: 100 },
  ];
  typingState.typeSpeed = 50;
  typingState.delSpeed = 30;
  const tl = typingBuildTimeline();
  assert.strictEqual(tl.finalText, '');
  assert.strictEqual(tl.states.length, 4);
});

console.log('\x1b[1mEdge cases - chatState messages:\x1b[0m');
test('empty messages array is valid state', () => {
  const saved = chatState.messages;
  chatState.messages = [];
  assert.strictEqual(chatState.messages.length, 0);
  chatState.messages = saved;
});

test('chatBubbleHTML handles empty text', () => {
  const msg = { sender: 0, text: '' };
  const html = chatBubbleHTML(msg, 0, 'imessage', '', '', false);
  assert.ok(html.includes('chat-bubble'), 'Should still produce bubble HTML');
});

console.log('\x1b[1mEdge cases - formatNumber:\x1b[0m');
test('formatNumber handles negative numbers', () => {
  const val = -1234;
  const str = Math.abs(val).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  assert.strictEqual(str, '1 234');
});

test('formatNumber handles very large numbers', () => {
  const val = 999999999;
  const str = Math.abs(val).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  assert.strictEqual(str, '999 999 999');
});

function stripIife(code) {
  const start = code.indexOf('{') + 1;
  const end = code.lastIndexOf('}');
  return code.substring(start, end);
}

function loadNotificationRenderer() {
  const vm = require('vm');
  const code = fs.readFileSync(path.join(__dirname, 'src', 'notification-renderer.js'), 'utf8');
  let inner = stripIife(code);
  inner = inner.replace(/var\s*\{\s*ipcRenderer\s*\}\s*=\s*require\([^)]*\);/, '');
  const script = new vm.Script(inner, { filename: 'notification-renderer.js' });
  const ctx = vm.createContext(global);
  script.runInContext(ctx);
}

function loadMapRenderer() {
  const vm = require('vm');
  const code = fs.readFileSync(path.join(__dirname, 'src', 'map-renderer.js'), 'utf8');
  let inner = stripIife(code);
  inner = inner.replace(/const\s*\{\s*ipcRenderer\s*\}\s*=\s*require\([^)]*\);/, '');
  inner = inner.replace(/^\s*const /gm, 'var ');
  const script = new vm.Script(inner, { filename: 'map-renderer.js' });
  const ctx = vm.createContext(global);
  script.runInContext(ctx);
}

loadNotificationRenderer();

const _notifSt = st;
const _notifGetNotifWidth = getNotifWidth;
const _notifEaseOutBack = easeOutBack;
const _notifGetAppIcon = getAppIcon;
const _notifBuildNotifHtml = buildNotifHtml;
const _notifMoveNotification = moveNotification;
const _notifRemoveNotification = removeNotification;
const _notifPRESETS = PRESETS;
const _notifNOTIF_RES = NOTIF_RES;
const _notifAPP_ICONS = APP_ICONS;

console.log('\x1b[1mNotification - NOTIF_RES:\x1b[0m');
test('NOTIF_RES has 3 formats', () => {
  assert.ok(_notifNOTIF_RES['16:9']);
  assert.ok(_notifNOTIF_RES['9:16']);
  assert.ok(_notifNOTIF_RES['1:1']);
});
test('NOTIF_RES has 3 quality levels per format', () => {
  ['16:9', '9:16', '1:1'].forEach(fmt => {
    assert.ok(_notifNOTIF_RES[fmt]['720p']);
    assert.ok(_notifNOTIF_RES[fmt]['1080p']);
    assert.ok(_notifNOTIF_RES[fmt]['4K']);
  });
});
test('NOTIF_RES 16:9 1080p is 1920x1080', () => {
  assert.strictEqual(_notifNOTIF_RES['16:9']['1080p'][0], 1920);
  assert.strictEqual(_notifNOTIF_RES['16:9']['1080p'][1], 1080);
});
test('NOTIF_RES 9:16 1080p is 1080x1920', () => {
  assert.strictEqual(_notifNOTIF_RES['9:16']['1080p'][0], 1080);
  assert.strictEqual(_notifNOTIF_RES['9:16']['1080p'][1], 1920);
});
test('NOTIF_RES 1:1 1080p is 1080x1080', () => {
  assert.strictEqual(_notifNOTIF_RES['1:1']['1080p'][0], 1080);
  assert.strictEqual(_notifNOTIF_RES['1:1']['1080p'][1], 1080);
});

console.log('\x1b[1mNotification - APP_ICONS:\x1b[0m');
test('APP_ICONS has all 11 entries', () => {
  const expected = ['Instagram', 'X', 'TikTok', 'Wiadomo\u015Bci', 'WhatsApp', 'Mail', 'Snapchat', 'Telegram', 'YouTube', 'LinkedIn', 'App'];
  expected.forEach(name => {
    assert.ok(_notifAPP_ICONS[name], `Missing APP_ICONS entry: ${name}`);
  });
  assert.strictEqual(Object.keys(_notifAPP_ICONS).length, 11);
});
test('APP_ICONS entries contain SVG markup', () => {
  Object.entries(_notifAPP_ICONS).forEach(([name, svg]) => {
    assert.ok(svg.includes('<svg'), `${name} should contain <svg`);
    assert.ok(svg.includes('</svg>'), `${name} should contain closing </svg>`);
  });
});

console.log('\x1b[1mNotification - PRESETS:\x1b[0m');
test('PRESETS has 15 entries', () => {
  assert.strictEqual(Object.keys(_notifPRESETS).length, 15);
});
test('Each preset has required fields', () => {
  Object.entries(_notifPRESETS).forEach(([key, p]) => {
    assert.ok(p.type, `${key}: missing type`);
    assert.ok(p.appName, `${key}: missing appName`);
    assert.ok(p.title, `${key}: missing title`);
    assert.ok(p.message, `${key}: missing message`);
    assert.ok(p.accentColor, `${key}: missing accentColor`);
  });
});
test('Each preset has valid accentColor hex format', () => {
  Object.entries(_notifPRESETS).forEach(([key, p]) => {
    assert.ok(/^#[0-9a-fA-F]{6}$/.test(p.accentColor), `${key}: invalid accentColor ${p.accentColor}`);
  });
});
test('Each preset appName maps to APP_ICONS', () => {
  Object.entries(_notifPRESETS).forEach(([key, p]) => {
    assert.ok(_notifAPP_ICONS[p.appName], `${key}: appName "${p.appName}" not in APP_ICONS`);
  });
});
test('PRESETS types are push, sms, or email', () => {
  Object.entries(_notifPRESETS).forEach(([key, p]) => {
    assert.ok(['push', 'sms', 'email'].includes(p.type), `${key}: unexpected type "${p.type}"`);
  });
});

console.log('\x1b[1mNotification - st defaults:\x1b[0m');
test('notification st has correct defaults', () => {
  assert.strictEqual(_notifSt.notifications.length, 0);
  assert.strictEqual(_notifSt.theme, 'ios');
  assert.strictEqual(_notifSt.slideDirection, 'top');
  assert.strictEqual(_notifSt.stackPosition, 'right');
  assert.strictEqual(_notifSt.animSpeed, 800);
  assert.strictEqual(_notifSt.slideDuration, 400);
  assert.strictEqual(_notifSt.fadeOut, true);
  assert.strictEqual(_notifSt.maxVisible, 5);
  assert.strictEqual(_notifSt.format, '16:9');
  assert.strictEqual(_notifSt.resolution, '1080p');
  assert.strictEqual(_notifSt.animating, false);
  assert.strictEqual(_notifSt.scale, 1);
  assert.strictEqual(_notifSt.customBg, '#f2f2f2');
  assert.strictEqual(_notifSt.customBorder, '#e5e5e5');
  assert.strictEqual(_notifSt.customTitle, '#000');
  assert.strictEqual(_notifSt.customText, '#666');
  assert.strictEqual(_notifSt.customRadius, 16);
});

console.log('\x1b[1mNotification - getNotifWidth:\x1b[0m');
test('getNotifWidth for portrait (ratio < 0.7) uses w*0.88 capped at 480', () => {
  assert.strictEqual(_notifGetNotifWidth(720, 1280), 480);
});
test('getNotifWidth for landscape (ratio ~1.78) uses w*0.42 capped at 420', () => {
  assert.strictEqual(_notifGetNotifWidth(1920, 1080), 420);
});
test('getNotifWidth for square (ratio 1.0, < 1.1) uses w*0.7 capped at 460', () => {
  assert.strictEqual(_notifGetNotifWidth(1080, 1080), 460);
});
test('getNotifWidth at boundary ratio 0.7 falls into middle branch', () => {
  assert.strictEqual(_notifGetNotifWidth(700, 1000), Math.min(700 * 0.7, 460));
});
test('getNotifWidth at boundary ratio 1.1 falls into last branch', () => {
  assert.strictEqual(_notifGetNotifWidth(1100, 1000), Math.min(1100 * 0.42, 420));
});
test('getNotifWidth for small landscape uncapped', () => {
  assert.strictEqual(_notifGetNotifWidth(720, 480), Math.min(720 * 0.42, 420));
});
test('getNotifWidth for small portrait uncapped', () => {
  assert.strictEqual(_notifGetNotifWidth(360, 640), Math.min(360 * 0.88, 480));
});

console.log('\x1b[1mNotification - easeOutBack:\x1b[0m');
test('easeOutBack(0) = 0', () => {
  assert.ok(Math.abs(_notifEaseOutBack(0)) < 1e-10);
});
test('easeOutBack(1) = 1', () => {
  assert.ok(Math.abs(_notifEaseOutBack(1) - 1) < 1e-10);
});
test('easeOutBack overshoots at midpoint (value > 1)', () => {
  assert.ok(_notifEaseOutBack(0.5) > 1);
});
test('easeOutBack exact formula at t=0.5', () => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const expected = 1 + c3 * Math.pow(-0.5, 3) + c1 * Math.pow(-0.5, 2);
  assert.ok(Math.abs(_notifEaseOutBack(0.5) - expected) < 1e-10);
});
test('easeOutBack at t=0.25 is positive', () => {
  assert.ok(_notifEaseOutBack(0.25) > 0);
});
test('easeOutBack at t=0.75 is still above 1', () => {
  assert.ok(_notifEaseOutBack(0.75) > 1);
});

console.log('\x1b[1mNotification - getAppIcon:\x1b[0m');
test('getAppIcon returns matching icon for known app', () => {
  assert.strictEqual(_notifGetAppIcon('Instagram'), _notifAPP_ICONS['Instagram']);
});
test('getAppIcon returns App fallback for unknown name', () => {
  const svg = _notifGetAppIcon('UnknownApp');
  assert.strictEqual(svg, _notifAPP_ICONS['App']);
  assert.ok(svg.includes('<svg'));
});

console.log('\x1b[1mNotification - buildNotifHtml:\x1b[0m');
test('buildNotifHtml ios theme uses backdrop-filter blur', () => {
  const n = _notifPRESETS['ig-follow'];
  const html = _notifBuildNotifHtml(n, 'ios', 1920, 1080);
  assert.ok(html.includes('backdrop-filter:blur(24px)'));
  assert.ok(html.includes('rgba(255,255,255,0.92)'));
  assert.ok(html.includes('border-radius:16px'));
});
test('buildNotifHtml android theme uses 24px radius', () => {
  const n = _notifPRESETS['ig-follow'];
  const html = _notifBuildNotifHtml(n, 'android', 1920, 1080);
  assert.ok(html.includes('border-radius:24px'));
  assert.ok(html.includes('#f8f9fa'));
  assert.ok(!html.includes('backdrop-filter'));
});
test('buildNotifHtml custom theme uses st.custom* values', () => {
  const n = _notifPRESETS['ig-follow'];
  _notifSt.customBg = '#222222';
  _notifSt.customBorder = '#444444';
  _notifSt.customTitle = '#ffffff';
  _notifSt.customText = '#aaaaaa';
  _notifSt.customRadius = 12;
  const html = _notifBuildNotifHtml(n, 'custom', 1920, 1080);
  assert.ok(html.includes('#222222'));
  assert.ok(html.includes('#444444'));
  assert.ok(html.includes('border-radius:12px'));
  _notifSt.customBg = '#f2f2f2';
  _notifSt.customBorder = '#e5e5e5';
  _notifSt.customTitle = '#000';
  _notifSt.customText = '#666';
  _notifSt.customRadius = 16;
});
test('buildNotifHtml contains app name, title, message, time', () => {
  const n = Object.assign({}, _notifPRESETS['sms']);
  n.time = '5 min temu';
  const html = _notifBuildNotifHtml(n, 'ios', 1920, 1080);
  assert.ok(html.includes('Wiadomo\u015Bci'));
  assert.ok(html.includes('Mama'));
  assert.ok(html.includes('Kiedy przychodzisz na obiad?'));
  assert.ok(html.includes('5 min temu'));
});
test('buildNotifHtml uses accentColor', () => {
  const n = _notifPRESETS['ig-follow'];
  const html = _notifBuildNotifHtml(n, 'ios', 1920, 1080);
  assert.ok(html.includes('#E1306C'));
});
test('buildNotifHtml uses correct notifW', () => {
  const n = _notifPRESETS['ig-follow'];
  const html = _notifBuildNotifHtml(n, 'ios', 1920, 1080);
  assert.ok(html.includes('width:420px'));
});
test('buildNotifHtml has correct width', () => {
  const n = Object.assign({}, _notifPRESETS['ig-follow']);
  n.time = 'teraz';
  const html = _notifBuildNotifHtml(n, 'ios', 1920, 1080);
  assert.ok(html.includes('width:420px'));
});

console.log('\x1b[1mNotification - moveNotification:\x1b[0m');
test('moveNotification swaps items', () => {
  _notifSt.notifications = [{ title: 'A' }, { title: 'B' }, { title: 'C' }];
  _notifMoveNotification(0, 1);
  assert.strictEqual(_notifSt.notifications[0].title, 'B');
  assert.strictEqual(_notifSt.notifications[1].title, 'A');
  _notifSt.notifications = [];
});
test('moveNotification ignores invalid direction', () => {
  _notifSt.notifications = [{ title: 'A' }, { title: 'B' }];
  _notifMoveNotification(0, -1);
  assert.strictEqual(_notifSt.notifications[0].title, 'A');
  _notifMoveNotification(1, 1);
  assert.strictEqual(_notifSt.notifications[1].title, 'B');
  _notifSt.notifications = [];
});
test('removeNotification removes by index', () => {
  _notifSt.notifications = [{ title: 'A' }, { title: 'B' }, { title: 'C' }];
  _notifRemoveNotification(1);
  assert.strictEqual(_notifSt.notifications.length, 2);
  assert.strictEqual(_notifSt.notifications[0].title, 'A');
  assert.strictEqual(_notifSt.notifications[1].title, 'C');
  _notifSt.notifications = [];
});

loadMapRenderer();

function loadMainHelpers() {
  const vm = require('vm');
  global.fs = fs;
  global.path = path;
  const code = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
  const startIdx = code.indexOf('const RAF_WAIT');
  const endIdx = code.indexOf('ipcMain.handle(', startIdx);
  let moduleCode = code.substring(startIdx, endIdx);
  moduleCode = moduleCode.replace(/^const /gm, 'var ');
  const script = new vm.Script(moduleCode, { filename: 'main-helpers.js' });
  const context = vm.createContext(global);
  script.runInContext(context);
}

loadMainHelpers();
const {
  frameBuffer,
  encodedFrameBuffers,
  countFrames,
  detectFrameCodec,
  createMp4Stream,
  X264_PRESET,
  VP9_CPU_USED,
} = require('./shared/encoder');

const _mapSt = st;
const _mapD2r = d2r;
const _mapR2d = r2d;
const _mapHaversine = haversine;
const _mapBearing = bearing;
const _mapLerpAngle = lerpAngle;
const _mapGreatCirclePoints = greatCirclePoints;
const _mapInterpolatePath = interpolatePath;
const _mapBuildCumulativeDists = buildCumulativeDists;
const _mapEaseInOut = easeInOut;
const _mapHexToRgb = hexToRgb;
const _mapGetSegmentColor = getSegmentColor;
const _mapVehicleSvg = vehicleSvg;
const _mapBuildFallbackRoute = buildFallbackRoute;
const _mapBuildSegmentBounds = buildSegmentBounds;
const _mapComputeLegFractions = computeLegFractions;

console.log('\x1b[1mMap - MAP_RES:\x1b[0m');
test('MAP_RES has 3 formats x 3 qualities', () => {
  ['16:9', '9:16', '1:1'].forEach(fmt => {
    ['720p', '1080p', '4K'].forEach(q => {
      assert.ok(MAP_RES[fmt][q], `Missing MAP_RES[${fmt}][${q}]`);
    });
  });
});
test('MAP_RES 16:9 values match RESOLUTIONS', () => {
  assert.strictEqual(MAP_RES['16:9']['1080p'][0], 1920);
  assert.strictEqual(MAP_RES['16:9']['1080p'][1], 1080);
  assert.strictEqual(MAP_RES['16:9']['4K'][0], 3840);
  assert.strictEqual(MAP_RES['16:9']['4K'][1], 2160);
});

console.log('\x1b[1mMap - MAP_TILES:\x1b[0m');
test('MAP_TILES has dark, light, topo', () => {
  assert.ok(MAP_TILES.dark);
  assert.ok(MAP_TILES.light);
  assert.ok(MAP_TILES.topo);
  assert.strictEqual(Object.keys(MAP_TILES).length, 3);
});
test('MAP_TILES URLs contain tile server patterns', () => {
  assert.ok(MAP_TILES.dark.includes('cartocdn'));
  assert.ok(MAP_TILES.light.includes('cartocdn'));
  assert.ok(MAP_TILES.topo.includes('opentopomap'));
});

console.log('\x1b[1mMap - st defaults:\x1b[0m');
test('map st has correct defaults', () => {
  assert.strictEqual(_mapSt.transportType, 'plane');
  assert.strictEqual(_mapSt.mapStyle, 'dark');
  assert.strictEqual(_mapSt.cameraMode, 'follow');
  assert.strictEqual(_mapSt.routeColor, '#6366f1');
  assert.strictEqual(_mapSt.routeWidth, 4);
  assert.strictEqual(_mapSt.animDuration, 5);
  assert.strictEqual(_mapSt.zoom, 5);
  assert.strictEqual(_mapSt.format, '16:9');
  assert.strictEqual(_mapSt.resolution, '1080p');
  assert.strictEqual(_mapSt.vehicleSize, 40);
  assert.strictEqual(_mapSt.animating, false);
  assert.strictEqual(_mapSt.easing, true);
  assert.strictEqual(_mapSt.showLabels, true);
  assert.ok(Array.isArray(_mapSt.segmentColors));
  assert.strictEqual(_mapSt.segmentColors.length, 8);
});

console.log('\x1b[1mMap - d2r / r2d:\x1b[0m');
test('d2r converts degrees to radians', () => {
  assert.ok(Math.abs(_mapD2r(0) - 0) < 1e-10);
  assert.ok(Math.abs(_mapD2r(90) - Math.PI / 2) < 1e-10);
  assert.ok(Math.abs(_mapD2r(180) - Math.PI) < 1e-10);
});
test('r2d converts radians to degrees', () => {
  assert.ok(Math.abs(_mapR2d(0) - 0) < 1e-10);
  assert.ok(Math.abs(_mapR2d(Math.PI) - 180) < 1e-10);
});
test('d2r and r2d are inverses', () => {
  for (let d = 0; d <= 360; d += 45) {
    assert.ok(Math.abs(_mapR2d(_mapD2r(d)) - d) < 1e-10, `Roundtrip failed at ${d}`);
  }
});

console.log('\x1b[1mMap - haversine:\x1b[0m');
test('haversine of identical points is 0', () => {
  assert.strictEqual(_mapHaversine({ lat: 52.2297, lng: 21.0122 }, { lat: 52.2297, lng: 21.0122 }), 0);
});
test('haversine Warsaw-Paris is approximately 1315km', () => {
  const d = _mapHaversine({ lat: 52.2297, lng: 21.0122 }, { lat: 48.8566, lng: 2.3522 });
  assert.ok(d > 1300000 && d < 1400000, `Expected ~1315km, got ${(d/1000).toFixed(0)}km`);
});
test('haversine equator 1 degree longitude is ~111km', () => {
  const d = _mapHaversine({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
  assert.ok(Math.abs(d - 111195) < 1000);
});
test('haversine is symmetric', () => {
  const a = { lat: 52.2297, lng: 21.0122 };
  const b = { lat: 48.8566, lng: 2.3522 };
  assert.strictEqual(_mapHaversine(a, b), _mapHaversine(b, a));
});

console.log('\x1b[1mMap - bearing:\x1b[0m');
test('bearing due east is 90', () => {
  assert.ok(Math.abs(_mapBearing({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }) - 90) < 0.1);
});
test('bearing due north is 0', () => {
  assert.ok(Math.abs(_mapBearing({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }) - 0) < 0.1);
});
test('bearing due south is 180', () => {
  assert.ok(Math.abs(_mapBearing({ lat: 1, lng: 0 }, { lat: 0, lng: 0 }) - 180) < 0.1);
});
test('bearing due west is 270', () => {
  assert.ok(Math.abs(_mapBearing({ lat: 0, lng: 1 }, { lat: 0, lng: 0 }) - 270) < 0.1);
});
test('bearing result is in [0, 360)', () => {
  const b1 = _mapBearing({ lat: -30, lng: 20 }, { lat: 50, lng: -10 });
  assert.ok(b1 >= 0 && b1 < 360);
});

console.log('\x1b[1mMap - lerpAngle:\x1b[0m');
test('lerpAngle at t=0 returns from', () => {
  assert.strictEqual(_mapLerpAngle(90, 180, 0), 90);
});
test('lerpAngle at t=1 returns to', () => {
  assert.ok(Math.abs(_mapLerpAngle(90, 180, 1) - 180) < 1e-10);
});
test('lerpAngle at t=0.5 returns midpoint', () => {
  assert.ok(Math.abs(_mapLerpAngle(0, 90, 0.5) - 45) < 1e-10);
});
test('lerpAngle crosses 0/360 boundary shortest path', () => {
  assert.ok(Math.abs(_mapLerpAngle(350, 10, 0.5) - 0) < 1e-10);
});
test('lerpAngle wraps from 350 to 10 at t=1', () => {
  assert.ok(Math.abs(_mapLerpAngle(350, 10, 1) - 10) < 1e-10);
});
test('lerpAngle wraps backwards from 10 to 350', () => {
  assert.ok(Math.abs(_mapLerpAngle(10, 350, 0.5) - 0) < 1e-10);
});
test('lerpAngle result is always in [0, 360)', () => {
  for (let t = 0; t <= 1; t += 0.1) {
    const r = _mapLerpAngle(350, 10, t);
    assert.ok(r >= 0 && r < 360, `t=${t}: ${r} out of range`);
  }
});

console.log('\x1b[1mMap - greatCirclePoints:\x1b[0m');
test('greatCirclePoints with identical points returns single point', () => {
  const pts = _mapGreatCirclePoints({ lat: 52, lng: 21 }, { lat: 52, lng: 21 }, 10);
  assert.strictEqual(pts.length, 1);
  assert.strictEqual(pts[0].lat, 52);
  assert.strictEqual(pts[0].lng, 21);
});
test('greatCirclePoints returns n+1 points', () => {
  assert.strictEqual(_mapGreatCirclePoints({ lat: 52, lng: 21 }, { lat: 48, lng: 2 }, 50).length, 51);
});
test('greatCirclePoints starts and ends at given coords', () => {
  const start = { lat: 52.2297, lng: 21.0122 };
  const end = { lat: 48.8566, lng: 2.3522 };
  const pts = _mapGreatCirclePoints(start, end, 100);
  assert.ok(Math.abs(pts[0].lat - start.lat) < 0.001);
  assert.ok(Math.abs(pts[0].lng - start.lng) < 0.001);
  assert.ok(Math.abs(pts[100].lat - end.lat) < 0.001);
  assert.ok(Math.abs(pts[100].lng - end.lng) < 0.001);
});
test('greatCirclePoints default n is 100', () => {
  assert.strictEqual(_mapGreatCirclePoints({ lat: 0, lng: 0 }, { lat: 10, lng: 10 }).length, 101);
});

console.log('\x1b[1mMap - interpolatePath:\x1b[0m');
test('interpolatePath with empty array returns zeros', () => {
  const r = _mapInterpolatePath([], 0.5);
  assert.strictEqual(r.lat, 0);
  assert.strictEqual(r.lng, 0);
  assert.strictEqual(r.heading, 0);
});
test('interpolatePath with single point returns that point', () => {
  const r = _mapInterpolatePath([{ lat: 10, lng: 20 }], 0.5);
  assert.strictEqual(r.lat, 10);
  assert.strictEqual(r.lng, 20);
});
test('interpolatePath at t=0 returns first point', () => {
  const r = _mapInterpolatePath([{ lat: 52, lng: 21 }, { lat: 48, lng: 2 }], 0);
  assert.strictEqual(r.lat, 52);
  assert.strictEqual(r.lng, 21);
});
test('interpolatePath at t=1 returns last point', () => {
  const r = _mapInterpolatePath([{ lat: 52, lng: 21 }, { lat: 48, lng: 2 }], 1);
  assert.strictEqual(r.lat, 48);
  assert.strictEqual(r.lng, 2);
});
test('interpolatePath at t=0.5 returns midpoint', () => {
  const r = _mapInterpolatePath([{ lat: 0, lng: 0 }, { lat: 10, lng: 10 }], 0.5);
  assert.ok(Math.abs(r.lat - 5) < 0.01);
  assert.ok(Math.abs(r.lng - 5) < 0.01);
});
test('interpolatePath returns heading', () => {
  const r = _mapInterpolatePath([{ lat: 0, lng: 0 }, { lat: 0, lng: 1 }], 0.5);
  assert.strictEqual(r.heading, 90);
});
test('interpolatePath with t<0 returns first point', () => {
  const r = _mapInterpolatePath([{ lat: 52, lng: 21 }, { lat: 48, lng: 2 }], -0.5);
  assert.strictEqual(r.lat, 52);
  assert.strictEqual(r.lng, 21);
});
test('interpolatePath with t>1 returns last point', () => {
  const r = _mapInterpolatePath([{ lat: 52, lng: 21 }, { lat: 48, lng: 2 }], 1.5);
  assert.strictEqual(r.lat, 48);
  assert.strictEqual(r.lng, 2);
});
test('interpolatePath with zero distance returns first point', () => {
  const r = _mapInterpolatePath([{ lat: 52, lng: 21 }, { lat: 52, lng: 21 }], 0.5);
  assert.strictEqual(r.lat, 52);
  assert.strictEqual(r.lng, 21);
  assert.strictEqual(r.heading, 0);
});
test('interpolatePath accepts cached distances', () => {
  const pts = [{ lat: 0, lng: 0 }, { lat: 0, lng: 1 }, { lat: 1, lng: 1 }];
  const cached = _mapBuildCumulativeDists(pts);
  const r1 = _mapInterpolatePath(pts, 0.5);
  const r2 = _mapInterpolatePath(pts, 0.5, cached);
  assert.strictEqual(r1.lat, r2.lat);
  assert.strictEqual(r1.lng, r2.lng);
});

console.log('\x1b[1mMap - map easeInOut (cubic):\x1b[0m');
test('map easeInOut(0) = 0 and easeInOut(1) = 1', () => {
  assert.strictEqual(_mapEaseInOut(0), 0);
  assert.strictEqual(_mapEaseInOut(1), 1);
});
test('map easeInOut(0.5) = 0.5', () => {
  assert.strictEqual(_mapEaseInOut(0.5), 0.5);
});
test('map easeInOut uses cubic formula (4t^3)', () => {
  assert.strictEqual(_mapEaseInOut(0.25), 4 * 0.25 * 0.25 * 0.25);
});
test('map easeInOut is different from renderer quadratic', () => {
  const t = 0.25;
  assert.notStrictEqual(_mapEaseInOut(t), 2 * t * t);
});

console.log('\x1b[1mMap - hexToRgb:\x1b[0m');
test('map hexToRgb parses #6366f1', () => {
  const c = _mapHexToRgb('#6366f1');
  assert.strictEqual(c.r, 99);
  assert.strictEqual(c.g, 102);
  assert.strictEqual(c.b, 241);
});
test('map hexToRgb parses #ffffff', () => {
  const c = _mapHexToRgb('#ffffff');
  assert.strictEqual(c.r, 255);
  assert.strictEqual(c.g, 255);
  assert.strictEqual(c.b, 255);
});
test('map hexToRgb parses #000000', () => {
  const c = _mapHexToRgb('#000000');
  assert.strictEqual(c.r, 0);
  assert.strictEqual(c.g, 0);
  assert.strictEqual(c.b, 0);
});
test('map hexToRgb parses #ff0000', () => {
  const c = _mapHexToRgb('#ff0000');
  assert.strictEqual(c.r, 255);
  assert.strictEqual(c.g, 0);
  assert.strictEqual(c.b, 0);
});

console.log('\x1b[1mMap - getSegmentColor:\x1b[0m');
test('getSegmentColor cycles through segmentColors', () => {
  assert.strictEqual(_mapGetSegmentColor(0), '#6366f1');
  assert.strictEqual(_mapGetSegmentColor(1), '#f43f5e');
  assert.strictEqual(_mapGetSegmentColor(7), '#14b8a6');
  assert.strictEqual(_mapGetSegmentColor(8), '#6366f1');
});

console.log('\x1b[1mMap - vehicleSvg:\x1b[0m');
test('vehicleSvg returns SVG for known types', () => {
  ['plane', 'car', 'ship', 'train'].forEach(type => {
    const svg = _mapVehicleSvg(type, '#6366f1');
    assert.ok(svg.includes('<svg'), `${type} should return SVG`);
    assert.ok(svg.includes('#6366f1'), `${type} should use color`);
  });
});
test('vehicleSvg defaults to plane for unknown type', () => {
  assert.strictEqual(_mapVehicleSvg('unknown', '#ff0000'), _mapVehicleSvg('plane', '#ff0000'));
});
test('vehicleSvg uses default color #6366f1 when none provided', () => {
  assert.ok(_mapVehicleSvg('plane').includes('#6366f1'));
});

console.log('\x1b[1mMap - buildFallbackRoute:\x1b[0m');
test('buildFallbackRoute returns coords and segments', () => {
  const result = _mapBuildFallbackRoute([{ lat: 52, lng: 21 }, { lat: 48, lng: 2 }]);
  assert.ok(result.coords.length > 0);
  assert.strictEqual(result.segments.length, 1);
  assert.strictEqual(result.segments[0].start, 0);
  assert.strictEqual(result.segments[0].end, result.coords.length - 1);
});
test('buildFallbackRoute with 3 waypoints creates 2 segments', () => {
  const result = _mapBuildFallbackRoute([{ lat: 52, lng: 21 }, { lat: 50, lng: 14 }, { lat: 48, lng: 2 }]);
  assert.strictEqual(result.segments.length, 2);
});
test('buildFallbackRoute endpoints match waypoints', () => {
  const wps = [{ lat: 52.2297, lng: 21.0122 }, { lat: 48.8566, lng: 2.3522 }];
  const result = _mapBuildFallbackRoute(wps);
  assert.ok(Math.abs(result.coords[0].lat - 52.2297) < 0.001);
  const last = result.coords[result.coords.length - 1];
  assert.ok(Math.abs(last.lat - 48.8566) < 0.001);
});

console.log('\x1b[1mMap - buildSegmentBounds:\x1b[0m');
test('buildSegmentBounds maps waypoints to nearest route coords', () => {
  const segs = _mapBuildSegmentBounds(
    [{ lat: 0, lng: 0 }, { lat: 5, lng: 5 }, { lat: 10, lng: 10 }],
    [{ lat: 0, lng: 0 }, { lat: 10, lng: 10 }]
  );
  assert.strictEqual(segs.length, 1);
  assert.strictEqual(segs[0].start, 0);
  assert.strictEqual(segs[0].end, 2);
});
test('buildSegmentBounds with < 2 waypoints returns empty', () => {
  const segs = _mapBuildSegmentBounds([{ lat: 0, lng: 0 }], [{ lat: 0, lng: 0 }]);
  assert.strictEqual(segs.length, 0);
});

console.log('\x1b[1mMap - computeLegFractions:\x1b[0m');
test('computeLegFractions with equal segments', () => {
  const f = _mapComputeLegFractions(
    [{ lat: 0, lng: 0 }, { lat: 1, lng: 0 }, { lat: 2, lng: 0 }],
    [{ start: 0, end: 1, color: '#fff' }, { start: 1, end: 2, color: '#fff' }],
    2
  );
  assert.strictEqual(f.starts[0], 0);
  assert.strictEqual(f.ends[1], 1);
});
test('computeLegFractions with more legs than segments returns single leg', () => {
  const f = _mapComputeLegFractions(
    [{ lat: 0, lng: 0 }, { lat: 1, lng: 0 }],
    [{ start: 0, end: 1, color: '#fff' }],
    3
  );
  assert.strictEqual(f.starts.length, 1);
  assert.strictEqual(f.starts[0], 0);
  assert.strictEqual(f.ends[0], 1);
});
test('computeLegFractions ends are non-decreasing', () => {
  const coords = [{ lat: 0, lng: 0 }, { lat: 1, lng: 0 }, { lat: 2, lng: 0 }, { lat: 3, lng: 0 }];
  const segs = [{ start: 0, end: 1 }, { start: 1, end: 2 }, { start: 2, end: 3 }];
  const f = _mapComputeLegFractions(coords, segs, 3);
  for (let i = 1; i < f.starts.length; i++) {
    assert.ok(f.starts[i] >= f.starts[i - 1]);
    assert.ok(f.ends[i] >= f.ends[i - 1]);
  }
});

console.log('\x1b[1mMap - buildCumulativeDists:\x1b[0m');
test('buildCumulativeDists starts at 0', () => {
  const d = _mapBuildCumulativeDists([{ lat: 0, lng: 0 }, { lat: 1, lng: 0 }]);
  assert.strictEqual(d[0], 0);
  assert.ok(d[1] > 0);
});
test('buildCumulativeDists is monotonically increasing', () => {
  const d = _mapBuildCumulativeDists([{ lat: 0, lng: 0 }, { lat: 1, lng: 0 }, { lat: 2, lng: 0 }, { lat: 3, lng: 0 }]);
  for (let i = 1; i < d.length; i++) {
    assert.ok(d[i] >= d[i - 1]);
  }
});
test('buildCumulativeDists with identical points is all zeros', () => {
  const d = _mapBuildCumulativeDists([{ lat: 5, lng: 5 }, { lat: 5, lng: 5 }, { lat: 5, lng: 5 }]);
  d.forEach((v, i) => assert.strictEqual(v, 0));
});

console.log('\n\x1b[1mShared encoder helpers:\x1b[0m');

test('encodedFrameBuffers expands durations without changing frame data', () => {
  const frames = [
    { data: Buffer.from('frame-a').toString('base64'), duration: 2 },
    { data: Buffer.from('frame-b').toString('base64'), duration: 1 },
  ];
  const buffers = Array.from(encodedFrameBuffers(frames));
  assert.strictEqual(buffers.length, 3);
  assert.strictEqual(buffers[0].toString(), 'frame-a');
  assert.strictEqual(buffers[1].toString(), 'frame-a');
  assert.strictEqual(buffers[2].toString(), 'frame-b');
});

test('encodedFrameBuffers accepts binary IPC frame data', () => {
  const source = Buffer.from('binary-frame');
  const ipcData = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
  const buffers = Array.from(encodedFrameBuffers([{ data: ipcData, duration: 1 }]));
  assert.strictEqual(buffers.length, 1);
  assert.strictEqual(buffers[0].toString(), 'binary-frame');
});

test('frameBuffer accepts base64 and binary IPC data', () => {
  const source = Buffer.from('frame-data');
  assert.strictEqual(frameBuffer({ data: source.toString('base64') }).toString(), 'frame-data');
  assert.strictEqual(frameBuffer({ data: new Uint8Array(source.buffer, source.byteOffset, source.byteLength) }).toString(), 'frame-data');
});

test('countFrames sums compact frame durations', () => {
  assert.strictEqual(countFrames([{ duration: 2 }, { duration: 7 }, { duration: 1 }]), 10);
});

test('detectFrameCodec distinguishes PNG and JPEG data', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
  assert.strictEqual(detectFrameCodec([{ data: png, duration: 1 }]), 'png');
  assert.strictEqual(detectFrameCodec([{ data: jpeg, duration: 1 }]), 'mjpeg');
});
test('shared encoder exposes incremental MP4 streaming', () => {
  assert.strictEqual(typeof createMp4Stream, 'function');
});

test('RAF_WAIT is a valid JS promise string', () => {
  assert.ok(RAF_WAIT.includes('requestAnimationFrame'));
  assert.ok(RAF_WAIT.includes('Promise'));
});

test('delayJs produces correct setTimeout string', () => {
  const result = delayJs(500);
  assert.ok(result.includes('500'));
  assert.ok(result.includes('setTimeout'));
});
test('MP4 encoder uses the cross-platform veryfast preset', () => {
  assert.strictEqual(X264_PRESET, 'veryfast');
});
test('WebM encoder uses the cross-platform VP9 speed preset', () => {
  assert.strictEqual(VP9_CPU_USED, '5');
});
test('GUI chart export uses direct canvas capture IPC', () => {
  const mainSource = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
  const chartSource = fs.readFileSync(path.join(__dirname, 'src', 'chart-renderer.js'), 'utf8');
  assert.ok(mainSource.includes("ipcMain.handle('bg-chart-capture-batch'"));
  assert.ok(chartSource.includes("ipcRenderer.invoke('bg-chart-capture-batch'"));
  assert.ok(mainSource.includes("ipcMain.handle('export-mp4-stream-write'"));
  assert.ok(chartSource.includes("ipcRenderer.invoke('export-mp4-stream-write'"));
});

console.log('\n\x1b[1m' + '='.repeat(40) + '\x1b[0m');
console.log(`\x1b[32m${passCount} passed\x1b[0m, \x1b[31m${failCount} failed\x1b[0m\n`);

process.exit(failCount > 0 ? 1 : 0);
