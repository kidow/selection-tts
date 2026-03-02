const PREFERRED_VOICE_NAMES_BY_LANGUAGE = {
  en: [
    "Google US English",
    "Samantha",
    "Alex",
    "Microsoft Jenny Online (Natural) - English (United States)",
  ],
  ja: [
    "Google 日本語",
    "Kyoko",
    "Otoya",
    "Microsoft Nanami Online (Natural) - Japanese (Japan)",
  ],
};

function pickVoice(voices, language) {
  if (!voices.length) {
    return null;
  }

  const normalizedLanguage = (language || "en").toLowerCase();
  const baseLanguage = normalizedLanguage.split("-")[0];
  const preferredNames =
    PREFERRED_VOICE_NAMES_BY_LANGUAGE[baseLanguage] ||
    PREFERRED_VOICE_NAMES_BY_LANGUAGE.en;

  for (const preferredName of preferredNames) {
    const matched = voices.find((voice) => voice.name === preferredName);
    if (matched) {
      return matched;
    }
  }

  const exactLanguageVoice = voices.find(
    (voice) => voice.lang.toLowerCase() === normalizedLanguage
  );
  if (exactLanguageVoice) {
    return exactLanguageVoice;
  }

  const baseLanguageVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith(baseLanguage)
  );
  if (baseLanguageVoice) {
    return baseLanguageVoice;
  }

  return voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) || null;
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

async function speak(text, language = "en-US") {
  if (!text?.trim()) {
    return;
  }

  window.speechSynthesis.cancel();

  const voices = await loadVoices();
  const selectedVoice = pickVoice(voices, language);

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = selectedVoice?.lang || language;
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

async function speakCurrentSelectionIfSupportedLanguage() {
  const selectedText = window.getSelection()?.toString()?.trim();
  if (!selectedText) {
    return;
  }

  const language = await detectLanguage(selectedText);
  if (!language) {
    return;
  }

  const normalizedLanguage = language.toLowerCase();
  if (
    !normalizedLanguage.startsWith("en") &&
    !normalizedLanguage.startsWith("ja")
  ) {
    return;
  }

  await speak(selectedText, normalizedLanguage.startsWith("ja") ? "ja-JP" : "en-US");
}

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
  if (message?.type === "SPEAK_CURRENT_SELECTION_IF_ENGLISH") {
    void speakCurrentSelectionIfSupportedLanguage();
  }
});

window.addEventListener("keydown", onShortcutKeydown, true);
