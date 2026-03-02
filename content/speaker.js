window.SelectionTTS = window.SelectionTTS || {};

(function setupSpeakerModule(namespace) {
  function pickVoice(voices, language) {
    if (!voices.length) {
      return null;
    }

    const normalizedLanguage = (language || "en").toLowerCase();
    const baseLanguage = normalizedLanguage.split("-")[0];
    const preferredNames =
      namespace.PREFERRED_VOICE_NAMES_BY_LANGUAGE[baseLanguage] ||
      namespace.PREFERRED_VOICE_NAMES_BY_LANGUAGE.en;

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

  namespace.speak = speak;
})(window.SelectionTTS);
