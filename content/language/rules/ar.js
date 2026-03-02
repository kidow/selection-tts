window.SelectionTTS = window.SelectionTTS || {};

(function registerArabicRule(namespace) {
  namespace.languageRules = namespace.languageRules || {};
  namespace.languageRulePriority = namespace.languageRulePriority || [];

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

  namespace.languageRules.ar = { minConfidence: 5, matcher: looksLikeArabicText };
  namespace.languageRulePriority.push("ar");
})(window.SelectionTTS);
