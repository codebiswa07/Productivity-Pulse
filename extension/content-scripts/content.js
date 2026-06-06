// ─── ProductivityPulse Content Script ────────────────────────────────────────
// Minimal content script — blocking is handled in the service worker.
// This script signals page visibility changes to the SW.

(function () {
  document.addEventListener('visibilitychange', () => {
    chrome.runtime.sendMessage({
      type: document.hidden ? 'PAGE_HIDDEN' : 'PAGE_VISIBLE',
      url: window.location.href,
    }).catch(() => {});
  });
})();
