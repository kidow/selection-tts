window.SelectionTTS = window.SelectionTTS || {};

(function setupLanguageModule(namespace) {
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

  function looksLikePortugueseText(text) {
    const normalized = text
      .toLowerCase()
      .replace(/á/g, "a")
      .replace(/à/g, "a")
      .replace(/â/g, "a")
      .replace(/ã/g, "a")
      .replace(/é/g, "e")
      .replace(/ê/g, "e")
      .replace(/í/g, "i")
      .replace(/ó/g, "o")
      .replace(/ô/g, "o")
      .replace(/õ/g, "o")
      .replace(/ú/g, "u")
      .replace(/ç/g, "c")
      .replace(/[^a-z'\s]/g, " ");
    const tokens = normalized.split(/\s+/).filter(Boolean);
    if (!tokens.length) {
      return false;
    }

    if (
      /\bola\b/.test(normalized) ||
      /\bobrigado\b/.test(normalized) ||
      /\bobrigada\b/.test(normalized) ||
      /\bcomo\s+voce\s+esta\b/.test(normalized) ||
      /\bmeu\s+nome\s+e\b/.test(normalized) ||
      /\beu\s+nao\s+entendo\b/.test(normalized)
    ) {
      return true;
    }

    const portugueseWords = new Set([
      "ola",
      "obrigado",
      "obrigada",
      "como",
      "voce",
      "esta",
      "meu",
      "nome",
      "eu",
      "nao",
      "entendo",
      "por",
      "favor",
      "bom",
      "dia",
      "boa",
      "tarde",
      "noite",
      "de",
      "do",
      "da",
      "e",
      "com",
    ]);

    let score = 0;
    for (const token of tokens) {
      if (portugueseWords.has(token)) {
        score += 1;
      }
    }

    if (tokens.length <= 2) {
      return score >= 1;
    }

    return score >= 2;
  }

  function pickTargetLanguage(text, detectedLanguages) {
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
    const portugueseCandidate = normalizedCandidates.find((item) =>
      item.language.startsWith("pt")
    );
    const isLikelyPortuguese = looksLikePortugueseText(text);

    if (frenchCandidate && (frenchCandidate.percentage >= 5 || isLikelyFrench)) {
      return namespace.MAPPED_LANGUAGE_CODES.fr;
    }

    if (isLikelyFrench && !frenchCandidate) {
      return namespace.MAPPED_LANGUAGE_CODES.fr;
    }

    if (germanCandidate && (germanCandidate.percentage >= 5 || isLikelyGerman)) {
      return namespace.MAPPED_LANGUAGE_CODES.de;
    }

    if (isLikelyGerman && !germanCandidate) {
      return namespace.MAPPED_LANGUAGE_CODES.de;
    }

    if (spanishCandidate && (spanishCandidate.percentage >= 5 || isLikelySpanish)) {
      return namespace.MAPPED_LANGUAGE_CODES.es;
    }

    if (isLikelySpanish && !spanishCandidate) {
      return namespace.MAPPED_LANGUAGE_CODES.es;
    }

    if (arabicCandidate && (arabicCandidate.percentage >= 5 || isLikelyArabic)) {
      return namespace.MAPPED_LANGUAGE_CODES.ar;
    }

    if (isLikelyArabic && !arabicCandidate) {
      return namespace.MAPPED_LANGUAGE_CODES.ar;
    }

    if (russianCandidate && (russianCandidate.percentage >= 5 || isLikelyRussian)) {
      return namespace.MAPPED_LANGUAGE_CODES.ru;
    }

    if (isLikelyRussian && !russianCandidate) {
      return namespace.MAPPED_LANGUAGE_CODES.ru;
    }

    if (
      portugueseCandidate &&
      (portugueseCandidate.percentage >= 5 || isLikelyPortuguese)
    ) {
      return namespace.MAPPED_LANGUAGE_CODES.pt;
    }

    if (isLikelyPortuguese && !portugueseCandidate) {
      return namespace.MAPPED_LANGUAGE_CODES.pt;
    }

    for (const candidate of normalizedCandidates) {
      for (const supported of namespace.SUPPORTED_ORDER) {
        if (candidate.language.startsWith(supported)) {
          return namespace.MAPPED_LANGUAGE_CODES[supported];
        }
      }
    }

    if (isLikelyFrench) {
      return namespace.MAPPED_LANGUAGE_CODES.fr;
    }

    if (isLikelyGerman) {
      return namespace.MAPPED_LANGUAGE_CODES.de;
    }

    if (isLikelySpanish) {
      return namespace.MAPPED_LANGUAGE_CODES.es;
    }

    if (isLikelyArabic) {
      return namespace.MAPPED_LANGUAGE_CODES.ar;
    }

    if (isLikelyRussian) {
      return namespace.MAPPED_LANGUAGE_CODES.ru;
    }

    if (isLikelyPortuguese) {
      return namespace.MAPPED_LANGUAGE_CODES.pt;
    }

    return null;
  }

  namespace.detectLanguages = detectLanguages;
  namespace.pickTargetLanguage = pickTargetLanguage;
})(window.SelectionTTS);
