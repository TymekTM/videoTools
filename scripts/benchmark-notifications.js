const { app, BrowserWindow } = require('electron');
const { performance } = require('perf_hooks');

const WIDTH = 640;
const HEIGHT = 360;
const FPS = 30;
const COUNT = Number(process.env.VT_BENCH_NOTIFICATIONS || 3);
const ANIM_SPEED = 800;
const SLIDE_DURATION = 400;
const TOTAL_MS = COUNT * ANIM_SPEED + 2000;
const TOTAL_FRAMES = Math.round(TOTAL_MS / 1000 * FPS);

function buildSpecs() {
  const specs = [];
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = TOTAL_FRAMES === 1 ? 1 : i / (TOTAL_FRAMES - 1);
    const elapsed = t * TOTAL_MS;
    const visibleCount = Math.min(COUNT, Math.floor(elapsed / ANIM_SPEED) + 1);
    const latestStart = Math.max(0, visibleCount - 1) * ANIM_SPEED;
    const isAnimating = visibleCount > 0 && elapsed - latestStart < SLIDE_DURATION;
    const key = isAnimating ? `frame:${i}` : `static:${visibleCount}`;
    const last = specs[specs.length - 1];
    if (last && last.key === key) last.duration++;
    else specs.push({ key, t, duration: 1 });
  }
  return specs;
}

const HTML = `<!doctype html><html><head><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#fff}
#c{position:relative;width:100%;height:100%}.n{position:absolute;right:20px;width:280px;height:70px;border-radius:16px;background:#eee;box-shadow:0 8px 24px #0003;font:700 16px Arial;padding:20px}
</style></head><body><div id="c"></div><script>
const COUNT=${COUNT},AS=${ANIM_SPEED},SD=${SLIDE_DURATION},TM=${TOTAL_MS};
function ease(t){const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)}
window.renderFrame=function(t){
  const elapsed=t*TM,c=document.getElementById('c');c.innerHTML='';
  const visible=[];
  for(let i=0;i<COUNT;i++){const start=i*AS;if(elapsed<start)break;visible.push({i,lt:Math.min((elapsed-start)/SD,1)})}
  for(let v=visible.length-1;v>=0;v--){
    const item=visible[v],pos=visible.length-1-v,d=document.createElement('div');
    d.className='n';d.textContent='Notification '+item.i;
    d.style.top=(20+pos*82-120*(1-ease(item.lt)))+'px';
    d.style.opacity=Math.min(item.lt*2.5,1);c.appendChild(d);
  }
};
</script></body></html>`;

async function capture(win, t) {
  await win.webContents.executeJavaScript(`window.renderFrame(${t});new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(resolve)})})`);
  return (await win.webContents.capturePage()).toJPEG(92);
}

app.whenReady().then(async () => {
  const specs = buildSpecs();
  const win = new BrowserWindow({ width: WIDTH, height: HEIGHT, show: false, frame: false, webPreferences: { offscreen: true } });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(HTML)}`);
  await capture(win, 0);

  const legacyStarted = performance.now();
  const legacy = [];
  for (let i = 0; i < TOTAL_FRAMES; i++) legacy.push(await capture(win, i / (TOTAL_FRAMES - 1)));
  const legacyMs = performance.now() - legacyStarted;

  const optimizedStarted = performance.now();
  const unique = [];
  for (const spec of specs) unique.push(await capture(win, spec.t));
  const optimizedMs = performance.now() - optimizedStarted;
  const repeatA = await capture(win, 0);
  const repeatB = await capture(win, 0);

  let frame = 0;
  let exact = true;
  let firstMismatch = null;
  for (let i = 0; i < specs.length; i++) {
    for (let repeat = 0; repeat < specs[i].duration; repeat++) {
      if (!legacy[frame].equals(unique[i])) {
        exact = false;
        if (!firstMismatch) firstMismatch = { frame, spec: specs[i], repeat };
      }
      frame++;
    }
  }

  console.log(JSON.stringify({
    totalFrames: TOTAL_FRAMES,
    renderedStates: specs.length,
    legacyMs: Number(legacyMs.toFixed(1)),
    optimizedMs: Number(optimizedMs.toFixed(1)),
    speedup: Number((legacyMs / optimizedMs).toFixed(2)),
    exactEncodedMatch: exact,
    firstMismatch,
    preservedFrames: frame,
    repeatCaptureMatch: repeatA.equals(repeatB),
  }));
  win.destroy();
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
