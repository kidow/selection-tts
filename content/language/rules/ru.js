window.SelectionTTS = window.SelectionTTS || {};

(function registerRussianRule(namespace) {
  namespace.languageRules = namespace.languageRules || {};
  namespace.languageRulePriority = namespace.languageRulePriority || [];

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

  namespace.languageRules.ru = { minConfidence: 5, matcher: looksLikeRussianText };
  namespace.languageRulePriority.push("ru");
})(window.SelectionTTS);
