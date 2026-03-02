const MENU_ID = "speak-selection";

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Speak selection (English)",
      contexts: ["selection"],
      documentUrlPatterns: [
        "https://chatgpt.com/*",
        "https://chat.openai.com/*",
      ],
    });
  });
}

chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.runtime.onStartup.addListener(createContextMenu);

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID) {
    return;
  }

  if (!info.selectionText || !tab?.id) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: "SPEAK_SELECTION",
      text: info.selectionText,
    });
  } catch (error) {
    // No receiver means the content script is not present in this tab.
    console.warn("Selection TTS: message receiver not found for this tab.", error);
  }
});
