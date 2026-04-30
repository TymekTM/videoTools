const LOREM_HEADLINES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod',
  'Nulla facilisi morbi tempus iaculis urna id volutpat lacus',
  'Ut enim ad minim veniam quis nostrud exercitation ullamco laboris',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum',
  'Excepteur sint occaecat cupidatat non proident sunt in culpa qui',
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames',
  'Cras tincidunt lobortis feugiat vivamus at augue eget arcu dictum',
  'Viverra accumsan in nisl nisi scelerisque eu ultrices vitae auctor',
  'Amet consectetur adipiscing elit pellentesque habitant morbi tristique',
  'Faucibus purus in massa tempor nec feugiat nisl pretium fusce',
  'Quis varius quam quisque id diam vel quam elementum pulvinar',
  'Tortor posuere ac ut consequat semper viverra nam libero justo',
  'Amet venenatis urna cursus eget nunc scelerisque viverra mauris',
  'Turpis egestas pretium aenean pharetra magna ac placerat vestibulum',
  'Nisi vitae suscipit tellus mauris a diam maecenas sed enim'
];

const LOREM_PARAGRAPHS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
  'Nulla facilisi morbi tempus iaculis urna id volutpat lacus. Viverra accumsan in nisl nisi. Scelerisque eu ultrices vitae auctor eu augue ut lectus arcu bibendum. Egestas maecenas pharetra convallis posuere morbi leo urna molestie. At elementum eu facilisis sed odio morbi quis commodo.',
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui aenean eu leo quam pellentesque.',
  'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Sed posuere consectetur est at lobortis. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum id ligula porta felis euismod semper praesent commodo cursus magna.',
  'Cras mattis consectetur purus sit amet fermentum. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh ut fermentum massa justo sit amet risus.',
  'Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean lacinia bibendum nulla sed consectetur. Maecenas faucibus mollis interdum nullam quis risus eget urna mollis ornare vel.',
  'Etiam porta sem malesuada magna mollis euismod. Cras justo odio, dapibus ut facilisis in, egestas eget quam. Nullam quis risus eget urna mollis ornare vel eu leo. Aenean eu leo quam pellentesque ornare sem lacinia quam venenatis vestibulum.',
  'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante etiam sit amet orci eget eros faucibus tincidunt. Duis mollis est non commodo luctus.',
  'Fusce nec tellus sed augue semper porta. Mauris massa vestibulum lacinia risus at ultrices mi tempus imperdiet. Nulla porttitor accumsan tincidunt. Mauris blandit aliquet elit eget tincidunt. Curabitur arcu erat accumsan id imperdiet et porttitor at sem.',
  'Pellentesque diam volutpat commodo sed egestas egestas. Quisque id diam vel quam elementum pulvinar. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui et ipsum sagittis posuere.',
  'Vitae ultricies leo integer malesuada nunc vel risus. Viverra maecenas accumsan lacus vel facilisis volutpat. Morbi tincidunt ornare massa eget egestas. Sed egestas egestas fringilla phasellus faucibus scelerisque eleifend.',
  'Proin sagittis nisl rhoncus mattis rhoncus urna. Neque ornare aenean euismod. Suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam.',
  'Arcu cursus euismod quis viverra nibh cras pulvinar. Mattis enim ut tellus elementum sagittis vitae et leo. Diam vulputate ut pharetra sit amet aliquam id diam maecenas. Sed adipiscing diam donec adipiscing tristique risus nec feugiat.',
  'Tincidunt id aliquet risus feugiat in ante. Nunc sed blandit libero volutpat sed cras ornare. Egestas egestas fringilla phasellus faucibus scelerisque eleifend donec. Scelerisque in dictum non consectetur a erat nam.',
  'Amet consectetur adipiscing elit pellentesque habitant morbi. Tristique senectus et netus et malesuada fames. Nunc pulvinar elementum integer enim neque volutpat ac tincidunt vitae. Porttitor lacus luctus accumsan tortor posuere.'
];

const LOREM_AUTHORS = [
  'A. Kowalski', 'M. Nowak', 'J. Wiśniewski', 'K. Wójcik',
  'P. Kamiński', 'T. Lewandowski', 'B. Zieliński', 'R. Szymański',
  'Staff Reporter', 'Senior Editor', 'Special Correspondent'
];

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

