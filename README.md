# Selection TTS (English First) — Chrome Extension Implementation Plan

## 1. Project Overview

**Goal**
Create a Chrome Extension (Manifest V3) that:

- Allows users to select text on a page (initial target: ChatGPT page)
- Right-click → "Speak selection"
- Plays the selected text in English (en-US) using Web Speech API
- Free (no external API, no backend)

**Version Strategy**

- v0.1.0 → English only
- v0.2.0 → Multi-language submenu
- v0.3.0 → Language preference persistence
- v0.4.0 → Rate / pitch control

---

## 2. Technical Architecture

### Core Stack

- Chrome Extension (Manifest V3)
- Context Menu API
- Content Script
- Web Speech API (`speechSynthesis`)
- No server
- No external dependency

### Runtime Flow

1. User selects text
2. User right-clicks
3. Clicks "Speak selection"
4. Background service worker receives event
5. Background sends message to active tab
6. Content script executes TTS
7. Speech plays in English

---

## 3. Directory Structure

```
selection-tts/
│
├── manifest.json
├── background.js
├── content.js
├── icons/
│   └── icon128.png
└── README.md
```

---

## 4. Manifest Configuration (MV3)

### manifest.json

```json
{
  "manifest_version": 3,
  "name": "Selection TTS",
  "version": "0.1.0",
  "description": "Speak selected text in English via context menu.",
  "permissions": ["contextMenus", "activeTab"],
  "host_permissions": ["https://chatgpt.com/*"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://chatgpt.com/*"],
      "js": ["content.js"]
    }
  ]
}
```

---

## 5. Context Menu Setup

### background.js

Responsibilities:

- Create context menu on install
- Listen for click events
- Send selected text to content script

```js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "speak-selection",
    title: "Speak selection (English)",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "speak-selection") return;
  if (!info.selectionText || !tab?.id) return;

  chrome.tabs.sendMessage(tab.id, {
    type: "SPEAK_SELECTION",
    text: info.selectionText,
  });
});
```

---

## 6. Text-to-Speech Execution

### content.js

Responsibilities:

- Receive message
- Cancel previous speech
- Play new utterance in English

```js
function speak(text) {
  if (!text?.trim()) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = "en-US";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "SPEAK_SELECTION") {
    speak(message.text);
  }
});
```

---

## 7. Browser Voice Dependency (Important)

Web Speech API relies on:

- OS-installed voices
- Browser voice availability

Potential behavior:

- If en-US voice exists → native English voice
- If not → fallback voice

For stricter control (future version):

```
speechSynthesis.getVoices()
```

Select voice manually by matching:

```
voice.lang === "en-US"
```

---

## 8. Testing Plan

### Local Development

1. Go to: chrome://extensions
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select project folder
5. Open https://chatgpt.com
6. Select text
7. Right-click → Speak selection

### Edge Case Tests

- Long paragraphs
- Multiple rapid clicks
- Selecting empty string
- Switching tabs mid-speech

---

## 9. Known Constraints

- TTS quality depends on user OS
- Cannot guarantee identical pronunciation across systems
- CSP on some sites may require host permission adjustments
- Web Speech API may behave slightly differently across browsers

---

## 10. Future Roadmap

### v0.2.0 — Multi-language Support

- Add submenu
- Add language mapping:
  - en-US
  - de-DE
  - ja-JP
  - fr-FR

### v0.3.0 — Language Preference

- chrome.storage.sync
- Default language setting

### v0.4.0 — Controls

- Rate control
- Pitch control
- Repeat mode
- Sentence splitting by punctuation

---

## 11. README Skeleton

### What it does

Right-click selected text → Speak in English.

### Why

Lightweight pronunciation learning tool for ChatGPT users.

### Permissions

- contextMenus
- activeTab

### No Data Collection

- No tracking
- No server
- No analytics

---

## 12. Versioning Strategy

- 0.x until Chrome Web Store release
- Semantic versioning
- Clean commit structure:
  - feat: context menu TTS
  - chore: manifest config
  - refactor: voice selection logic

---

## 13. Release Considerations

Before Chrome Web Store:

- Add 128px icon
- Add privacy policy (even if empty data usage)
- Provide screenshots
- Increase host scope to "<all_urls>" if expanding beyond ChatGPT

---

## 14. Implementation Status Checklist

- [ ] Create repository
- [ ] Add manifest.json
- [ ] Implement background.js
- [ ] Implement content.js
- [ ] Load unpacked extension
- [ ] Validate TTS playback
- [ ] Commit v0.1.0

---

## Final Objective

Deliver a minimal, stable, English-only TTS context-menu extension
→ Then iterate into a multilingual pronunciation tool.
