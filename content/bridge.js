window.addEventListener('message', (ev) => {
  try {
    if (ev.source !== window) return;
    const data = ev.data;
    if (!data || data.type !== 'CBV_BUNDLE_FROM_PAGE') return;
    if (!data.bundle) return;
    try {
      chrome.runtime.sendMessage({ type: 'CBV_BUNDLE_READY', bundle: data.bundle });
    } catch (e) {
      // ignore
    }
  } catch (e) {
    // ignore
  }
});
