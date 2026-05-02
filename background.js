const COMMAND_SPEAK_IF_ENGLISH = "speak-selected-if-english";
const CONTEXT_MENU_ID = "selection-tts-speak";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Selection TTS로 읽기",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !tab?.id) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: "SPEAK_CURRENT_SELECTION_IF_ENGLISH",
    });
  } catch (error) {
    console.warn("Selection TTS: command receiver not found for this tab.", error);
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
