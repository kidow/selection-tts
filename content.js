window.SelectionTTS = window.SelectionTTS || {};

(function setupContentEntry(namespace) {
  const MESSAGE_TYPE_SPEAK_SELECTION = "SPEAK_CURRENT_SELECTION_IF_ENGLISH";

  function isEditableTarget(target) {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const tagName = target.tagName.toLowerCase();
    return (
      target.isContentEditable ||
      tagName === "input" ||
      tagName === "textarea" ||
      tagName === "select"
    );
  }

  async function speakCurrentSelectionIfSupportedLanguage() {
    const selectedText = window.getSelection()?.toString()?.trim();
    if (!selectedText) {
      return;
    }

    const detectedLanguages = await namespace.detectLanguages(selectedText);
    const targetLanguage = namespace.pickTargetLanguage(
      selectedText,
      detectedLanguages
    );
    if (!targetLanguage) {
      return;
    }

    const languageLabel = namespace.getLanguageLabelKo(targetLanguage);
    namespace.showToast(`발음 언어: ${languageLabel}`);

    await namespace.speak(selectedText, targetLanguage);
  }

  function onShortcutKeydown(event) {
    const isMacShortcut = event.metaKey && !event.ctrlKey && !event.altKey;
    const isShortcutKey = event.key.toLowerCase() === "i";
    if (!isMacShortcut || !isShortcutKey) {
      return;
    }

    if (isEditableTarget(event.target)) {
      return;
    }

    event.preventDefault();
    void speakCurrentSelectionIfSupportedLanguage();
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === MESSAGE_TYPE_SPEAK_SELECTION) {
      void speakCurrentSelectionIfSupportedLanguage();
    }
  });

  window.addEventListener("keydown", onShortcutKeydown, true);
})(window.SelectionTTS);
