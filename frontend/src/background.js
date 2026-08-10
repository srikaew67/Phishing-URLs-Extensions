/**
 * background.js — Service worker for the Phishing URLs Detection extension.
 *
 * Listens for tab navigation completion and forwards the URL/title
 * to the popup (if it is currently open).
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  chrome.runtime.sendMessage(
    { type: "NEW_URL", payload: { url: tab.url, title: tab.title } },
    () => {
      // Suppress "receiving end does not exist" when popup is closed
      void chrome.runtime.lastError;
    }
  );
});