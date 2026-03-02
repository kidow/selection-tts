window.SelectionTTS = window.SelectionTTS || {};

(function registerGermanRule(namespace) {
  namespace.languageRules = namespace.languageRules || {};
  namespace.languageRulePriority = namespace.languageRulePriority || [];

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

  namespace.languageRules.de = { minConfidence: 5, matcher: looksLikeGermanText };
  namespace.languageRulePriority.push("de");
})(window.SelectionTTS);
