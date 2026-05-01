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
  } else if (toolId === 'notification') {
    if (window.notificationActivate) window.notificationActivate();
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
  initNewspaper();
  initChat();
  initTyping();
  if (window.initMapTool) window.initMapTool();
  if (window.initChartTool) window.initChartTool();
  if (window.initNotificationTool) window.initNotificationTool();
}

document.addEventListener('DOMContentLoaded', init);
