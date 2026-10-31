(function() {
  if (window.__CBV_BRIDGE_CONTENT__) return;
  window.__CBV_BRIDGE_CONTENT__ = true;
  window.addEventListener('message', function(ev) {
    try {
      if (ev.source !== window) return;
      var data = ev.data;
      if (!data || data.type !== 'CBV_BUNDLE_FROM_PAGE') return;
      if (!data.bundle) return;
      try {
        chrome.runtime.sendMessage({ type: 'CBV_BUNDLE_READY', bundle: data.bundle });
      } catch (e) {}
    } catch (e) {}
  });
})();
