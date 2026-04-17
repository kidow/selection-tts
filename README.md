# Selection TTS

Selection TTS is a Manifest V3 Chrome extension that reads selected text aloud on ChatGPT and Gemini pages.

The extension is keyboard-first:

- Select text on the page
- Press `Command+X` (macOS) or `Ctrl+X` (Windows/Linux)
- The extension detects the language and plays speech with Web Speech API

No backend, no external TTS API, and no tracking.

## Features

- Keyboard shortcut trigger (`Cmd+X` / `Ctrl+X`)
- Automatic language detection via `chrome.i18n.detectLanguage`
- Language-specific voice preference and fallback selection
- Heuristic fallback for short phrases in supported languages
- Fast cancellation/restart behavior for repeated usage

## Supported Languages

- English (`en-US`)
- Japanese (`ja-JP`)
- Chinese (`zh-CN`)
- French (`fr-FR`)
- German (`de-DE`)
- Spanish (`es-ES`)
- Arabic (`ar-SA`)
- Russian (`ru-RU`)
- Portuguese (`pt-PT`)

## Project Structure

```text
selection-tts/
├── manifest.json
├── background.js
├── content.js
├── content/
│   ├── shared.js
│   ├── voiceProfiles.js
│   ├── speaker.js
│   └── language/
│       ├── detect.js
│       ├── pickTargetLanguage.js
│       └── rules/
│           ├── fr.js
│           ├── de.js
│           ├── es.js
│           ├── ar.js
│           ├── ru.js
│           └── pt.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## How It Works

1. User selects text in ChatGPT.
2. User presses `Cmd+X` / `Ctrl+X`.
3. Content script reads selection and calls `detectLanguage`.
4. Language picker combines:
   - detected language candidates
   - per-language heuristic rules for short/ambiguous phrases
5. Speaker module selects the best available browser voice and plays speech.

## Installation (Local)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project directory
5. Open `https://chatgpt.com` or `https://gemini.google.com/app`
6. Select text and press `Cmd+X` / `Ctrl+X`

## Development Notes

- This extension depends on voices installed and exposed by your OS/browser.
- Voice names differ by platform; fallback logic is included.
- If shortcut handling conflicts with another extension/app:
  - Open `chrome://extensions/shortcuts`
  - Reassign the extension shortcut

## Privacy

- No data collection
- No analytics
- No server communication for speech generation

## License

This project is currently maintained as a local development extension.
