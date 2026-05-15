# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A pure static HTML/CSS/JS site published via GitHub Pages — an entry-level embedded systems course. **No build step, no package manager, no framework, no tests.** Every page is a hand-written `.html` file with inline `<style>` and `<script>` blocks. Shared behaviour lives in `assets/js/`.

Live site: <https://classyvaibhav.github.io/embeddedzero/>

## Running locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

`.nojekyll` disables GitHub Pages' Jekyll processing — files are served verbatim, so paths in `<script src=...>` and `<a href=...>` must be exactly what gets served.

## Page layout

- `index.html` — landing page
- `notes/index.html` + `notes/lesson-01.html`…`lesson-12.html` — student-facing course (12 lessons, public)
- `teaching/index.html` + topic pages (`electronics.html`, `embedded.html`, `hardware.html`, `labs.html`, `pcb.html`, `cheats.html`, `symbols.html`, `overview.html`) — instructor guide, **password-gated** by `assets/js/auth.js`
- `career_plan.html` — gated by `assets/js/auth-career.js` (separate password from teaching)
- `live.html` + `listen.html` — paired live-session pages (see below)
- `404.html` — GitHub Pages 404 fallback

## The live/listen pair (live.html + listen.html)

This is the only non-trivial system in the repo. Read both files before editing either — they are tightly coupled via a shared session ID and PeerJS broker.

- **`live.html`** runs on the *student's* laptop. It embeds `notes/index.html?embed=1` in an `<iframe>`, captures the mic via `getUserMedia`, and publishes audio through PeerJS using the constant `DEFAULT_TUTOR_ID = 'embeddedzero-vk-bahar-live'`. Override at runtime with `?id=xxx`. The same constant must appear in `listen.html` — they pair on this ID alone, with no per-device coordination.
- **`listen.html`** runs on the *tutor's* laptop and connects to that same peer ID to receive audio.
- PeerJS is loaded from a CDN (`https://unpkg.com/peerjs@1.5.4/...`) — no local copy.
- The session ID is **deliberately not persisted to localStorage**; persisting caused different machines to drift to different IDs. Don't add localStorage caching here.
- Recording uploads are POSTed in-memory to a Cloudflare Worker (`https://embeddedzero.classyvaibhav.workers.dev/`) which forwards to a Telegram bot. The Worker code lives outside this repo.
- `live.html` also drives the progress bar by reading `window.ECProgress` from the embedded iframe (see "Progress tracking" below).

## Cross-cutting JS (assets/js/)

Each script is loaded as a plain `<script src="...">` tag. They communicate through `localStorage` keys, `window.*` globals, and the `storage` event for cross-frame/cross-tab sync. Order of inclusion in the `<head>` matters — `theme-toggle.js` must run before paint to avoid FOUC.

- **`theme-toggle.js`** — three jobs in one file, despite the name:
  1. Light/dark theme (key: `ec-theme`), applied via `data-theme` attribute on `<html>`. Cross-tab sync via `storage` event.
  2. Auto-injects the global `.site-bar` styles and the floating theme-toggle button. **Detects iframe embedding** (via `window.self !== window.top` *or* `?embed=1` in the URL) and hides duplicate nav/toggle when embedded so they don't stack with the parent's.
  3. Course progress tracking (key: `ec-progress`, JSON map of `lesson-NN → true`). A lesson auto-marks complete when the reader scrolls past ~90% of the page, **but only while a live session is active** (gated on `localStorage['ec-session-active'] === '1'`, which `live.html` sets/clears). Outside a session reading still works; it just doesn't tick the box. Exposes `window.ECProgress` ({read, total, completedCount, percent}) for `live.html`'s progress strip.
- **`mobile-gate.js`** — desktop-only overlay. Hides all body children and shows a "Desktop only" card on screens narrower than 1024px or on a UA that matches mobile. Must be included on every page (commit `36f51d1` made this site-wide).
- **`auth.js`** — SHA-256 password gate for the teaching guide. Hash is stored inline (`PASS_HASH`); session grant lives in `sessionStorage` under `__tg_auth`. To rotate the password: `node -e "console.log(require('crypto').createHash('sha256').update('NEW_PASSWORD').digest('hex'))"` and replace the constant.
- **`auth-career.js`** — same pattern as `auth.js` but for `career_plan.html` only, with a separate hash and session key.
- **`3d-hero.js`, `interactions.js`** — present in `assets/js/` but **not currently referenced from any HTML page**. Treat as dormant; verify with grep before assuming they're live.

## Conventions when editing

- Lesson links should route through `live.html` (commit `d7ec504` migrated all lesson links to do this so progress + audio capture happen automatically). Don't link directly to `notes/lesson-NN.html` from public navigation unless you have a reason.
- All pages need `mobile-gate.js`, `theme-toggle.js`, and the global `.site-bar` markup. When adding a new page, copy the `<head>` block from a sibling page rather than building from scratch.
- CSS is per-page and inline — duplication across pages is intentional and expected. Don't refactor it into a shared stylesheet without checking that the parent (`live.html`) and child (iframed lesson) themes still agree.
- Theme variables (`--primary`, `--ink`, `--bg`, etc.) are redeclared in every page's `:root` and `[data-theme="dark"]` blocks. Keep the variable *names* consistent across pages — `theme-toggle.js`'s injected styles reference them with fallbacks.

## localStorage / sessionStorage keys in use

| Key | Type | Owner | Purpose |
|---|---|---|---|
| `ec-theme` | localStorage | theme-toggle.js | `'light'` or `'dark'` |
| `ec-progress` | localStorage | theme-toggle.js | JSON `{lesson-01: true, ...}` |
| `ec-session-active` | localStorage | live.html | `'1'` while mic session is live; gates progress marking |
| `__tg_auth` | sessionStorage | auth.js | `'granted'` after teaching-guide unlock |
| (career key) | sessionStorage | auth-career.js | per-session unlock for career_plan.html |

When adding a new feature that crosses pages or the live/notes iframe boundary, prefer one of these channels (localStorage + `storage` event) over postMessage — that's the established pattern.

## Deployment

Push to `main` → GitHub Pages serves it. There is no CI, no preview environment, no staging. Test locally via `python3 -m http.server` before pushing.
