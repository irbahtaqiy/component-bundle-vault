(function(){
  if (window.__CBV_CONTENT_INIT__) return;
  window.__CBV_CONTENT_INIT__ = true;

  document.addEventListener('cbv:pick', () => {
    setTimeout(() => {
      const el = window.__CBV_SELECTED_EL__;
      if (!el) return;
      try {
        if (typeof window.CBV_buildBundle === 'function') {
          const bundle = window.CBV_buildBundle(el);
          try { chrome.runtime.sendMessage({ type: 'CBV_BUNDLE_READY', bundle }); } catch(e){}
        } else {
          try { chrome.runtime.sendMessage({ type: 'CBV_BUNDLE_ERROR', error: 'extractor not ready' }); } catch(e){}
        }
      } catch (err) {
        try { chrome.runtime.sendMessage({ type: 'CBV_BUNDLE_ERROR', error: err.message }); } catch(e){}
      } finally {
        delete window.__CBV_SELECTED_EL__;
      }
    }, 40);
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'CBV_START_PICKER') {
      try {
        if (window.__CBV_PICKER_ACTIVE__) {
          sendResponse({ ok: true });
          return true;
        }
        const s = document.createElement('script');
        s.src = chrome.runtime.getURL('content/picker.js');
        (document.head || document.documentElement).appendChild(s);
        sendResponse({ ok: true });
      } catch(e) {
        sendResponse({ ok: false, error: e.message });
      }
      return true;
    }
    return false;
  });
})();
