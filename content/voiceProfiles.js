window.SelectionTTS = window.SelectionTTS || {};

window.SelectionTTS.PREFERRED_VOICE_NAMES_BY_LANGUAGE = {
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
  pt: [
    "Google português do Brasil",
    "Google português",
    "Joana",
    "Luciana",
    "Microsoft Fernanda Online (Natural) - Portuguese (Brazil)",
  ],
};

window.SelectionTTS.SUPPORTED_ORDER = [
  "en",
  "ja",
  "zh",
  "fr",
  "de",
  "es",
  "ar",
  "ru",
  "pt",
];

window.SelectionTTS.MAPPED_LANGUAGE_CODES = {
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  ar: "ar-SA",
  ru: "ru-RU",
  pt: "pt-PT",
};

window.SelectionTTS.LANGUAGE_LABELS_KO = {
  "en-US": "영어",
  "ja-JP": "일본어",
  "zh-CN": "중국어",
  "fr-FR": "프랑스어",
  "de-DE": "독일어",
  "es-ES": "스페인어",
  "ar-SA": "아랍어",
  "ru-RU": "러시아어",
  "pt-PT": "포르투갈어",
};

window.SelectionTTS.getLanguageLabelKo = function getLanguageLabelKo(languageCode) {
  if (!languageCode) {
    return "언어(알 수 없음)";
  }

  return (
    window.SelectionTTS.LANGUAGE_LABELS_KO[languageCode] ||
    `언어(${languageCode})`
  );
};