const ANIMATION_PRESETS = {
  none: { name: 'Brak', easing: 'linear' },
  zoomIn: { name: 'Zoom In', easing: 'ease-in-out', resolve: (p, s) => {
    const i = s.intensity;
    const z0 = s.zoom - (s.zoom - 1) * i;
    return { zoom: lerp(z0, s.zoom, p), offX: lerp(s.offX * (1 - i), s.offX, p), offY: lerp(s.offY * (1 - i), s.offY, p) };
  }},
  zoomOut: { name: 'Zoom Out', easing: 'ease-in-out', resolve: (p, s) => {
    const i = s.intensity;
    const z1 = s.zoom - (s.zoom - 1) * i;
    return { zoom: lerp(s.zoom, z1, p), offX: lerp(s.offX, s.offX * (1 - i), p), offY: lerp(s.offY, s.offY * (1 - i), p) };
  }},
  panLeft: { name: 'Pan ◀', easing: 'ease-in-out', resolve: (p, s) => ({
    zoom: s.zoom, offX: lerp(200 * s.intensity, -200 * s.intensity, p) + s.offX, offY: s.offY
  })},
  panRight: { name: 'Pan ▶', easing: 'ease-in-out', resolve: (p, s) => ({
    zoom: s.zoom, offX: lerp(-200 * s.intensity, 200 * s.intensity, p) + s.offX, offY: s.offY
  })},
  panUp: { name: 'Pan ▲', easing: 'ease-in-out', resolve: (p, s) => ({
    zoom: s.zoom, offX: s.offX, offY: lerp(150 * s.intensity, -150 * s.intensity, p) + s.offY
  })},
  panDown: { name: 'Pan ▼', easing: 'ease-in-out', resolve: (p, s) => ({
    zoom: s.zoom, offX: s.offX, offY: lerp(-150 * s.intensity, 150 * s.intensity, p) + s.offY
  })},
  kenBurns: { name: 'Ken Burns', easing: 'ease-in-out', resolve: (p, s) => {
    const i = s.intensity;
    return {
      zoom: lerp(s.zoom * (1 - 0.15 * i), s.zoom * (1 + 0.15 * i), p),
      offX: lerp(-120 * i, 120 * i, p) + s.offX,
      offY: lerp(-60 * i, 60 * i, p) + s.offY
    };
  }},
  drift: { name: 'Drift', easing: 'ease-in-out', resolve: (p, s) => {
    const i = s.intensity;
    return {
      zoom: lerp(s.zoom * (1 - 0.05 * i), s.zoom * (1 + 0.05 * i), p),
      offX: lerp(-80 * i, 80 * i, p) + s.offX,
      offY: s.offY
    };
  }},
  breathe: { name: 'Breathe', easing: 'linear', resolve: (p, s) => {
    const t = Math.sin(p * Math.PI);
    return { zoom: s.zoom * (1 + 0.2 * s.intensity * t), offX: s.offX, offY: s.offY };
  }},
  swing: { name: 'Swing', easing: 'ease-in-out', resolve: (p, s) => {
    const i = s.intensity;
    return {
      zoom: lerp(s.zoom * (1 - 0.1 * i), s.zoom * (1 + 0.1 * i), p),
      offX: lerp(-150 * i, 150 * i, p) + s.offX,
      offY: lerp(40 * i, -40 * i, p) + s.offY
    };
  }}
};


function insertKeyword(text, keyword) {
  const words = text.split(/\s+/);
  const minIdx = Math.max(2, Math.floor(words.length * 0.15));
  const maxIdx = Math.min(words.length - 3, Math.floor(words.length * 0.85));
  const idx = minIdx + Math.floor(Math.random() * (maxIdx - minIdx));
  words[idx] = `<span class="keyword-highlight">${keyword}</span>`;
  return words.join(' ');
}

