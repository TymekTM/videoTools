const { createPage, loadHtml, waitForFonts, evalAndCapture, closePage } = require('../lib/browser');
const { encode } = require('../lib/encoder');
const { TEMPLATES, makeHelpers, shuffleArray } = require('../lib/templates');
const { getResolution } = require('../registry');

const FONTS_LINK = '<link href="https://fonts.googleapis.com/css2?family=Bitter:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;0,900;1,400&family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@400;600;700;900&family=Lora:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;500;600;700;800&family=Merriweather:wght@400;700;900&family=Outfit:wght@400;500;600;700;800&family=Oswald:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Roboto+Slab:wght@400;700&family=Sora:wght@400;600;700;800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=Space+Grotesk:wght@400;600;700&family=Work+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">';

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

const ANIMATION_PRESETS = {
  none: { resolve: () => null },
  zoomIn: { resolve: (p, s) => {
    const i = s.intensity;
    const z0 = s.zoom - (s.zoom - 1) * i;
    return { zoom: lerp(z0, s.zoom, p), offX: lerp(s.offX * (1 - i), s.offX, p), offY: lerp(s.offY * (1 - i), s.offY, p) };
  }},
  zoomOut: { resolve: (p, s) => {
    const i = s.intensity;
    const z1 = s.zoom - (s.zoom - 1) * i;
    return { zoom: lerp(s.zoom, z1, p), offX: lerp(s.offX, s.offX * (1 - i), p), offY: lerp(s.offY, s.offY * (1 - i), p) };
  }},
  panLeft: { resolve: (p, s) => ({ zoom: s.zoom, offX: lerp(200 * s.intensity, -200 * s.intensity, p) + s.offX, offY: s.offY }) },
  panRight: { resolve: (p, s) => ({ zoom: s.zoom, offX: lerp(-200 * s.intensity, 200 * s.intensity, p) + s.offX, offY: s.offY }) },
  panUp: { resolve: (p, s) => ({ zoom: s.zoom, offX: s.offX, offY: lerp(150 * s.intensity, -150 * s.intensity, p) + s.offY }) },
  panDown: { resolve: (p, s) => ({ zoom: s.zoom, offX: s.offX, offY: lerp(-150 * s.intensity, 150 * s.intensity, p) + s.offY }) },
  kenBurns: { resolve: (p, s) => {
    const i = s.intensity;
    return {
      zoom: lerp(s.zoom * (1 - 0.15 * i), s.zoom * (1 + 0.15 * i), p),
      offX: lerp(-120 * i, 120 * i, p) + s.offX,
      offY: lerp(-60 * i, 60 * i, p) + s.offY,
    };
  }},
  drift: { resolve: (p, s) => {
    const i = s.intensity;
    return {
      zoom: lerp(s.zoom * (1 - 0.05 * i), s.zoom * (1 + 0.05 * i), p),
      offX: lerp(-80 * i, 80 * i, p) + s.offX,
      offY: s.offY,
    };
  }},
  breathe: { resolve: (p, s) => {
    const t = Math.sin(p * Math.PI);
    return { zoom: s.zoom * (1 + 0.2 * s.intensity * t), offX: s.offX, offY: s.offY };
  }},
  swing: { resolve: (p, s) => {
    const i = s.intensity;
    return {
      zoom: lerp(s.zoom * (1 - 0.1 * i), s.zoom * (1 + 0.1 * i), p),
      offX: lerp(-150 * i, 150 * i, p) + s.offX,
      offY: lerp(40 * i, -40 * i, p) + s.offY,
    };
  }},
};

