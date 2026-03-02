function speak(text) {
  if (!text?.trim()) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = "en-US";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "SPEAK_SELECTION") {
    speak(message.text);
  }
});
