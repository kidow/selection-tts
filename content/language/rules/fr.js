window.SelectionTTS = window.SelectionTTS || {};

(function registerFrenchRule(namespace) {
  namespace.languageRules = namespace.languageRules || {};
  namespace.languageRulePriority = namespace.languageRulePriority || [];

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

  namespace.languageRules.fr = { minConfidence: 5, matcher: looksLikeFrenchText };
  namespace.languageRulePriority.push("fr");
})(window.SelectionTTS);
