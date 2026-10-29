chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch (e) {}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    try {
      chrome.sidePanel.setOptions({
        tabId: tabId,
        path: 'sidepanel/index.html',
        enabled: true
      });
    } catch (e) {}
  }
});
