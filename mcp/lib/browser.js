const puppeteer = require('puppeteer');
const fs = require('fs');

let browser = null;

function findChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.platform === 'win32' && 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    process.platform === 'win32' && 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.platform === 'win32' && 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function getBrowser() {
  if (!browser || !browser.connected) {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: findChrome(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
      ],
    });
  }
  return browser;
}

async function createPage(width, height) {
  const b = await getBrowser();
  const page = await b.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  return page;
}

async function loadHtml(page, html, waitForNetwork = false) {
  await page.setContent(html, {
    waitUntil: waitForNetwork ? 'networkidle0' : 'domcontentloaded',
    timeout: 120000,
  });
}

async function waitForFonts(page, timeoutMs = 5000) {
  await page.evaluate((timeout) => Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, timeout)),
  ]), timeoutMs);
}

async function captureFrame(page, format = 'jpeg') {
  if (format === 'png') {
    return page.screenshot({ type: 'png', encoding: 'base64' });
  }
  return page.screenshot({ type: 'jpeg', quality: 92, encoding: 'base64' });
}

async function evalAndCapture(page, js, format = 'jpeg') {
  if (js) await page.evaluate(js);
  return captureFrame(page, format);
}

async function closePage(page) {
  try {
    await page.close();
  } catch {}
}

async function closeBrowser() {
  if (browser) {
    try {
      await browser.close();
    } catch {}
    browser = null;
  }
}

module.exports = {
  getBrowser,
  createPage,
  loadHtml,
  waitForFonts,
  captureFrame,
  evalAndCapture,
  closePage,
  closeBrowser,
  findChrome,
};
