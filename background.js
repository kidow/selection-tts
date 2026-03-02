chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "speak-selection",
    title: "Speak selection (English)",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "speak-selection") {
    return;
  }

  if (!info.selectionText || !tab?.id) {
    return;
  }

  chrome.tabs.sendMessage(tab.id, {
    type: "SPEAK_SELECTION",
    text: info.selectionText,
  });
});
