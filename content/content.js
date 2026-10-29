const s = document.createElement('script');
s.src = chrome.runtime.getURL('content/picker.js');
s.type = 'text/javascript';
(document.head || document.documentElement).appendChild(s);

document.addEventListener('cbv:pick', () => {
  setTimeout(async () => {
    const el = window.__CBV_SELECTED_EL__;
    if (!el) {
      console.warn('[CBV] No selected element');
      return;
    }
    try {
      const { buildBundle } = await import(chrome.runtime.getURL('content/extractor.js'));
      const bundle = buildBundle(el);
      chrome.runtime.sendMessage({ type: 'CBV_BUNDLE_READY', bundle });
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
    const s2 = document.createElement('script');
    s2.src = chrome.runtime.getURL('content/picker.js');
    (document.head || document.documentElement).appendChild(s2);
    sendResponse({ ok: true });
    return true;
  }
  return false;
});
