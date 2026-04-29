/* Theme toggle + site-bar styles.
   Loaded synchronously in <head> so theme is set before paint and the
   site-bar HTML in each page gets styled without FOUC. */
(function () {
  var STORAGE_KEY = 'ec-theme';
  var DEFAULT_THEME = 'light';   // explicit light default
  var root = document.documentElement;

  function getPreferred() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return DEFAULT_THEME;
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  }

  apply(getPreferred());

  /* Cross-frame / cross-tab theme sync via the storage event */
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) apply(e.newValue);
  });

  /* If we're rendered inside an iframe (e.g. live.html embedding lessons),
     hide the inner site-bar and toggle so they don't stack with the parent's. */
  var IS_EMBEDDED = false;
  try { IS_EMBEDDED = (window.self !== window.top); } catch (e) { IS_EMBEDDED = true; }
  try {
    if (location.search && location.search.indexOf('embed=1') !== -1) IS_EMBEDDED = true;
  } catch (e) {}
  if (IS_EMBEDDED) {
    root.setAttribute('data-embedded', '1');
    /* Inline early-hide style (before main stylesheet runs) — prevents FOUC of duplicate nav */
    var pre = document.createElement('style');
    pre.textContent = '.site-bar,.theme-toggle,nav.topbar,nav.toc{display:none!important}';
    (document.head || document.documentElement).appendChild(pre);
  }

  /* ------- site-wide stylesheet (toggle button + top nav bar) ------- */
  var css = [
    /* Toggle button */
    '.theme-toggle{position:fixed;bottom:20px;right:20px;z-index:9999;width:46px;height:46px;border-radius:50%;border:1px solid var(--border,#e2e8f0);background:var(--card,#fff);color:var(--ink,#0f172a);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 6px 24px rgba(0,0,0,.12);transition:transform .25s ease,box-shadow .25s ease,background .25s ease,border-color .25s ease;padding:0;line-height:1;-webkit-tap-highlight-color:transparent}',
    '.theme-toggle:hover{transform:translateY(-2px) rotate(-12deg);box-shadow:0 10px 30px rgba(0,0,0,.18)}',
    '.theme-toggle:focus-visible{outline:2px solid var(--primary,#0d9488);outline-offset:3px}',
    '.theme-toggle .t-icon{display:block;transition:transform .4s cubic-bezier(.4,.2,.2,1),opacity .25s}',
    '[data-theme="light"] .theme-toggle .t-moon{display:none}',
    '[data-theme="dark"]  .theme-toggle .t-sun {display:none}',
    '[data-theme="dark"]  .theme-toggle{background:var(--card,#141926);border-color:var(--border,#243042);color:var(--ink,#e2e8f0);box-shadow:0 6px 24px rgba(0,0,0,.4)}',
    'html{transition:background-color .3s ease,color .3s ease}',
    'body{transition:background-color .3s ease,color .3s ease}',
    '@media(max-width:520px){.theme-toggle{bottom:14px;right:14px;width:42px;height:42px;font-size:18px}}',
    '@media print{.theme-toggle,.site-bar{display:none}}',

    /* Site bar (global top navigation, present on every page) */
    '.site-bar{position:sticky;top:0;z-index:1100;border-bottom:1px solid var(--border,#e2e8f0);font-family:"Inter",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased;background:var(--card,#fff)}',
    '@supports (backdrop-filter:blur(8px)){.site-bar{background:color-mix(in srgb,var(--card,#fff) 84%,transparent);backdrop-filter:saturate(180%) blur(10px)}}',
    '.site-bar-inner{max-width:1200px;margin:0 auto;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}',
    '.site-bar-logo{font-weight:800;font-size:18px;color:var(--primary,#0d9488);text-decoration:none;display:inline-flex;align-items:center;gap:8px;line-height:1;letter-spacing:-.2px}',
    '.site-bar-logo span{background:linear-gradient(135deg,var(--primary,#0d9488),var(--accent-strong,#0891b2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    '.site-bar-nav{display:flex;gap:2px;flex-wrap:wrap;align-items:center}',
    '.site-bar-nav a{color:var(--muted,#64748b);text-decoration:none;font-size:14px;font-weight:600;padding:8px 14px;border-radius:8px;transition:color .15s,background .15s;line-height:1.2}',
    '.site-bar-nav a:hover{color:var(--primary,#0d9488);background:var(--primary-soft,#f0fdfa)}',
    '.site-bar-nav a.active{color:var(--primary,#0d9488);background:var(--primary-soft,#f0fdfa)}',
    '[data-theme="dark"] .site-bar-nav a:hover,[data-theme="dark"] .site-bar-nav a.active{color:var(--primary);background:var(--primary-light)}',
    '@media(max-width:640px){.site-bar-inner{padding:10px 16px;gap:8px}.site-bar-nav a{padding:6px 10px;font-size:13px}.site-bar-logo{font-size:16px}}',

    /* Embedded mode (loaded inside an iframe — e.g. inside live.html) */
    '[data-embedded] .site-bar,[data-embedded] .theme-toggle,[data-embedded] nav.topbar,[data-embedded] nav.toc{display:none!important}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.setAttribute('data-theme-toggle', '');
  styleEl.appendChild(document.createTextNode(css));
  (document.head || document.documentElement).appendChild(styleEl);

  function mountToggle() {
    if (IS_EMBEDDED) return;  // no toggle in iframe — parent owns it
    if (document.querySelector('.theme-toggle')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.setAttribute('title', 'Toggle theme');
    btn.innerHTML = '<span class="t-icon t-sun" aria-hidden="true">☀</span><span class="t-icon t-moon" aria-hidden="true">☾</span>';
    btn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    });
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountToggle);
  } else {
    mountToggle();
  }

  /* =====================================================================
     Course progress tracking
     - Each lesson page auto-marks itself complete once the reader scrolls
       past ~90% of the page.
     - Progress lives in localStorage (key: ec-progress) so it's shared
       across the iframe + parent and survives navigation.
     - Notes index gets ✓ marks on completed lesson cards automatically.
     ===================================================================== */
  var PROG_KEY = 'ec-progress';
  var TOTAL_LESSONS = 12;

  function readProgress() {
    try { return JSON.parse(localStorage.getItem(PROG_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function writeProgress(p) {
    try { localStorage.setItem(PROG_KEY, JSON.stringify(p)); } catch (e) {}
  }
  function lessonIdFromPath(p) {
    var m = (p || '').match(/lesson-(\d+)\.html$/);
    return m ? 'lesson-' + m[1] : null;
  }

  /* Auto-mark current lesson complete on scroll-to-bottom */
  var currentLesson = lessonIdFromPath(location.pathname);
  if (currentLesson) {
    var alreadyMarked = false;
    function maybeMark() {
      if (alreadyMarked) return;
      var doc = document.documentElement;
      var scrolled = (window.scrollY || window.pageYOffset || 0) + window.innerHeight;
      var total = doc.scrollHeight;
      if (total - scrolled < 200 || scrolled / total > 0.9) {
        alreadyMarked = true;
        var p = readProgress();
        if (!p[currentLesson]) {
          p[currentLesson] = true;
          writeProgress(p);
        }
      }
    }
    window.addEventListener('scroll', maybeMark, { passive: true });
    /* Also try once on load — handles short pages already past 90% */
    if (document.readyState === 'complete') setTimeout(maybeMark, 200);
    else window.addEventListener('load', function () { setTimeout(maybeMark, 200); });
  }

  /* On notes index: tick completed lesson cards */
  function paintLessonCards() {
    var cards = document.querySelectorAll('.lesson-card');
    if (!cards.length) return;
    var p = readProgress();
    cards.forEach(function (card) {
      var href = card.getAttribute('href') || '';
      var id = lessonIdFromPath(href);
      if (id && p[id]) card.classList.add('lesson-done');
      else card.classList.remove('lesson-done');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paintLessonCards);
  } else {
    paintLessonCards();
  }
  window.addEventListener('storage', function (e) {
    if (e.key === PROG_KEY) paintLessonCards();
  });

  /* Expose tiny API for live.html (and any future caller) */
  window.ECProgress = {
    read: readProgress,
    total: TOTAL_LESSONS,
    completedCount: function () {
      var p = readProgress(), n = 0;
      for (var k in p) if (p[k]) n++;
      return n;
    },
    percent: function () {
      return Math.round((this.completedCount() / TOTAL_LESSONS) * 100);
    }
  };
})();