const state = {
  keyword: 'SZTUKA',
  speed: 800,
  format: '16:9',
  resolution: '1080p',
  playing: false,
  currentIndex: 0,
  enabledTemplates: new Set(TEMPLATES.map(t => t.id)),
  timer: null,
  queue: [],
  helpers: getTemplateHelpers(),
  customHeadline: '',
  customLead: '',
  zoomLevel: 2.0,
  zoomOffsetX: 0,
  zoomOffsetY: 0,
  fontSizeScale: 100,
  lineH: 1.72,
  colorAccent: '#facc15',
  vignetteOpacity: 70,
  vignetteSize: 60,
  vignetteSpread: 70,
  transitionMs: 120,
  animationPreset: 'none',
  animIntensity: 100
};

function getResolution() {
  return RESOLUTIONS[state.format][state.resolution];
}

function updateVignette() {
  const o = state.vignetteOpacity / 100;
  const v = $('#vignette');
  if (o <= 0) { v.style.background = 'none'; return; }
  const size = state.vignetteSize;
  const spread = state.vignetteSpread;
  v.style.background = `radial-gradient(
    ellipse ${size}% ${Math.round(size * 0.9)}% at 50% 50%,
    transparent 0%,
    rgba(0,0,0,${(o * 0.08).toFixed(2)}) ${100 - spread}%,
    rgba(0,0,0,${(o * 0.25).toFixed(2)}) ${100 - spread * 0.7}%,
    rgba(0,0,0,${(o * 0.5).toFixed(2)}) ${100 - spread * 0.4}%,
    rgba(0,0,0,${o.toFixed(2)}) 100%
  )`;
}

function applyAccent() {
  let el = $('#accentStyle');
  if (!el) { el = document.createElement('style'); el.id = 'accentStyle'; document.head.appendChild(el); }
  const c = state.colorAccent;
  el.textContent = `.keyword-highlight{background:linear-gradient(120deg,${c}ee,${c})!important;box-shadow:0 0 20px ${c}66,0 0 60px ${c}26!important;animation:keywordPulse .8s ease-in-out infinite}.playing .keyword-highlight{animation:keywordPulse .5s ease-in-out infinite}`;
  const preview = $('#accentPreview');
  if (preview) {
    preview.style.background = `linear-gradient(120deg, ${c}ee, ${c})`;
    preview.style.boxShadow = `0 0 12px ${c}66`;
    preview.textContent = state.keyword;
  }
}

