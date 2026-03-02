const COMMAND_SPEAK_IF_ENGLISH = "speak-selected-if-english";

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
