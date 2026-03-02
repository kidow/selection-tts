window.SelectionTTS = window.SelectionTTS || {};

(function setupLanguageDetectModule(namespace) {
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

  namespace.detectLanguages = detectLanguages;
})(window.SelectionTTS);