function buildQueue() {
  const enabled = TEMPLATES.filter(t => state.enabledTemplates.has(t.id));
  state.queue = shuffleArray([...enabled]);
  state.currentIndex = 0;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function updatePreviewSize() {
  const [w, h] = getResolution();
  const area = $('[data-tool="newspaper"] .preview-area');
  if (!area) return;
  const areaW = area.clientWidth - 60;
  const areaH = area.clientHeight - 60;
  const scale = Math.min(areaW / w, areaH / h, 1);
  const displayW = Math.round(w * scale);
  const displayH = Math.round(h * scale);

  const wrapper = $('#previewWrapper');
  wrapper.style.width = displayW + 'px';
  wrapper.style.height = displayH + 'px';
  wrapper.dataset.baseWidth = w;
  wrapper.dataset.baseHeight = h;

  const canvas = $('#previewCanvas');
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.style.transform = `scale(${scale})`;
  canvas.style.transformOrigin = '0 0';
  canvas.style.fontSize = '16px';

  $('#resolutionInfo').textContent = `${w} \u00d7 ${h}`;
}

function renderSlide(template) {
  state.helpers = getTemplateHelpers();
  const html = template.render.call(state.helpers, state.keyword);
  return html;
}

function showSlide(template, direction = 'next') {
  const canvas = $('#previewCanvas');
  const existing = canvas.querySelector('.article-slide.active');
  const slide = document.createElement('div');
  slide.className = 'article-slide';
  slide.style.transition = `opacity ${state.transitionMs}ms ease`;

  const helpers = getTemplateHelpers();
  const html = template.render.call(helpers, state.keyword);

  const bgMatch = html.match(/background:\s*(#[0-9a-fA-F]{3,8})/);
  if (bgMatch) slide.style.background = bgMatch[1];

  const overrides = [];
  if (state.fontSizeScale !== 100) overrides.push(`font-size:${state.fontSizeScale}%!important`);
  if (state.lineH !== 1.72) overrides.push(`line-height:${state.lineH}!important`);
  const overrideStyle = overrides.length ? `<style>.so *{${overrides.join(';')}}</style>` : '';

  slide.innerHTML = `
    ${overrideStyle}
    <div class="zoom-scroll" style="position:absolute;inset:0;overflow:hidden;">
      <div class="article-inner so" style="
        width:100%;
        height:100%;
        overflow:hidden;
        display:flex;
        flex-direction:column;
      ">${html}</div>
    </div>`;

  canvas.appendChild(slide);

  requestAnimationFrame(() => {
    const kwEl = slide.querySelector('.keyword-highlight');
    const scroller = slide.querySelector('.zoom-scroll');
    const inner = slide.querySelector('.article-inner');
    if (kwEl && scroller && inner) {
      var cScale = 1;
      var ct = canvas.style.transform;
      var cm = ct && ct.match(/scale\(([\d.]+)\)/);
      if (cm) cScale = parseFloat(cm[1]);
      var cw = parseInt(canvas.style.width) || canvas.offsetWidth;
      var ch = parseInt(canvas.style.height) || canvas.offsetHeight;
      var sR = scroller.getBoundingClientRect();
      var kR = kwEl.getBoundingClientRect();
      var kCX = (kR.left + kR.width / 2 - sR.left) / cScale;
      var kCY = (kR.top + kR.height / 2 - sR.top) / cScale;
      inner.style.transformOrigin = kCX + 'px ' + kCY + 'px';
      var z = state.zoomLevel;
      var dx = cw / 2 - kCX + state.zoomOffsetX;
      var dy = ch / 2 - kCY + state.zoomOffsetY;
      if (state.animationPreset !== 'none') {
        const preset = ANIMATION_PRESETS[state.animationPreset];
        const total = state.queue.length || 1;
        const pos = state.currentIndex % total;
        const progress = total > 1 ? pos / (total - 1) : 0.5;
        const vals = preset.resolve(progress, { zoom: z, offX: state.zoomOffsetX, offY: state.zoomOffsetY, intensity: state.animIntensity / 100 });
        dx = cw / 2 - kCX + vals.offX;
        dy = ch / 2 - kCY + vals.offY;
        z = vals.zoom;
      }
      inner.style.transform = `translate(${dx}px, ${dy}px) scale(${z})`;
    }
    slide.classList.add('active');
    if (existing) {
      existing.classList.remove('active');
      setTimeout(() => existing.remove(), state.transitionMs + 30);
    }
  });

  updateCounter();
}

function updateCounter() {
  const counter = $('#slideCounter');
  const total = state.queue.length;
  const current = total > 0 ? state.currentIndex + 1 : 0;
  counter.textContent = `${current} / ${total}`;
  counter.classList.toggle('playing', state.playing);
}

function nextSlide() {
  if (state.queue.length === 0) return;
  const template = state.queue[state.currentIndex];
  showSlide(template);
  state.currentIndex++;
  if (state.currentIndex >= state.queue.length) {
    buildQueue();
  }
}

function play() {
  if (state.playing) return;
  if (state.queue.length === 0) buildQueue();
  state.playing = true;
  $('#previewCanvas').classList.add('playing');
  nextSlide();
  state.timer = setInterval(nextSlide, state.speed);
  updatePlayButton();
}

function stop() {
  state.playing = false;
  clearInterval(state.timer);
  state.timer = null;
  state.currentIndex = 0;
  $('#previewCanvas').classList.remove('playing');
  const canvas = $('#previewCanvas');
  canvas.innerHTML = '';
  updateCounter();
  updatePlayButton();
}

function shuffle() {
  stop();
  buildQueue();
  nextSlide();
}

function updatePlayButton() {
  const btn = $('#btnPlay');
  if (state.playing) {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor"/></svg><span>Pause</span>`;
  } else {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14"><polygon points="2,0 14,7 2,14" fill="currentColor"/></svg><span>Play</span>`;
  }
}

function buildTemplateToggles() {
  const container = $('#templateToggles');
  const grouped = {};
  for (const t of TEMPLATES) {
    const cat = t.category || 'classic';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  }

  const catOrder = Object.keys(CATEGORIES);
  container.innerHTML = catOrder
    .filter(c => grouped[c])
    .map(catKey => {
      const cat = CATEGORIES[catKey];
      const templates = grouped[catKey];
      const checkedCount = templates.filter(t => state.enabledTemplates.has(t.id)).length;
      const allOn = checkedCount === templates.length;
      const items = templates.map(t => `
        <label class="template-toggle" data-cat="${catKey}">
          <input type="checkbox" value="${t.id}" ${state.enabledTemplates.has(t.id) ? 'checked' : ''}>
          <span class="template-toggle-label">
            <span class="template-toggle-flag">${t.flag}</span>
            ${t.name}
          </span>
        </label>
      `).join('');

      return `
        <div class="template-category collapsed" data-category="${catKey}">
          <div class="template-category-header">
            <span class="template-category-arrow">\u25BC</span>
            <span class="template-category-icon">${cat.icon}</span>
            <span class="template-category-title">${cat.label}</span>
            <input type="checkbox" class="template-category-toggle" data-cat-toggle="${catKey}" ${allOn ? 'checked' : ''}>
            <span class="template-category-count">${checkedCount}/${templates.length}</span>
          </div>
          <div class="template-category-items">${items}</div>
        </div>
      `;
    }).join('');

  container.querySelectorAll('.template-category-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('.template-category-toggle')) return;
      header.parentElement.classList.toggle('collapsed');
    });
  });

  container.querySelectorAll('.template-category-toggle').forEach(cb => {
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      const catKey = cb.dataset.catToggle;
      const category = container.querySelector(`.template-category[data-category="${catKey}"]`);
      const checkboxes = category.querySelectorAll('.template-category-items input[type="checkbox"]');
      checkboxes.forEach(c => {
        c.checked = cb.checked;
        if (c.checked) state.enabledTemplates.add(c.value);
        else state.enabledTemplates.delete(c.value);
      });
      refreshCategoryCounts();
      if (state.playing) { stop(); buildQueue(); }
    });
  });

  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) state.enabledTemplates.add(cb.value);
      else state.enabledTemplates.delete(cb.value);
      refreshCategoryCounts();
      if (state.playing) { stop(); buildQueue(); }
    });
  });
}

