chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Log the URL (this part works fine)
    console.log("Tab URL:", tab.url);
    
    // Check if popup exists before sending message
    chrome.runtime.sendMessage(
      { 
        type: "NEW_URL", 
        payload: { url: tab.url, title: tab.title }
      },
      (response) => {
        // This prevents the error from appearing in console
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          // Handle the error silently or log it appropriately
          console.log("Popup not available, message not sent");
        }
      }
    );
  }
});