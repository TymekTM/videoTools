const puppeteer = require('puppeteer');

let browser = null;

async function getBrowser() {
  if (!browser || !browser.connected) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
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

async function waitForFonts(page) {
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 200));
}

async function captureFrame(page, format = 'jpeg') {
  if (format === 'png') {
    const buf = await page.screenshot({ type: 'png' });
    return buf.toString('base64');
  }
  const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
  return buf.toString('base64');
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
};
