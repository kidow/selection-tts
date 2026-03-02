const PREFERRED_VOICE_NAMES = [
  "Google US English",
  "Samantha",
  "Alex",
  "Microsoft Jenny Online (Natural) - English (United States)",
];

function pickVoice(voices) {
  if (!voices.length) {
    return null;
  }

  for (const preferredName of PREFERRED_VOICE_NAMES) {
    const matched = voices.find((voice) => voice.name === preferredName);
    if (matched) {
      return matched;
    }
  }

  const enUsVoice = voices.find((voice) => voice.lang === "en-US");
  if (enUsVoice) {
    return enUsVoice;
  }

  return voices.find((voice) => voice.lang.startsWith("en")) || null;
}

function loadVoices() {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    return Promise.resolve(voices);
  }

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 1500);

    function onVoicesChanged() {
      window.clearTimeout(timeoutId);
      resolve(window.speechSynthesis.getVoices());
    }

    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged, {
      once: true,
    });
  });
}

async function speak(text) {
  if (!text?.trim()) {
    return;
  }

  window.speechSynthesis.cancel();

  const voices = await loadVoices();
  const selectedVoice = pickVoice(voices);

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = selectedVoice?.lang || "en-US";
  utterance.voice = selectedVoice;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

function detectLanguage(text) {
  return new Promise((resolve) => {
    if (!chrome?.i18n?.detectLanguage) {
      resolve(null);
      return;
    }

    chrome.i18n.detectLanguage(text, (result) => {
      if (chrome.runtime.lastError || !result) {
        resolve(null);
        return;
      }

      const [topLanguage] = result.languages || [];
      resolve(topLanguage?.language || null);
    });
  });
}

async function speakCurrentSelectionIfEnglish() {
  const selectedText = window.getSelection()?.toString()?.trim();
  if (!selectedText) {
    return;
  }

  const language = await detectLanguage(selectedText);
  if (!language || !language.startsWith("en")) {
    return;
  }

  await speak(selectedText);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "SPEAK_SELECTION") {
    void speak(message.text);
    return;
  }

  if (message?.type === "SPEAK_CURRENT_SELECTION_IF_ENGLISH") {
    void speakCurrentSelectionIfEnglish();
  }
});
