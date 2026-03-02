const MENU_ID = "speak-selection";
const COMMAND_SPEAK_IF_ENGLISH = "speak-selected-if-english";

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

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== COMMAND_SPEAK_IF_ENGLISH) {
    return;
  }

  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!activeTab?.id) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(activeTab.id, {
      type: "SPEAK_CURRENT_SELECTION_IF_ENGLISH",
    });
  } catch (error) {
    console.warn("Selection TTS: command receiver not found for this tab.", error);
  }
});
