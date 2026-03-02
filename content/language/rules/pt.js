window.SelectionTTS = window.SelectionTTS || {};

(function registerPortugueseRule(namespace) {
  namespace.languageRules = namespace.languageRules || {};
  namespace.languageRulePriority = namespace.languageRulePriority || [];

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

  namespace.languageRules.pt = { minConfidence: 5, matcher: looksLikePortugueseText };
  namespace.languageRulePriority.push("pt");
})(window.SelectionTTS);
