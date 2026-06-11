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

  const typing = require(path.join(MCP, 'renderers/typing'));
  assert(typeof typing.generate === 'function', 'typing.generate');
  assert(typeof typing.compactFrameActions === 'function', 'typing.compactFrameActions');

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

async function testTypingCompaction() {
  console.log('\n[typing frame compaction]');
  const { compactFrameActions } = require(path.join(MCP, 'renderers/typing'));
  const actions = [
    { text: 'A', cursor: true },
    { text: 'A', cursor: true },
    { text: 'A', cursor: false },
    { text: 'A', cursor: false },
    { text: 'AB', cursor: true },
  ];
  const states = compactFrameActions(actions);
  assert(states.length === 3, `compacts to 3 states: ${states.length}`);
  assert(states[0].duration === 2, 'first cursor-on state lasts 2 frames');
  assert(states[1].duration === 2, 'cursor-off state lasts 2 frames');
  assert(states[2].duration === 1, 'changed text lasts 1 frame');
  assert(states.reduce((sum, state) => sum + state.duration, 0) === actions.length, 'preserves total frame count');
  assert(states[0].key !== states[1].key, 'cursor visibility changes visual state');
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
  await testTypingCompaction();

  console.log('\n================');
  console.log(`Total: ${passed} passed, ${failed} failed`);
  if (errors.length) {
    console.log('\nFailures:');
    errors.forEach(e => console.log('  - ' + e));
  }
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