function refreshCategoryCounts() {
  const container = $('#templateToggles');
  container.querySelectorAll('.template-category').forEach(cat => {
    const checkboxes = cat.querySelectorAll('.template-category-items input[type="checkbox"]');
    const checkedCount = [...checkboxes].filter(cb => cb.checked).length;
    const allOn = checkedCount === checkboxes.length;
    cat.querySelector('.template-category-count').textContent = `${checkedCount}/${checkboxes.length}`;
    cat.querySelector('.template-category-toggle').checked = allOn;
  });
}

function initNewspaper() {
  buildTemplateToggles();
  buildQueue();
  updatePreviewSize();
  updateVignette();
  applyAccent();
  showSlide(state.queue[state.currentIndex]);
  state.currentIndex++;

  const [nw, nh] = getResolution();
  $('#globalResInfo').textContent = `${nw}x${nh}`;

  $('#keywordInput').addEventListener('input', (e) => {
    state.keyword = e.target.value || 'KEYWORD';
    applyAccent();
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#speedRange').addEventListener('input', (e) => {
    state.speed = parseInt(e.target.value);
    $('#speedValue').textContent = (state.speed / 1000).toFixed(1) + 's';
    if (state.playing) {
      clearInterval(state.timer);
      state.timer = setInterval(nextSlide, state.speed);
    }
  });

  $$('#formatGroup .control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#formatGroup .control-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.format = btn.dataset.format;
      updatePreviewSize();
    });
  });

  $('#resolutionSelect').addEventListener('change', (e) => {
    state.resolution = e.target.value;
    updatePreviewSize();
    const [w, h] = getResolution();
    $('#globalResInfo').textContent = `${w}x${h}`;
  });

  $('#btnPlay').addEventListener('click', () => {
    if (state.playing) stop();
    else play();
  });

  $('#btnStop').addEventListener('click', stop);
  $('#btnShuffle').addEventListener('click', shuffle);

  const setNewsExporting = (active, label) => {
    const prog = $('#newsExportProgress');
    if (!prog) return;
    prog.style.display = active ? 'block' : 'none';
    if (active) $('#newsExportLabel').textContent = label || '';
    $('#newsExportBarFill').style.width = active ? '0%' : '';
  };

  const vignetteOpacity = () => state.vignetteOpacity / 100;
  const getVignetteHtml = () => {
    const o = vignetteOpacity();
    if (o <= 0) return '';
    const vs = state.vignetteSize, sp = state.vignetteSpread;
    return `<div style="position:absolute;inset:0;pointer-events:none;z-index:10;background:radial-gradient(ellipse ${vs}% ${Math.round(vs*0.9)}% at 50% 50%,transparent 0%,rgba(0,0,0,${(o*0.08).toFixed(2)}) ${100-sp}%,rgba(0,0,0,${(o*0.25).toFixed(2)}) ${100-sp*0.7}%,rgba(0,0,0,${(o*0.5).toFixed(2)}) ${100-sp*0.4}%,rgba(0,0,0,${o.toFixed(2)}) 100%)"></div>`;
  };

  const buildSlidesData = (totalSlides, framesPerSlide, overrideStyle) => {
    buildQueue();
    const data = [];
    const animPreset = ANIMATION_PRESETS[state.animationPreset];
    const isAnimated = state.animationPreset !== 'none' && animPreset.resolve;
    const sV = { zoom: state.zoomLevel, offX: state.zoomOffsetX, offY: state.zoomOffsetY, intensity: state.animIntensity / 100 };
    const vHtml = getVignetteHtml();

    for (let s = 0; s < totalSlides; s++) {
      const template = state.queue[s % state.queue.length];
      const helpers = getTemplateHelpers();
      const html = template.render.call(helpers, state.keyword);
      const bgMatch = html.match(/background:\s*(#[0-9a-fA-F]{3,8})/);
      const bg = bgMatch ? bgMatch[1] : '#fff';

      const bodyHtml = `<div style="position:absolute;inset:0;background:${bg}">${overrideStyle}<div class="zoom-scroll" style="position:absolute;inset:0;overflow:hidden;"><div class="article-inner so" style="width:100%;height:100%;overflow:hidden;display:flex;flex-direction:column;">${html}</div></div></div>${vHtml}`;

      if (isAnimated) {
        const numSteps = Math.max(2, Math.ceil(framesPerSlide / 2));
        const stepDur = Math.max(1, Math.round(framesPerSlide / numSteps));
        for (let f = 0; f < numSteps; f++) {
          const localP = numSteps > 1 ? f / (numSteps - 1) : 0;
          const globalP = totalSlides > 1 ? (s + localP) / totalSlides : 0;
          const p = animPreset.easing === 'linear' ? globalP : easeInOut(globalP);
          const vals = animPreset.resolve(p, sV);
          const dur = f === numSteps - 1 ? Math.max(1, framesPerSlide - stepDur * (numSteps - 1)) : stepDur;
          data.push({ bodyHtml, zoom: vals.zoom, offX: vals.offX, offY: vals.offY, duration: dur, slideIdx: s });
        }
      } else {
        data.push({ bodyHtml, zoom: state.zoomLevel, offX: state.zoomOffsetX, offY: state.zoomOffsetY, duration: framesPerSlide, slideIdx: s });
      }
    }
    return data;
  };

  async function renderNewsToMp4(slidesData, width, height, fps, savePath, formatLabel) {
    const { ipcRenderer } = require('electron');

    setNewsExporting(true, `${formatLabel} — Inicjalizacja...`);
    await ipcRenderer.invoke('bg-init', {
      width, height,
      css: `.keyword-highlight{font-weight:800;padding:2px 6px;border-radius:2px;white-space:nowrap;display:inline}`
    });

    await ipcRenderer.invoke('bg-eval', `
      var el = document.createElement('style'); el.id = 'dynAccent'; document.head.appendChild(el);
      el.textContent = '.keyword-highlight{background:linear-gradient(120deg,${state.colorAccent}ee,${state.colorAccent});color:#000;box-shadow:0 0 20px ${state.colorAccent}66,0 0 60px ${state.colorAccent}26}';
    `);

    setNewsExporting(true, `${formatLabel} — Renderowanie...`);
    const frames = [];
    let prevSlideIdx = -1;

    for (let i = 0; i < slidesData.length; i++) {
      const d = slidesData[i];
      const js = `
        (function() {
          var inner = document.querySelector('.article-inner');
          if (inner) { inner.style.transform = ''; inner.style.transformOrigin = ''; }
          var kw = document.querySelector('.keyword-highlight');
          var sc = document.querySelector('.zoom-scroll');
          if (kw && sc && inner) {
            void inner.offsetWidth;
            var sR = sc.getBoundingClientRect();
            var kR = kw.getBoundingClientRect();
            var kCX = kR.left + kR.width / 2 - sR.left;
            var kCY = kR.top + kR.height / 2 - sR.top;
            var z = ${d.zoom};
            var dx = sR.width / 2 - kCX + ${d.offX};
            var dy = sR.height / 2 - kCY + ${d.offY};
            inner.style.transformOrigin = kCX + 'px ' + kCY + 'px';
            inner.style.transform = 'translate('+dx+'px,'+dy+'px) scale('+z+')';
          }
        })();
      `;
      let data;
      if (d.slideIdx === prevSlideIdx) {
        data = await ipcRenderer.invoke('bg-apply-capture', { js });
      } else {
        data = await ipcRenderer.invoke('bg-render-js', { html: d.bodyHtml, js });
        prevSlideIdx = d.slideIdx;
      }
      frames.push({ data, duration: d.duration });

      const pct = Math.round((i + 1) / slidesData.length * 100);
      $('#newsExportBarFill').style.width = pct + '%';
      $('#newsExportLabel').textContent = `${formatLabel} — ${pct}%`;
    }

    setNewsExporting(true, `${formatLabel} — Koduję MP4...`);
    $('#newsExportBarFill').style.width = '100%';

    await ipcRenderer.invoke('export-mp4', { frames, savePath, fps, width, height });
    await ipcRenderer.invoke('bg-cleanup');
  }

  $('#btnExportMp4').addEventListener('click', async () => {
    const { ipcRenderer } = require('electron');
    const savePath = await ipcRenderer.invoke('save-dialog', {
      defaultName: `news-${Date.now()}.mp4`,
      filters: [{ name: 'MP4', extensions: ['mp4'] }]
    });
    if (!savePath) return;

    const wasPlaying = state.playing;
    if (wasPlaying) stop();

    const fps = 30;
    const framesPerSlide = Math.max(1, Math.round((state.speed / 1000) * fps));
    const totalSlides = Math.ceil((parseInt($('#exportDuration').value) || 30) * fps / framesPerSlide);

    const overrides = [];
    if (state.fontSizeScale !== 100) overrides.push(`font-size:${state.fontSizeScale}%!important`);
    if (state.lineH !== 1.72) overrides.push(`line-height:${state.lineH}!important`);
    const overrideStyle = overrides.length ? `<style>.so *{${overrides.join(';')}}</style>` : '';

    const slidesData = buildSlidesData(totalSlides, framesPerSlide, overrideStyle);
    const [w, h] = getResolution();
    await renderNewsToMp4(slidesData, w, h, fps, savePath, state.format);
    setNewsExporting(false);
  });

  $('#btnBatchExport').addEventListener('click', async () => {
    const { ipcRenderer } = require('electron');
    const nodePath = require('path');
    const savePath = await ipcRenderer.invoke('save-dialog', {
      defaultName: `news-batch-${Date.now()}.mp4`,
      filters: [{ name: 'MP4', extensions: ['mp4'] }]
    });
    if (!savePath) return;

    const wasPlaying = state.playing;
    if (wasPlaying) stop();

    const fps = 30;
    const framesPerSlide = Math.max(1, Math.round((state.speed / 1000) * fps));
    const totalSlides = Math.ceil((parseInt($('#exportDuration').value) || 30) * fps / framesPerSlide);

    const overrides = [];
    if (state.fontSizeScale !== 100) overrides.push(`font-size:${state.fontSizeScale}%!important`);
    if (state.lineH !== 1.72) overrides.push(`line-height:${state.lineH}!important`);
    const overrideStyle = overrides.length ? `<style>.so *{${overrides.join(';')}}</style>` : '';

    const slidesData = buildSlidesData(totalSlides, framesPerSlide, overrideStyle);
    const formats = ['16:9', '9:16', '1:1'];
    const ext = nodePath.extname(savePath);
    const base = savePath.slice(0, -ext.length);

    for (const fmt of formats) {
      const [fw, fh] = RESOLUTIONS[fmt][state.resolution];
      const p = `${base}-${fmt.replace(':', 'x')}${ext}`;
      await renderNewsToMp4(slidesData, fw, fh, fps, p, fmt);
    }
    setNewsExporting(false);
  });

  $('#customToggle').addEventListener('click', () => {
    document.querySelector('[data-tool="newspaper"] .custom-section').classList.toggle('collapsed');
  });

  $('#customHeadline').addEventListener('input', (e) => {
    state.customHeadline = e.target.value;
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#customLead').addEventListener('input', (e) => {
    state.customLead = e.target.value;
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#zoomRange').addEventListener('input', (e) => {
    state.zoomLevel = parseFloat(e.target.value);
    $('#zoomVal').textContent = state.zoomLevel.toFixed(1) + 'x';
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#offXRange').addEventListener('input', (e) => {
    state.zoomOffsetX = parseInt(e.target.value);
    $('#offXVal').textContent = state.zoomOffsetX;
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#offYRange').addEventListener('input', (e) => {
    state.zoomOffsetY = parseInt(e.target.value);
    $('#offYVal').textContent = state.zoomOffsetY;
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#fontScaleRange').addEventListener('input', (e) => {
    state.fontSizeScale = parseInt(e.target.value);
    $('#fontScaleVal').textContent = state.fontSizeScale + '%';
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#lineHRange').addEventListener('input', (e) => {
    state.lineH = parseFloat(e.target.value);
    $('#lineHVal').textContent = state.lineH.toFixed(2);
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#colorAccent').addEventListener('input', (e) => {
    state.colorAccent = e.target.value;
    applyAccent();
  });

  $('#vignetteRange').addEventListener('input', (e) => {
    state.vignetteOpacity = parseInt(e.target.value);
    $('#vignetteVal').textContent = state.vignetteOpacity + '%';
    updateVignette();
  });

  $('#vignetteSizeRange').addEventListener('input', (e) => {
    state.vignetteSize = parseInt(e.target.value);
    $('#vignetteSizeVal').textContent = state.vignetteSize + '%';
    updateVignette();
  });

  $('#vignetteSpreadRange').addEventListener('input', (e) => {
    state.vignetteSpread = parseInt(e.target.value);
    $('#vignetteSpreadVal').textContent = state.vignetteSpread + '%';
    updateVignette();
  });

  $('#transitionRange').addEventListener('input', (e) => {
    state.transitionMs = parseInt(e.target.value);
    $('#transitionVal').textContent = state.transitionMs + 'ms';
  });

  $('#animPresetSelect').addEventListener('change', (e) => {
    state.animationPreset = e.target.value;
    $('#animPresetVal').textContent = ANIMATION_PRESETS[e.target.value].name;
    $('#animIntensityGroup').style.display = e.target.value === 'none' ? 'none' : '';
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#animIntensityRange').addEventListener('input', (e) => {
    state.animIntensity = parseInt(e.target.value);
    $('#animIntensityVal').textContent = state.animIntensity + '%';
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  document.querySelectorAll('.control-range[data-default]').forEach(slider => {
    slider.addEventListener('dblclick', () => {
      const def = slider.dataset.default;
      slider.value = def;
      slider.dispatchEvent(new Event('input'));
    });
  });

  const ro = new ResizeObserver(() => {
    if (activeTool === 'newspaper') updatePreviewSize();
    else if (activeTool === 'chat') chatUpdatePreviewSize();
    else if (activeTool === 'typing') typingUpdatePreviewSize();
    else if (activeTool === 'notification') { if (window.notificationUpdatePreviewSize) window.notificationUpdatePreviewSize(); }
  });
  ro.observe($('[data-tool="newspaper"] .preview-area'));

  window.addEventListener('resize', () => {
    if (activeTool === 'newspaper') updatePreviewSize();
    else if (activeTool === 'chat') chatUpdatePreviewSize();
    else if (activeTool === 'typing') typingUpdatePreviewSize();
    else if (activeTool === 'notification') { if (window.notificationUpdatePreviewSize) window.notificationUpdatePreviewSize(); }
  });
}
