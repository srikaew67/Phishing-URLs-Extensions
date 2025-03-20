// src/background.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      // You can process the URL here or send it to your popup
      console.log("Tab URL:", tab.url);
      
      // Optional: Send URL to your popup if it's open
      chrome.runtime.sendMessage({ 
        type: "NEW_URL", 
        payload: { url: tab.url, title: tab.title }
      });
    }
  });