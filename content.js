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
  ar: [
    "Google العربية",
    "Maged",
    "Microsoft Hamed Online (Natural) - Arabic (Saudi Arabia)",
  ],
  ru: [
    "Google русский",
    "Milena",
    "Microsoft Svetlana Online (Natural) - Russian (Russia)",
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

function looksLikeSpanishText(text) {
  const normalized = text
    .toLowerCase()
    .replace(/á/g, "a")
    .replace(/é/g, "e")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z'\s¿¡]/g, " ");
  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return false;
  }

  if (
    /\bhola\b/.test(normalized) ||
    /\bgracias\b/.test(normalized) ||
    /\bme\s+llamo\b/.test(normalized) ||
    /\bno\s+entiendo\b/.test(normalized)
  ) {
    return true;
  }

  const spanishWords = new Set([
    "hola",
    "gracias",
    "como",
    "estas",
    "me",
    "llamo",
    "no",
    "entiendo",
    "por",
    "favor",
    "buenos",
    "dias",
    "buenas",
    "tardes",
    "noche",
    "que",
    "de",
    "el",
    "la",
    "los",
    "las",
    "un",
    "una",
    "y",
    "es",
    "con",
  ]);

  let score = 0;
  for (const token of tokens) {
    if (spanishWords.has(token)) {
      score += 1;
    }
  }

  if (/[¿¡]/.test(text)) {
    score += 1;
  }

  if (tokens.length <= 2) {
    return score >= 1;
  }

  return score >= 2;
}

function looksLikeArabicText(text) {
  const normalized = text
    .toLowerCase()
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\u0600-\u06ff\s]/g, " ");
  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return false;
  }

  const hasArabicScript = /[\u0600-\u06ff]/.test(normalized);
  if (!hasArabicScript) {
    return false;
  }

  if (
    /\bمرحبا\b/.test(normalized) ||
    /\bشكرا\b/.test(normalized) ||
    /\bكيف\s+حالك\b/.test(normalized) ||
    /\bاسمي\b/.test(normalized) ||
    /\bلا\s+افهم\b/.test(normalized)
  ) {
    return true;
  }

  const arabicWords = new Set([
    "مرحبا",
    "شكرا",
    "كيف",
    "حالك",
    "اسمي",
    "لا",
    "افهم",
    "من",
    "في",
    "انا",
    "انت",
    "هذا",
    "هذه",
    "نعم",
    "ليس",
    "مع",
    "الى",
  ]);

  let score = 0;
  for (const token of tokens) {
    if (arabicWords.has(token)) {
      score += 1;
    }
  }

  if (tokens.length <= 2) {
    return score >= 1;
  }

  return score >= 2;
}

function looksLikeRussianText(text) {
  const normalized = text.toLowerCase().replace(/ё/g, "е");
  const cyrillicOnly = normalized.replace(/[^а-я\s]/g, " ");
  const tokens = cyrillicOnly.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return false;
  }

  const hasCyrillic = /[а-я]/.test(cyrillicOnly);
  if (!hasCyrillic) {
    return false;
  }

  if (
    /\bпривет\b/.test(cyrillicOnly) ||
    /\bздравствуйте\b/.test(cyrillicOnly) ||
    /\bспасибо\b/.test(cyrillicOnly) ||
    /\bменя\s+зовут\b/.test(cyrillicOnly) ||
    /\bя\s+не\s+понимаю\b/.test(cyrillicOnly)
  ) {
    return true;
  }

  const russianWords = new Set([
    "привет",
    "здравствуйте",
    "спасибо",
    "меня",
    "зовут",
    "я",
    "не",
    "понимаю",
    "пожалуйста",
    "как",
    "дела",
    "что",
    "это",
    "и",
    "в",
    "на",
    "с",
    "вы",
    "он",
    "она",
  ]);

  let score = 0;
  for (const token of tokens) {
    if (russianWords.has(token)) {
      score += 1;
    }
  }

  if (tokens.length <= 2) {
    return score >= 1;
  }

  return score >= 2;
}

function pickTargetLanguage(text, detectedLanguages) {
  const supportedOrder = ["en", "ja", "zh", "fr", "de", "es", "ar", "ru"];
  const mappedLanguageCodes = {
    en: "en-US",
    ja: "ja-JP",
    zh: "zh-CN",
    fr: "fr-FR",
    de: "de-DE",
    es: "es-ES",
    ar: "ar-SA",
    ru: "ru-RU",
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
  const spanishCandidate = normalizedCandidates.find((item) =>
    item.language.startsWith("es")
  );
  const isLikelySpanish = looksLikeSpanishText(text);
  const arabicCandidate = normalizedCandidates.find((item) =>
    item.language.startsWith("ar")
  );
  const isLikelyArabic = looksLikeArabicText(text);
  const russianCandidate = normalizedCandidates.find((item) =>
    item.language.startsWith("ru")
  );
  const isLikelyRussian = looksLikeRussianText(text);

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

  if (
    spanishCandidate &&
    (spanishCandidate.percentage >= 5 || isLikelySpanish)
  ) {
    return mappedLanguageCodes.es;
  }

  if (isLikelySpanish && !spanishCandidate) {
    return mappedLanguageCodes.es;
  }

  if (
    arabicCandidate &&
    (arabicCandidate.percentage >= 5 || isLikelyArabic)
  ) {
    return mappedLanguageCodes.ar;
  }

  if (isLikelyArabic && !arabicCandidate) {
    return mappedLanguageCodes.ar;
  }

  if (
    russianCandidate &&
    (russianCandidate.percentage >= 5 || isLikelyRussian)
  ) {
    return mappedLanguageCodes.ru;
  }

  if (isLikelyRussian && !russianCandidate) {
    return mappedLanguageCodes.ru;
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

  if (isLikelySpanish) {
    return mappedLanguageCodes.es;
  }

  if (isLikelyArabic) {
    return mappedLanguageCodes.ar;
  }

  if (isLikelyRussian) {
    return mappedLanguageCodes.ru;
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
