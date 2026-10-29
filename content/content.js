const s = document.createElement('script');
s.src = chrome.runtime.getURL('content/picker.js');
(document.head || document.documentElement).appendChild(s);

const s2 = document.createElement('script');
s2.src = chrome.runtime.getURL('content/extractor-global.js');
(document.head || document.documentElement).appendChild(s2);

document.addEventListener('cbv:pick', () => {
  setTimeout(() => {
    const el = window.__CBV_SELECTED_EL__;
    if (!el) {
      console.warn('[CBV] No selected element');
      return;
    }
    try {
      if (typeof window.CBV_buildBundle === 'function') {
        const bundle = window.CBV_buildBundle(el);
        chrome.runtime.sendMessage({ type: 'CBV_BUNDLE_READY', bundle });
      } else {
        chrome.runtime.sendMessage({ type: 'CBV_BUNDLE_ERROR', error: 'extractor not ready' });
      }
    } catch (err) {
      console.error('[CBV] Extract error', err);
      chrome.runtime.sendMessage({ type: 'CBV_BUNDLE_ERROR', error: err.message });
    } finally {
      delete window.__CBV_SELECTED_EL__;
    }
  }, 50);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CBV_START_PICKER') {
    if (document.querySelector('.cbv-picker-overlay')) {
      sendResponse({ ok: true });
      return true;
    }
    const s3 = document.createElement('script');
    s3.src = chrome.runtime.getURL('content/picker.js');
    (document.head || document.documentElement).appendChild(s3);
    sendResponse({ ok: true });
    return true;
  }
  return false;
});
