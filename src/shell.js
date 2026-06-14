/* ═══════════════════════════════════════
   SHELL — hub, command palette, categorized nav
   ═══════════════════════════════════════ */

(function () {
  const CATEGORIES = [
    { id: 'text',    pl: 'Tekst i Typ',     en: 'Text & Type' },
    { id: 'social',  pl: 'Social i Chat',   en: 'Social & Chat' },
    { id: 'data',    pl: 'Dane i Geo',      en: 'Data & Geo' },
    { id: 'capture', pl: 'Capture i Klucz', en: 'Capture & Key' },
  ];

  const TOOLS = [
    { id: 'newspaper', cat: 'text',
      pl: { n: 'Artykuł', d: 'Wydruk gazety z podświetleniem słów kluczowych i ruchem Ken Burns.' },
      en: { n: 'Newspaper', d: 'Article pages with keyword highlight and Ken Burns motion.' } },
    { id: 'typing', cat: 'text',
      pl: { n: 'Pisanie', d: 'Realistyczne pisanie w edytorze, terminalu, mailu lub SMS.' },
      en: { n: 'Typing', d: 'Realistic typing in an editor, terminal, email or SMS.' } },
    { id: 'subtitles', cat: 'text',
      pl: { n: 'Napisy', d: 'Transkrypcja Whisper i stylowane napisy do wideo.' },
      en: { n: 'Subtitles', d: 'Whisper transcription and styled video subtitles.' } },
    { id: 'chat', cat: 'social',
      pl: { n: 'Czat', d: 'iMessage, WhatsApp, Discord, Slack, Messenger i własny motyw.' },
      en: { n: 'Chat', d: 'iMessage, WhatsApp, Discord, Slack, Messenger and custom theme.' } },
    { id: 'notification', cat: 'social',
      pl: { n: 'Powiadomienia', d: 'Stosy push iOS/Android z animacją wsuwania.' },
      en: { n: 'Notifications', d: 'iOS/Android push stacks with slide-in animation.' } },
    { id: 'character', cat: 'social',
      pl: { n: 'Postać', d: 'Intro postaci z awatarem, imieniem i rolą.' },
      en: { n: 'Character', d: 'Character intro with avatar, name and role.' } },
    { id: 'chart', cat: 'data',
      pl: { n: 'Wykresy', d: 'Bar, line, pie, gauge, counter z animacją i paletami.' },
      en: { n: 'Charts', d: 'Bar, line, pie, gauge, counter with animation and palettes.' } },
    { id: 'map', cat: 'data',
      pl: { n: 'Mapa', d: 'Animowane trasy z Leaflet i trybami kamery.' },
      en: { n: 'Map', d: 'Animated routes with Leaflet and camera modes.' } },
    { id: 'calendar', cat: 'data',
      pl: { n: 'Kalendarz', d: 'Animowany kalendarz Flip z focusem dnia.' },
      en: { n: 'Calendar', d: 'Animated Flip calendar with day focus.' } },
    { id: 'webcap', cat: 'capture',
      pl: { n: 'Webcap', d: 'Capture stron: pełna strona, PNG, scroll MP4.' },
      en: { n: 'Webcap', d: 'Website capture: full page, PNG, scroll MP4.' } },
    { id: 'corridorkey', cat: 'capture',
      pl: { n: 'CorridorKey', d: 'Kluczowanie green-screen z modelami AI.' },
      en: { n: 'CorridorKey', d: 'AI green-screen keying with model inference.' } },
  ];

  const RECENTS_KEY = 'vt.recents';
  const lang = () => (typeof currentLang === 'function' ? currentLang() : 'pl');
  let L = lang();
  const tr = (tool) => tool[L] || tool.en;
  const catLabel = (c) => { const o = CATEGORIES.find(x => x.id === c); return o ? o[L] : c; };
  const meta = (id) => TOOLS.find(x => x.id === id);

  const icons = {};

  /* ─── Categorized nav (transform existing buttons) ─── */
  function buildNav() {
    const nav = document.querySelector('.tool-nav');
    if (!nav) return;
    const source = nav.querySelector('.tool-nav-items');
    if (!source) return;
    const btns = Array.from(source.querySelectorAll('.tool-nav-btn[data-tool]'));
    btns.forEach(b => { icons[b.dataset.tool] = b.innerHTML.trim(); });

    const bottom = nav.querySelector('.nav-bottom');
    btns.forEach(b => b.remove());
    source.remove();

    CATEGORIES.forEach(cat => {
      const section = document.createElement('div');
      section.className = 'nav-section';
      section.dataset.cat = cat.id;

      const head = document.createElement('button');
      head.className = 'nav-section-head';
      head.type = 'button';
      head.innerHTML = '<span class="nav-section-label"></span>' +
        '<svg class="nav-section-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
      head.querySelector('.nav-section-label').textContent = cat[L];

      const items = document.createElement('div');
      items.className = 'nav-section-items';
      TOOLS.filter(tl => tl.cat === cat.id).forEach(tl => {
        const b = document.createElement('button');
        b.className = 'tool-nav-btn';
        b.type = 'button';
        b.dataset.tool = tl.id;
        b.title = tr(tl).n;
        b.innerHTML = (icons[tl.id] || '') + '<span class="nav-label"></span>';
        b.querySelector('.nav-label').textContent = tr(tl).n;
        b.addEventListener('click', () => switchTool(tl.id));
        items.appendChild(b);
      });

      head.addEventListener('click', () => section.classList.toggle('collapsed'));
      section.appendChild(head);
      section.appendChild(items);
      nav.insertBefore(section, bottom);
    });
  }

  function relabelNav() {
    document.querySelectorAll('.nav-section').forEach(section => {
      const cat = CATEGORIES.find(c => c.id === section.dataset.cat);
      const label = section.querySelector('.nav-section-label');
      if (cat && label) label.textContent = cat[L];
    });
    document.querySelectorAll('.tool-nav-btn[data-tool]').forEach(b => {
      const m = meta(b.dataset.tool);
      if (m) {
        const lab = b.querySelector('.nav-label');
        if (lab) lab.textContent = tr(m).n;
        b.title = tr(m).n;
      }
    });
  }

  /* ─── Hub ─── */
  function renderHub() {
    const wrap = document.getElementById('hubCategories');
    if (!wrap) return;
    wrap.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const list = TOOLS.filter(tl => tl.cat === cat.id);
      const section = document.createElement('div');
      section.className = 'hub-cat';
      section.dataset.cat = cat.id;

      const head = document.createElement('div');
      head.className = 'hub-cat-head';
      head.innerHTML = '<span class="hub-cat-title"></span><span class="hub-cat-count"></span>';
      head.querySelector('.hub-cat-title').textContent = cat[L];
      head.querySelector('.hub-cat-count').textContent = String(list.length).padStart(2, '0');

      const grid = document.createElement('div');
      grid.className = 'hub-grid';
      list.forEach(tl => grid.appendChild(hubCard(tl)));

      section.appendChild(head);
      section.appendChild(grid);
      wrap.appendChild(section);
    });
  }

  function hubCard(tl) {
    const m = tr(tl);
    const card = document.createElement('button');
    card.className = 'hub-card';
    card.type = 'button';
    card.dataset.tool = tl.id;
    card.innerHTML =
      '<span class="hub-card-icon">' + (icons[tl.id] || '') + '</span>' +
      '<span class="hub-card-name"></span>' +
      '<span class="hub-card-desc"></span>';
    card.querySelector('.hub-card-name').textContent = m.n;
    card.querySelector('.hub-card-desc').textContent = m.d;
    card.addEventListener('click', () => switchTool(tl.id));
    return card;
  }

  function relabelHub() {
    document.querySelectorAll('.hub-cat').forEach(section => {
      const cat = CATEGORIES.find(c => c.id === section.dataset.cat);
      const title = section.querySelector('.hub-cat-title');
      if (cat && title) title.textContent = cat[L];
    });
    document.querySelectorAll('.hub-card[data-tool]').forEach(card => {
      const m = meta(card.dataset.tool);
      if (!m) return;
      const t2 = tr(m);
      const n = card.querySelector('.hub-card-name');
      const d = card.querySelector('.hub-card-desc');
      if (n) n.textContent = t2.n;
      if (d) d.textContent = t2.d;
    });
  }

  function filterHub(query) {
    const q = query.trim().toLowerCase();
    const cats = document.querySelectorAll('.hub-cat');
    let visible = 0;
    cats.forEach(cat => {
      let catVisible = 0;
      cat.querySelectorAll('.hub-card').forEach(card => {
        const m = meta(card.dataset.tool);
        if (!m) return;
        const hay = (m.pl.n + ' ' + m.pl.d + ' ' + m.en.n + ' ' + m.en.d + ' ' + catLabel(m.cat)).toLowerCase();
        const match = !q || hay.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) catVisible++;
      });
      cat.style.display = catVisible ? '' : 'none';
      visible += catVisible;
    });
    let empty = document.getElementById('hubEmpty');
    if (!visible) {
      if (!empty) {
        empty = document.createElement('div');
        empty.id = 'hubEmpty';
        empty.className = 'hub-empty';
        const wrap = document.getElementById('hubCategories');
        if (wrap) wrap.appendChild(empty);
      }
      empty.textContent = L === 'pl' ? 'Brak narzędzi pasujących do zapytania.' : 'No tools match your query.';
    } else if (empty) {
      empty.remove();
    }
  }

  /* ─── Recents ─── */
  function loadRecents() {
    try { return JSON.parse(localStorage.getItem(RECENTS_KEY)) || []; }
    catch (_) { return []; }
  }
  function saveRecents(arr) {
    try { localStorage.setItem(RECENTS_KEY, JSON.stringify(arr)); } catch (_) {}
  }
  function pushRecent(id) {
    if (!id) return;
    const arr = loadRecents().filter(x => x !== id);
    arr.unshift(id);
    saveRecents(arr.slice(0, 4));
  }
  function renderRecents() {
    const wrap = document.getElementById('hubRecents');
    if (!wrap) return;
    const arr = loadRecents();
    wrap.innerHTML = '';
    if (!arr.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    arr.forEach(id => {
      const m = meta(id);
      if (!m) return;
      const pill = document.createElement('button');
      pill.className = 'hub-recent';
      pill.type = 'button';
      pill.innerHTML = '<span class="hub-recent-icon"></span><span class="hub-recent-name"></span>';
      pill.querySelector('.hub-recent-icon').innerHTML = icons[id] || '';
      pill.querySelector('.hub-recent-name').textContent = tr(m).n;
      pill.addEventListener('click', () => switchTool(id));
      wrap.appendChild(pill);
    });
  }

  /* ─── Breadcrumb ─── */
  function updateCrumb(id) {
    const crumb = document.getElementById('appCrumb');
    if (!crumb) return;
    if (!id) {
      crumb.innerHTML = '<span class="crumb-cat">' + (L === 'pl' ? 'Start' : 'Home') + '</span>';
      return;
    }
    const m = meta(id);
    if (!m) return;
    crumb.innerHTML =
      '<span class="crumb-cat"></span>' +
      '<span class="crumb-sep">/</span>' +
      '<span class="crumb-tool"></span>';
    crumb.querySelector('.crumb-cat').textContent = catLabel(m.cat);
    crumb.querySelector('.crumb-tool').textContent = tr(m).n;
  }

  /* ─── Command Palette ─── */
  const palette = {
    open: false,
    selected: 0,
    items: [],
  };

  function paletteBuildList() {
    palette.items = TOOLS.map(tl => ({ id: tl.id, name: tr(tl).n, cat: catLabel(tl.cat) }));
  }

  function paletteRender(filter) {
    const list = document.getElementById('cmdList');
    if (!list) return;
    const q = (filter || '').trim().toLowerCase();
    const matches = palette.items.filter(it =>
      !q || (it.name + ' ' + it.cat).toLowerCase().includes(q));
    palette.selected = Math.min(palette.selected, Math.max(0, matches.length - 1));
    list.innerHTML = '';
    if (!matches.length) {
      list.innerHTML = '<div class="cmd-empty">' + (L === 'pl' ? 'Nic nie znaleziono.' : 'No results.') + '</div>';
      return;
    }
    matches.forEach((it, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'cmd-item' + (i === palette.selected ? ' selected' : '');
      el.innerHTML =
        '<span class="cmd-icon">' + (icons[it.id] || '') + '</span>' +
        '<span class="cmd-meta"><span class="cmd-name"></span><span class="cmd-cat"></span></span>';
      el.querySelector('.cmd-name').textContent = it.name;
      el.querySelector('.cmd-cat').textContent = it.cat;
      el.addEventListener('mouseenter', () => { palette.selected = i; paintSelection(); });
      el.addEventListener('click', () => { paletteChoose(it.id); });
      list.appendChild(el);
    });
  }

  function paintSelection() {
    document.querySelectorAll('.cmd-item').forEach((el, i) => {
      el.classList.toggle('selected', i === palette.selected);
      if (i === palette.selected) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function paletteChoose(id) {
    closePalette();
    switchTool(id);
  }

  function openPalette() {
    const bd = document.getElementById('cmdBackdrop');
    if (!bd) return;
    paletteBuildList();
    palette.selected = 0;
    paletteRender('');
    bd.classList.add('open');
    palette.open = true;
    const input = document.getElementById('cmdInput');
    if (input) { input.value = ''; setTimeout(() => input.focus(), 10); }
  }

  function closePalette() {
    const bd = document.getElementById('cmdBackdrop');
    if (bd) bd.classList.remove('open');
    palette.open = false;
  }

  function paletteMove(delta) {
    const items = document.querySelectorAll('.cmd-item');
    if (!items.length) return;
    palette.selected = (palette.selected + delta + items.length) % items.length;
    paintSelection();
  }

  function paletteConfirm() {
    const items = Array.from(document.querySelectorAll('.cmd-item'));
    const el = items[palette.selected];
    if (!el) return;
    const name = el.querySelector('.cmd-name').textContent;
    const found = palette.items.find(it => it.name === name);
    if (found) paletteChoose(found.id);
  }

  function initPalette() {
    const bd = document.getElementById('cmdBackdrop');
    const input = document.getElementById('cmdInput');
    const openBtn = document.getElementById('paletteOpen');
    if (openBtn) openBtn.addEventListener('click', openPalette);
    if (bd) bd.addEventListener('click', (e) => { if (e.target === bd) closePalette(); });
    if (input) {
      input.addEventListener('input', () => { palette.selected = 0; paletteRender(input.value); });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); paletteMove(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); paletteMove(-1); }
        else if (e.key === 'Enter') { e.preventDefault(); paletteConfirm(); }
        else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
      });
    }
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        palette.open ? closePalette() : openPalette();
      } else if (e.key === 'Escape') {
        if (palette.open) closePalette();
        else if (document.getElementById('settingsBackdrop').classList.contains('open')) closeSettings();
      }
    });
  }

  /* ─── Settings ─── */
  const SETTINGS_KEY = 'vt.settings';
  const settingsDefaults = { theme: '', lang: null, resolution: '1080p' };
  let settings = loadSettings();

  function loadSettings() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch (_) {}
    return Object.assign({}, settingsDefaults, s);
  }
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (_) {}
  }

  function applyTheme(val) {
    if (val === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('app-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('app-theme', 'dark');
    }
  }

  function applyDefaultResolution(res) {
    document.querySelectorAll('select[id*="Resolution"], #webcapResSelect').forEach(sel => {
      if (!sel.querySelector('option[value="' + res + '"]')) return;
      if (sel.value === res) return;
      sel.value = res;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function markActive(group, attr, val) {
    if (!group) return;
    group.querySelectorAll('.settings-opt').forEach(b => {
      b.classList.toggle('active', b.getAttribute(attr) === val);
    });
  }

  function settingsLabels() {
    const t = L === 'pl' ? { dark: 'Ciemny', light: 'Jasny' } : { dark: 'Dark', light: 'Light' };
    document.querySelectorAll('#setThemeGroup .settings-opt').forEach(b => {
      b.textContent = b.getAttribute('data-theme-val') === 'light' ? t.light : t.dark;
    });
  }

  function reflectSettings() {
    markActive(document.getElementById('setThemeGroup'), 'data-theme-val', settings.theme);
    markActive(document.getElementById('setLangGroup'), 'data-lang-val', settings.lang || L);
    markActive(document.getElementById('setResGroup'), 'data-res-val', settings.resolution);
    settingsLabels();
  }

  function openSettings() {
    reflectSettings();
    document.getElementById('settingsBackdrop').classList.add('open');
  }
  function closeSettings() {
    document.getElementById('settingsBackdrop').classList.remove('open');
  }

  function initSettings() {
    applyTheme(settings.theme);
    if (settings.lang && settings.lang !== L && typeof setLang === 'function') {
      setLang(settings.lang);
      if (typeof applyTranslations === 'function') applyTranslations();
    }

    document.getElementById('settingsOpen').addEventListener('click', openSettings);
    document.getElementById('settingsClose').addEventListener('click', closeSettings);
    const bd = document.getElementById('settingsBackdrop');
    bd.addEventListener('click', e => { if (e.target === bd) closeSettings(); });

    document.querySelectorAll('#setThemeGroup .settings-opt').forEach(b => {
      b.addEventListener('click', () => {
        settings.theme = b.getAttribute('data-theme-val');
        applyTheme(settings.theme);
        saveSettings();
        reflectSettings();
      });
    });
    document.querySelectorAll('#setLangGroup .settings-opt').forEach(b => {
      b.addEventListener('click', () => {
        const v = b.getAttribute('data-lang-val');
        settings.lang = v;
        if (typeof setLang === 'function') setLang(v);
        if (typeof applyTranslations === 'function') applyTranslations();
        window.dispatchEvent(new CustomEvent('lang-changed', { detail: { lang: v } }));
        saveSettings();
        reflectSettings();
      });
    });
    document.querySelectorAll('#setResGroup .settings-opt').forEach(b => {
      b.addEventListener('click', () => {
        settings.resolution = b.getAttribute('data-res-val');
        applyDefaultResolution(settings.resolution);
        saveSettings();
        reflectSettings();
      });
    });
  }

  /* ─── Collapse + Home ─── */
  function initChrome() {
    const nav = document.querySelector('.tool-nav');
    const collapse = document.getElementById('navCollapse');
    if (collapse && nav) {
      collapse.addEventListener('click', () => nav.classList.toggle('collapsed'));
    }
    const home = document.getElementById('navHome');
    if (home) home.addEventListener('click', () => { if (typeof goHub === 'function') goHub(); });
    const kbd = document.getElementById('paletteKbd');
    if (kbd) {
      const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      kbd.textContent = mac ? '⌘ K' : 'Ctrl K';
    }
  }

  /* ─── Hooks ─── */
  window.onToolChanged = function (id) {
    updateCrumb(id);
    if (id) { pushRecent(id); renderRecents(); }
    closePalette();
  };

  /* ─── Re-localize on lang change ─── */
  function relocalize() {
    L = lang();
    relabelNav();
    relabelHub();
    renderRecents();
    settingsLabels();
    const active = document.querySelector('.tool-panel.active');
    updateCrumb(active ? active.dataset.tool : null);
  }

  window.addEventListener('lang-changed', relocalize);

  /* ─── Init ─── */
  function init() {
    buildNav();
    renderHub();
    renderRecents();
    initPalette();
    initChrome();
    initSettings();
    applyDefaultResolution(settings.resolution);
    paletteBuildList();
    if (typeof goHub === 'function') goHub();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
