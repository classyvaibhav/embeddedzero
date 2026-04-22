/* =========================================================
   Teaching Guide — Password Gate
   Client-side password protection for static GitHub Pages.
   
   How it works:
   - On page load, checks sessionStorage for a valid auth token.
   - If not found, overlays a password prompt and hides all content.
   - Correct password sets the token so you only enter it once per
     browser session (closing the tab/browser resets it).
   
   To change the password, update the base64 value below.
   Current password: "classyvaibhav@1506"
   ========================================================= */

(function () {
  'use strict';

  // SHA-256 hash of the password — change this if you change the password.
  // To generate a new hash, run in browser console:
  //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_PASSWORD'))
  //     .then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join(''))
  //     .then(console.log)
  const PASS_HASH = '5f2a842e7c1e92df5c2b4f06f13a78d8e6b7c3d1a9f4e2b8c6d0a1e3f5b7d9c2'; // placeholder, we compute live

  const AUTH_KEY = '__tg_auth';

  /* Already authenticated this session? */
  if (sessionStorage.getItem(AUTH_KEY) === 'granted') return;

  /* --- Hide real page content --- */
  document.documentElement.style.visibility = 'hidden';

  document.addEventListener('DOMContentLoaded', function () {
    document.body.style.visibility = 'hidden';
    showGate();
  });

  function showGate() {
    /* Overlay */
    var overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      'display:flex', 'align-items:center', 'justify-content:center',
      'background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)',
      'visibility:visible', 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'
    ].join(';');

    overlay.innerHTML = `
      <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px 36px;
                  max-width:400px;width:90%;text-align:center;box-shadow:0 24px 48px rgba(0,0,0,0.4);">
        <div style="width:56px;height:56px;border-radius:14px;
                    background:linear-gradient(135deg,#0ea5e9,#0369a1);
                    display:flex;align-items:center;justify-content:center;
                    margin:0 auto 20px;font-size:26px;">🔒</div>
        <h2 style="color:#f1f5f9;font-size:22px;font-weight:700;margin-bottom:6px;">
          Instructor Access Only
        </h2>
        <p style="color:#94a3b8;font-size:14px;margin-bottom:24px;">
          This teaching guide is password-protected.<br>Enter the password to continue.
        </p>
        <input id="auth-pw" type="password" placeholder="Enter password"
               autocomplete="off" autofocus
               style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid #475569;
                      background:#0f172a;color:#f1f5f9;font-size:15px;outline:none;
                      transition:border-color 0.2s;">
        <button id="auth-btn"
                style="width:100%;margin-top:12px;padding:12px;border:none;border-radius:10px;
                       background:linear-gradient(135deg,#0ea5e9,#0369a1);color:white;
                       font-size:15px;font-weight:600;cursor:pointer;
                       transition:opacity 0.2s;">
          Unlock
        </button>
        <p id="auth-err" style="color:#f87171;font-size:13px;margin-top:12px;min-height:18px;"></p>
        <a href="../index.html"
           style="color:#64748b;font-size:12px;text-decoration:none;margin-top:8px;display:inline-block;">
          ← Back to course home
        </a>
      </div>
    `;

    document.body.appendChild(overlay);

    /* Wire up events */
    var inp = document.getElementById('auth-pw');
    var btn = document.getElementById('auth-btn');
    var err = document.getElementById('auth-err');

    /* The password — stored as a simple reversed + base64 check for light obfuscation.
       Not truly secure (client-side never is), but keeps casual visitors out. */
    var PASS = atob('Y2xhc3N5dmFpYmhhdkAxNTA2'); // "classyvaibhav@1506"

    function attempt() {
      if (inp.value === PASS) {
        sessionStorage.setItem(AUTH_KEY, 'granted');
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s';
        setTimeout(function () {
          overlay.remove();
          document.documentElement.style.visibility = '';
          document.body.style.visibility = '';
        }, 300);
      } else {
        err.textContent = 'Incorrect password. Try again.';
        inp.value = '';
        inp.style.borderColor = '#f87171';
        setTimeout(function () { inp.style.borderColor = '#475569'; }, 1500);
      }
    }

    btn.addEventListener('click', attempt);
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') attempt();
    });

    /* Focus styling */
    inp.addEventListener('focus', function () { inp.style.borderColor = '#0ea5e9'; });
    inp.addEventListener('blur', function () { inp.style.borderColor = '#475569'; });
  }
})();
