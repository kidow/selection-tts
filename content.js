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
  zh: [
    "Google 普通话（中国大陆）",
    "Google 國語（臺灣）",
    "Ting-Ting",
    "Sin-ji",
    "Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)",
  ],
  fr: [
    "Google français",
    "Thomas",
    "Amelie",
    "Microsoft Denise Online (Natural) - French (France)",
  ],
  de: [
    "Google Deutsch",
    "Anna",
    "Markus",
    "Microsoft Katja Online (Natural) - German (Germany)",
  ],
  es: [
    "Google español",
    "Jorge",
    "Monica",
    "Microsoft Elvira Online (Natural) - Spanish (Spain)",
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

function detectLanguages(text) {
  return new Promise((resolve) => {
    if (!chrome?.i18n?.detectLanguage) {
      resolve([]);
      return;
    }

    chrome.i18n.detectLanguage(text, (result) => {
      if (chrome.runtime.lastError || !result) {
        resolve([]);
        return;
      }

      resolve(result.languages || []);
    });
  });
}

function looksLikeFrenchText(text) {
  const normalized = text.toLowerCase().replace(/[^a-z'\s]/g, " ");
  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return false;
  }

  const frenchWords = new Set([
    "le",
    "la",
    "les",
    "de",
    "des",
    "du",
    "un",
    "une",
    "et",
    "est",
    "que",
    "qui",
    "dans",
    "pour",
    "avec",
    "pas",
    "plus",
    "nous",
    "vous",
    "ils",
    "elles",
    "bonjour",
    "merci",
  ]);

  let score = 0;
  for (const token of tokens) {
    if (frenchWords.has(token)) {
      score += 1;
    }
  }

  if (/\b[cdjlmnstq]'[a-z]+/.test(normalized)) {
    score += 1;
  }

  if (tokens.length <= 2) {
    return score >= 1;
  }

  return score >= 2;
}

function looksLikeGermanText(text) {
  const normalized = text
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z'\s]/g, " ");
  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return false;
  }

  if (
    /\bguten\s+tag\b/.test(normalized) ||
    /\bdanke\s+(schoen|sehr)\b/.test(normalized) ||
    /\bauf\s+wiedersehen\b/.test(normalized)
  ) {
    return true;
  }

  const germanWords = new Set([
    "guten",
    "danke",
    "schoen",
    "wiedersehen",
    "wie",
    "geht",
    "ihnen",
    "ich",
    "heisse",
    "bitte",
    "nicht",
    "und",
    "ist",
    "sind",
    "der",
    "die",
    "das",
    "mit",
    "fuer",
  ]);

  let score = 0;
  for (const token of tokens) {
    if (germanWords.has(token)) {
      score += 1;
    }
  }

  if (tokens.length <= 2) {
    return score >= 1;
  }

  return score >= 2;
}

function pickTargetLanguage(text, detectedLanguages) {
  const supportedOrder = ["en", "ja", "zh", "fr", "de", "es"];
  const mappedLanguageCodes = {
    en: "en-US",
    ja: "ja-JP",
    zh: "zh-CN",
    fr: "fr-FR",
    de: "de-DE",
    es: "es-ES",
  };

  const normalizedCandidates = (detectedLanguages || [])
    .map((item) => ({
      language: (item?.language || "").toLowerCase(),
      percentage: typeof item?.percentage === "number" ? item.percentage : 0,
    }))
    .filter((item) => item.language.length > 0);

  const frenchCandidate = normalizedCandidates.find((item) =>
    item.language.startsWith("fr")
  );
  const isLikelyFrench = looksLikeFrenchText(text);
  const germanCandidate = normalizedCandidates.find((item) =>
    item.language.startsWith("de")
  );
  const isLikelyGerman = looksLikeGermanText(text);

  if (
    frenchCandidate &&
    (frenchCandidate.percentage >= 5 || isLikelyFrench)
  ) {
    return mappedLanguageCodes.fr;
  }

  if (isLikelyFrench && !frenchCandidate) {
    return mappedLanguageCodes.fr;
  }

  if (
    germanCandidate &&
    (germanCandidate.percentage >= 5 || isLikelyGerman)
  ) {
    return mappedLanguageCodes.de;
  }

  if (isLikelyGerman && !germanCandidate) {
    return mappedLanguageCodes.de;
  }

  for (const candidate of normalizedCandidates) {
    for (const supported of supportedOrder) {
      if (candidate.language.startsWith(supported)) {
        return mappedLanguageCodes[supported];
      }
    }
  }

  if (isLikelyFrench) {
    return mappedLanguageCodes.fr;
  }

  if (isLikelyGerman) {
    return mappedLanguageCodes.de;
  }

  return null;
}

async function speakCurrentSelectionIfSupportedLanguage() {
  const selectedText = window.getSelection()?.toString()?.trim();
  if (!selectedText) {
    return;
  }

  const detectedLanguages = await detectLanguages(selectedText);
  const targetLanguage = pickTargetLanguage(selectedText, detectedLanguages);
  if (!targetLanguage) {
    return;
  }

  await speak(selectedText, targetLanguage);
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
