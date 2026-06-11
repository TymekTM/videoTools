const path = require('path');

const moduleRoot = process.env.VT_NODE_MODULES;
const executablePath = process.env.VT_CHROME_PATH;

if (moduleRoot && executablePath) {
  const puppeteer = require(path.join(moduleRoot, 'puppeteer'));
  const launch = puppeteer.launch.bind(puppeteer);
  puppeteer.launch = function (options) {
    return launch({
      ...(options || {}),
      executablePath,
    });
  };
}