async function generate(params, outputPath, format) {
  const p = {
    keyword: 'SZTUKA',
    templates: null,
    format: '16:9',
    resolution: '1080p',
    duration: 30,
    fps: 30,
    speed: 800,
    colorAccent: '#facc15',
    customHeadline: '',
    customLead: '',
    zoomLevel: 2.0,
    zoomOffsetX: 0,
    zoomOffsetY: 0,
    fontSizeScale: 100,
    lineH: 1.72,
    vignetteOpacity: 70,
    vignetteSize: 60,
    vignetteSpread: 70,
    animationPreset: 'none',
    animIntensity: 100,
    ...params,
  };

  const [width, height] = getResolution(p.format, p.resolution);
  const fps = p.fps;
  const framesPerSlide = Math.max(1, Math.round((p.speed / 1000) * fps));
  const totalSlides = Math.ceil(p.duration * fps / framesPerSlide);

  const enabledTemplates = p.templates
    ? TEMPLATES.filter((t) => p.templates.includes(t.id))
    : TEMPLATES;
  const queue = shuffleArray(enabledTemplates);

  const animPreset = ANIMATION_PRESETS[p.animationPreset] || ANIMATION_PRESETS.none;
  const isAnimated = p.animationPreset !== 'none' && animPreset.resolve;
  const sV = { zoom: p.zoomLevel, offX: p.zoomOffsetX, offY: p.zoomOffsetY, intensity: p.animIntensity / 100 };

  const vO = p.vignetteOpacity / 100;
  const vHtml = vO <= 0 ? '' : `<div style="position:absolute;inset:0;pointer-events:none;z-index:10;background:radial-gradient(ellipse ${p.vignetteSize}% ${Math.round(p.vignetteSize * 0.9)}% at 50% 50%,transparent 0%,rgba(0,0,0,${(vO * 0.08).toFixed(2)}) ${100 - p.vignetteSpread}%,rgba(0,0,0,${(vO * 0.25).toFixed(2)}) ${100 - p.vignetteSpread * 0.7}%,rgba(0,0,0,${(vO * 0.5).toFixed(2)}) ${100 - p.vignetteSpread * 0.4}%,rgba(0,0,0,${vO.toFixed(2)}) 100%)"></div>`;

  const overrides = [];
  if (p.fontSizeScale !== 100) overrides.push(`font-size:${p.fontSizeScale}%!important`);
  if (p.lineH !== 1.72) overrides.push(`line-height:${p.lineH}!important`);
  const overrideStyle = overrides.length ? `<style>.so *{${overrides.join(';')}}</style>` : '';

  const accent = p.colorAccent;

  const page = await createPage(width, height);

  const baseHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${FONTS_LINK}
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#000}
.keyword-highlight{font-weight:800;padding:2px 6px;border-radius:2px;white-space:nowrap;display:inline;background:linear-gradient(120deg,${accent}ee,${accent});color:#000;box-shadow:0 0 20px ${accent}66,0 0 60px ${accent}26}</style>
</head><body><div id="slide" style="position:absolute;inset:0"></div>${vHtml}</body></html>`;

  await loadHtml(page, baseHtml);
  await waitForFonts(page);

  const frames = [];
  let prevSlideIdx = -1;

  for (let s = 0; s < totalSlides; s++) {
    const template = queue[s % queue.length];
    const helpers = makeHelpers(p.customHeadline, p.customLead);
    const html = template.render.call(helpers, p.keyword);
    const bgMatch = html.match(/background:\s*(#[0-9a-fA-F]{3,8})/);
    const bg = bgMatch ? bgMatch[1] : '#fff';

    const bodyHtml = `<div style="position:absolute;inset:0;background:${bg}">${overrideStyle}<div class="zoom-scroll" style="position:absolute;inset:0;overflow:hidden;"><div class="article-inner so" style="width:100%;height:100%;overflow:hidden;display:flex;flex-direction:column;">${html}</div></div></div>`;

    if (isAnimated) {
      const numSteps = Math.max(2, Math.ceil(framesPerSlide / 2));
      const stepDur = Math.max(1, Math.round(framesPerSlide / numSteps));
      for (let f = 0; f < numSteps; f++) {
        const localP = numSteps > 1 ? f / (numSteps - 1) : 0;
        const globalP = totalSlides > 1 ? (s + localP) / totalSlides : 0;
        const ep = easeInOut(globalP);
        const vals = animPreset.resolve(ep, sV);
        const dur = f === numSteps - 1 ? Math.max(1, framesPerSlide - stepDur * (numSteps - 1)) : stepDur;

        const js = buildZoomJs(vals.zoom, vals.offX, vals.offY);
        let data;
        if (s === prevSlideIdx) {
          data = await evalAndCapture(page, js);
        } else {
          await page.evaluate((bh) => { document.getElementById('slide').innerHTML = bh; }, bodyHtml);
          data = await evalAndCapture(page, js);
          prevSlideIdx = s;
        }
        frames.push({ data, duration: dur });
      }
    } else {
      const js = buildZoomJs(p.zoomLevel, p.zoomOffsetX, p.zoomOffsetY);
      if (s === prevSlideIdx) {
        const d = await evalAndCapture(page, js);
        frames.push({ data: d, duration: framesPerSlide });
      } else {
        await page.evaluate((bh) => { document.getElementById('slide').innerHTML = bh; }, bodyHtml);
        const d = await evalAndCapture(page, js);
        frames.push({ data: d, duration: framesPerSlide });
        prevSlideIdx = s;
      }
    }
  }

  await closePage(page);
  await encode(frames, outputPath, fps, width, height, format || 'mp4');

  const fs = require('fs');
  const stat = fs.statSync(outputPath);
  return {
    success: true,
    filePath: outputPath,
    fileSize: stat.size,
    duration: totalSlides * (p.speed / 1000),
    frames: frames.length,
  };
}

function buildZoomJs(zoom, offX, offY) {
  return `(function(){
    var inner = document.querySelector('.article-inner');
    if(!inner) return;
    inner.style.transform = '';
    inner.style.transformOrigin = '';
    var kw = document.querySelector('.keyword-highlight');
    var sc = document.querySelector('.zoom-scroll');
    if(kw && sc && inner){
      void inner.offsetWidth;
      var sR = sc.getBoundingClientRect();
      var kR = kw.getBoundingClientRect();
      var kCX = kR.left + kR.width/2 - sR.left;
      var kCY = kR.top + kR.height/2 - sR.top;
      var z = ${zoom};
      var dx = sR.width/2 - kCX + ${offX};
      var dy = sR.height/2 - kCY + ${offY};
      inner.style.transformOrigin = kCX+'px '+kCY+'px';
      inner.style.transform = 'translate('+dx+'px,'+dy+'px) scale('+z+')';
    }
  })();`;
}

module.exports = { generate };
