chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id) return;
  try {
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: "sidepanel/index.html",
      enabled: true
    });
  } catch (e) {}
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (e) {
    // ignore
  }
});
