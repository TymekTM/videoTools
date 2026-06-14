/* ═══════════════════════════════════════
   CORE — navigation, theme, init
   ═══════════════════════════════════════ */

let activeTool = 'newspaper';

function switchTool(toolId) {
  activeTool = toolId;
  $$('.tool-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tool === toolId));
  $$('.tool-panel').forEach(p => p.classList.toggle('active', p.dataset.tool === toolId));
  if (toolId === 'newspaper') {
    updatePreviewSize();
  } else if (toolId === 'chat') {
    chatUpdatePreviewSize();
    chatRenderPreview();
  } else if (toolId === 'typing') {
    typingUpdatePreviewSize();
    typingRefreshPreview();
  } else if (toolId === 'map') {
    if (window.mapActivate) window.mapActivate();
  } else if (toolId === 'chart') {
    if (window.chartActivate) window.chartActivate();
  } else if (toolId === 'calendar') {
    if (window.calendarActivate) window.calendarActivate();
  } else if (toolId === 'notification') {
    if (window.notificationActivate) window.notificationActivate();
  } else if (toolId === 'subtitles') {
    if (window.subtitlesActivate) window.subtitlesActivate();
  } else if (toolId === 'webcap') {
    if (window.webcapActivate) window.webcapActivate();
  } else if (toolId === 'character') {
    if (window.characterActivate) window.characterActivate();
  } else if (toolId === 'corridorkey') {
    if (typeof CK !== 'undefined' && CK.els && !CK.els.statusBadge) {
      try { CK.init(); } catch (e) { console.error('[init] corridorkey activate:', e); }
    }
  }
}

function initToolNav() {
  $$('.tool-nav-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => switchTool(btn.dataset.tool));
  });
}

/* ═══════════════════════════════════════
   THEME TOGGLE
   ═══════════════════════════════════════ */

function initThemeToggle() {
  const saved = localStorage.getItem('app-theme');
  if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');

  const toggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('app-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('app-theme', 'light');
    }
  };

  document.querySelectorAll('.theme-toggle-nav').forEach(btn => {
    btn.addEventListener('click', toggle);
  });
}

function initLangToggle() {
  const btn = document.getElementById('langToggleNav');
  if (!btn) return;
  btn.textContent = currentLang().toUpperCase();
  btn.addEventListener('click', () => {
    const next = currentLang() === 'pl' ? 'en' : 'pl';
    setLang(next);
    btn.textContent = next.toUpperCase();
    applyTranslations();
    window.dispatchEvent(new CustomEvent('lang-changed', { detail: { lang: next } }));
  });
}

/* ═══════════════════════════════════════
   INIT
   ═══════════════════════════════════════ */

function init() {
  applyTranslations();
  initLangToggle();
  initThemeToggle();
  initToolNav();
  try { initNewspaper(); } catch (e) { console.error('[init] newspaper:', e); }
  try { initChat(); } catch (e) { console.error('[init] chat:', e); }
  try { initTyping(); } catch (e) { console.error('[init] typing:', e); }
  try { if (window.initMapTool) window.initMapTool(); } catch (e) { console.error('[init] map:', e); }
  try { if (window.initChartTool) window.initChartTool(); } catch (e) { console.error('[init] chart:', e); }
  try { if (window.initCalendarTool) window.initCalendarTool(); } catch (e) { console.error('[init] calendar:', e); }
  try { if (window.initNotificationTool) window.initNotificationTool(); } catch (e) { console.error('[init] notification:', e); }
  try { if (window.initSubtitlesTool) window.initSubtitlesTool(); } catch (e) { console.error('[init] subtitles:', e); }
  try { if (window.initWebcap) window.initWebcap(); } catch (e) { console.error('[init] webcap:', e); }
  try { if (window.initCharacterTool) window.initCharacterTool(); } catch (e) { console.error('[init] character:', e); }
}

document.addEventListener('DOMContentLoaded', init);
