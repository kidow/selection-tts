window.SelectionTTS = window.SelectionTTS || {};

(function registerSpanishRule(namespace) {
  namespace.languageRules = namespace.languageRules || {};
  namespace.languageRulePriority = namespace.languageRulePriority || [];

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

  namespace.languageRules.es = { minConfidence: 5, matcher: looksLikeSpanishText };
  namespace.languageRulePriority.push("es");
})(window.SelectionTTS);
