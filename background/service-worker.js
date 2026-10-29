chrome.runtime.onInstalled.addListener(() => {
  console.log("[CBV] Installed");
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  try {
    await chrome.sidePanel.setOptions({ tabId: tab.id, path: "sidepanel/index.html", enabled: true });
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (e) {
    console.error("[CBV] open sidepanel error", e);
  }
});
