const puppeteer = require('puppeteer');
const fs = require('fs');

let browser = null;
const pagePool = [];
const MAX_POOLED_PAGES = 2;

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
  let page = null;
  while (pagePool.length && !page) {
    const candidate = pagePool.pop();
    if (!candidate.isClosed()) page = candidate;
  }
  if (!page) page = await b.newPage();
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
    return page.screenshot({
      type: 'png',
      encoding: 'base64',
      optimizeForSpeed: true,
    });
  }
  return page.screenshot({ type: 'jpeg', quality: 92, encoding: 'base64' });
}

async function captureCanvasFrame(page, selector = 'canvas', format = 'jpeg') {
  return page.evaluate((canvasSelector, imageFormat) => {
    const canvas = document.querySelector(canvasSelector);
    if (!canvas) throw new Error(`Canvas not found: ${canvasSelector}`);
    const mime = imageFormat === 'png' ? 'image/png' : 'image/jpeg';
    const quality = imageFormat === 'png' ? undefined : 0.92;
    return canvas.toDataURL(mime, quality).split(',')[1];
  }, selector, format);
}

async function evalAndCapture(page, js, format = 'jpeg') {
  if (js) await page.evaluate(js);
  return captureFrame(page, format);
}

async function createScreencast(page, options = {}) {
  const client = await page.target().createCDPSession();
  let latestFrame = null;
  let lastFrame = null;
  let waiter = null;
  let stopped = false;

  client.on('Page.screencastFrame', (event) => {
    client.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch(() => {});
    latestFrame = event.data;
    lastFrame = event.data;
    if (waiter) {
      const resolve = waiter;
      waiter = null;
      resolve();
    }
  });

  await client.send('Page.startScreencast', {
    format: options.format || 'jpeg',
    quality: options.quality || 92,
    maxWidth: options.width,
    maxHeight: options.height,
    everyNthFrame: 1,
  });

  async function waitForFrame(timeoutMs = 5000) {
    if (latestFrame) return;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        waiter = null;
        reject(new Error('Timed out waiting for a compositor frame'));
      }, timeoutMs);
      waiter = () => {
        clearTimeout(timer);
        resolve();
      };
    });
  }

  await waitForFrame();
  latestFrame = null;

  return {
    async capture(js) {
      if (stopped) throw new Error('Cannot capture from a stopped screencast');
      latestFrame = null;
      await page.evaluate((source) => {
        if (source) (0, eval)(source);
        return new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        });
      }, js);
      try {
        await waitForFrame(options.unchangedTimeoutMs || 5000);
      } catch (error) {
        if (!options.unchangedTimeoutMs || !lastFrame) throw error;
      }
      const frame = latestFrame;
      latestFrame = null;
      return frame || lastFrame;
    },
    async stop() {
      if (stopped) return;
      stopped = true;
      try {
        await client.send('Page.stopScreencast');
      } catch {}
      try {
        await client.detach();
      } catch {}
    },
  };
}

async function closePage(page) {
  try {
    if (!browser || !browser.connected || page.isClosed()) return;
    if (pagePool.length >= MAX_POOLED_PAGES) {
      await page.close();
      return;
    }
    await page.goto('about:blank', { waitUntil: 'domcontentloaded' });
    pagePool.push(page);
  } catch {}
}

async function closeBrowser() {
  if (browser) {
    try {
      await browser.close();
    } catch {}
    browser = null;
  }
  pagePool.length = 0;
}

module.exports = {
  getBrowser,
  createPage,
  loadHtml,
  waitForFonts,
  captureFrame,
  captureCanvasFrame,
  evalAndCapture,
  createScreencast,
  closePage,
  closeBrowser,
  findChrome,
};
