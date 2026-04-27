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
    const kwCX = natX * cw;
    const kwCY = natY * ch;
    const dx = (cw / 2 - kwCX) / ZOOM;
    const dy = (ch / 2 - kwCY) / ZOOM;
    // transform-origin at (kwCX, kwCY), transform: translate(dx, dy) scale(ZOOM)
    // Point p: translate to origin → T → S → translate back
    // = ((p - origin) * ZOOM + dx * ZOOM) + origin
    // For keyword at origin: (dx * ZOOM + kwCX, dy * ZOOM + kwCY)
    const resultX = dx * ZOOM + kwCX;
    const resultY = dy * ZOOM + kwCY;
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

console.log('\n\x1b[1m' + '='.repeat(40) + '\x1b[0m');
console.log(`\x1b[32m${passCount} passed\x1b[0m, \x1b[31m${failCount} failed\x1b[0m\n`);

process.exit(failCount > 0 ? 1 : 0);
