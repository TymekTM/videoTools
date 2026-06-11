const { app, BrowserWindow } = require('electron');
const { performance } = require('perf_hooks');

const WIDTH = 640;
const HEIGHT = 360;
const FPS = 30;
const DURATION = Number(process.env.VT_BENCH_DURATION || 10);

function makeLines() {
  const words = 'Renderer subtitles preserve every sampled visual state exactly'.split(' ');
  const lines = [];
  let time = 0.3;
  for (let lineIndex = 0; lineIndex < 5; lineIndex++) {
    const lineWords = words.map((word, wordIndex) => {
      const start = time + wordIndex * 0.22;
      return { word, start, end: start + 0.18 };
    });
    lines.push({
      start: lineWords[0].start,
      end: lineWords[lineWords.length - 1].end,
      words: lineWords,
    });
    time += 1.9;
  }
  return lines;
}

function stateKey(lines, t) {
  for (let i = 0; i < lines.length; i++) {
    if (t >= lines[i].start - 0.1 && t <= lines[i].end + 0.15) {
      const activeWords = [];
      for (let j = 0; j < lines[i].words.length; j++) {
        const word = lines[i].words[j];
        if (t >= word.start - 0.05 && t <= word.end + 0.05) {
          activeWords.push(j);
        }
      }
      return `${i}:${activeWords.join(',')}`;
    }
  }
  return 'blank';
}

function buildSpecs(lines, totalFrames) {
  const specs = [];
  for (let i = 0; i < totalFrames; i++) {
    const time = i / FPS;
    const key = stateKey(lines, time);
    const last = specs[specs.length - 1];
    if (last && last.key === key) {
      last.duration++;
    } else {
      specs.push({ key, time, duration: 1 });
    }
  }
  return specs;
}

function makeHtml(lines) {
  return `<!doctype html><html><head><style>
    html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#00f}
    #c{position:absolute;left:0;right:0;bottom:12%;display:flex;flex-direction:column;align-items:center}
    .sl{display:flex}.sw{font:700 28px Arial;color:#fff;padding:0 3px}.sw.a{color:#ff0}
  </style></head><body><div id="c"></div><script>
    const L=${JSON.stringify(lines)};
    window.seek=function(t){
      const c=document.getElementById('c');c.innerHTML='';
      let ci=-1;
      for(let i=0;i<L.length;i++){if(t>=L[i].start-0.1&&t<=L[i].end+0.15){ci=i;break}}
      if(ci<0)return;
      const d=document.createElement('div');d.className='sl';
      for(let j=0;j<L[ci].words.length;j++){
        const s=document.createElement('span');s.className='sw';
        if(t>=L[ci].words[j].start-0.05&&t<=L[ci].words[j].end+0.05)s.className='sw a';
        s.textContent=L[ci].words[j].word;d.appendChild(s);
      }
      c.appendChild(d);
    };
  </script></body></html>`;
}

async function capture(win, time) {
  await win.webContents.executeJavaScript(`window.seek(${time});new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(resolve)})})`);
  return (await win.webContents.capturePage()).toJPEG(92);
}

app.whenReady().then(async () => {
  const lines = makeLines();
  const totalFrames = Math.ceil(DURATION * FPS);
  const specs = buildSpecs(lines, totalFrames);
  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    show: false,
    frame: false,
    webPreferences: { offscreen: true },
  });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(makeHtml(lines))}`);

  const legacyStarted = performance.now();
  const legacy = [];
  for (let i = 0; i < totalFrames; i++) legacy.push(await capture(win, i / FPS));
  const legacyMs = performance.now() - legacyStarted;

  const optimizedStarted = performance.now();
  const unique = [];
  for (const spec of specs) unique.push(await capture(win, spec.time));
  const optimizedMs = performance.now() - optimizedStarted;

  let frameIndex = 0;
  let exactMatch = true;
  let firstMismatch = null;
  for (let i = 0; i < specs.length; i++) {
    for (let repeat = 0; repeat < specs[i].duration; repeat++) {
      if (!legacy[frameIndex].equals(unique[i])) {
        exactMatch = false;
        if (!firstMismatch) firstMismatch = { frame: frameIndex, spec: specs[i], repeat };
      }
      frameIndex++;
    }
  }

  console.log(JSON.stringify({
    totalFrames,
    uniqueStates: specs.length,
    legacyMs: Number(legacyMs.toFixed(1)),
    optimizedMs: Number(optimizedMs.toFixed(1)),
    speedup: Number((legacyMs / optimizedMs).toFixed(2)),
    exactEncodedMatch: exactMatch,
    firstMismatch,
    preservedFrames: frameIndex,
  }));
  win.destroy();
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
