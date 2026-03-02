window.SelectionTTS = window.SelectionTTS || {};

(function setupPickTargetLanguageModule(namespace) {
  function normalizeCandidates(detectedLanguages) {
    return (detectedLanguages || [])
      .map((item) => ({
        language: (item?.language || "").toLowerCase(),
        percentage: typeof item?.percentage === "number" ? item.percentage : 0,
      }))
      .filter((item) => item.language.length > 0);
  }

  function findCandidate(candidates, code) {
    return candidates.find((item) => item.language.startsWith(code));
  }

  function applyHeuristicPriority(text, normalizedCandidates) {
    const priority = namespace.languageRulePriority || [];
    const rules = namespace.languageRules || {};

    for (const code of priority) {
      const rule = rules[code];
      if (!rule?.matcher) {
        continue;
      }

      const candidate = findCandidate(normalizedCandidates, code);
      const isLikely = rule.matcher(text);
      const minConfidence = rule.minConfidence ?? 5;

      if (candidate && (candidate.percentage >= minConfidence || isLikely)) {
        return namespace.MAPPED_LANGUAGE_CODES[code] || null;
      }

      if (isLikely && !candidate) {
        return namespace.MAPPED_LANGUAGE_CODES[code] || null;
      }
    }

    return null;
  }

  function applyDetectedOrder(normalizedCandidates) {
    for (const candidate of normalizedCandidates) {
      for (const supported of namespace.SUPPORTED_ORDER || []) {
        if (candidate.language.startsWith(supported)) {
          return namespace.MAPPED_LANGUAGE_CODES[supported] || null;
        }
      }
    }

    return null;
  }

  function applyHeuristicFallback(text) {
    const priority = namespace.languageRulePriority || [];
    const rules = namespace.languageRules || {};

    for (const code of priority) {
      const rule = rules[code];
      if (rule?.matcher && rule.matcher(text)) {
        return namespace.MAPPED_LANGUAGE_CODES[code] || null;
      }
    }

    return null;
  }

  function pickTargetLanguage(text, detectedLanguages) {
    const normalizedCandidates = normalizeCandidates(detectedLanguages);

    const heuristicFirst = applyHeuristicPriority(text, normalizedCandidates);
    if (heuristicFirst) {
      return heuristicFirst;
    }

    const detectedOrder = applyDetectedOrder(normalizedCandidates);
    if (detectedOrder) {
      return detectedOrder;
    }

    return applyHeuristicFallback(text);
  }

  namespace.pickTargetLanguage = pickTargetLanguage;
})(window.SelectionTTS);
