# Selection TTS (영어 우선) — Chrome Extension 구현 계획

## 1. 프로젝트 개요

**목표**
다음 기능을 제공하는 Chrome Extension(Manifest V3)을 만든다.

- 웹페이지에서 텍스트를 선택할 수 있어야 한다(초기 대상: ChatGPT 페이지)
- 우클릭 메뉴에서 `Speak selection`을 실행할 수 있어야 한다
- 선택한 텍스트를 Web Speech API로 영어(`en-US`) 음성 재생해야 한다
- 무료로 동작해야 하며(외부 API, 백엔드 없음) 로컬 브라우저 기능만 사용한다

**버전 전략**

- `v0.1.0`: 영어 단일 지원
- `v0.2.0`: 다국어 서브메뉴 추가
- `v0.3.0`: 언어 설정 저장
- `v0.4.0`: 속도(rate) / 피치(pitch) 제어

---

## 2. 기술 아키텍처

### 핵심 스택

- Chrome Extension (Manifest V3)
- Context Menu API
- Content Script
- Web Speech API (`speechSynthesis`)
- 서버 없음
- 외부 의존성 없음

### 런타임 동작 흐름

1. 사용자가 텍스트를 선택한다
2. 사용자가 마우스 우클릭을 한다
3. `Speak selection` 메뉴를 클릭한다
4. Background Service Worker가 클릭 이벤트를 받는다
5. Background가 활성 탭의 Content Script에 메시지를 보낸다
6. Content Script가 TTS를 실행한다
7. 영어 음성이 재생된다

---

## 3. 디렉터리 구조

```text
selection-tts/
│
├── icon.png                 # 임시 원본 아이콘(사용자 제공)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json
├── background.js
├── content.js
└── README.md
```

---

## 4. Manifest 설정 (MV3)

### manifest.json

```json
{
  "manifest_version": 3,
  "name": "Selection TTS",
  "version": "0.1.0",
  "description": "Speak selected text in English via context menu.",
  "permissions": ["contextMenus", "activeTab"],
  "host_permissions": ["https://chatgpt.com/*"],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_title": "Selection TTS",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
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

### icon.png 사용 방법 (임시 아이콘 적용)

현재 루트에 있는 `icon.png`를 원본으로 두고, 확장 프로그램에서 요구하는 크기별 아이콘을 생성해 사용한다.

1. `icons` 디렉터리를 만든다.
2. `icon.png`를 `16x16`, `48x48`, `128x128`으로 리사이즈해 `icons/`에 저장한다.
3. 위 `manifest.json`의 `icons` 및 `action.default_icon` 경로를 그대로 사용한다.
4. `chrome://extensions`에서 확장 프로그램을 새로고침해 아이콘 적용 여부를 확인한다.

macOS 예시 명령어:

```bash
mkdir -p icons
sips -z 16 16 icon.png --out icons/icon16.png
sips -z 48 48 icon.png --out icons/icon48.png
sips -z 128 128 icon.png --out icons/icon128.png
```

---

## 5. 컨텍스트 메뉴 구성

### background.js

역할:

- 확장 프로그램 설치 시 우클릭 메뉴 생성
- 메뉴 클릭 이벤트 수신
- 선택 텍스트를 Content Script로 전달

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

## 6. TTS 실행 로직

### content.js

역할:

- Background 메시지 수신
- 기존 재생 중 음성 취소
- 새 영어 발화 재생

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

## 7. 브라우저 음성 의존성 (중요)

Web Speech API는 아래 요소에 의존한다.

- OS에 설치된 음성(voice)
- 브라우저에서 사용 가능한 음성 목록

예상 동작:

- `en-US` 음성이 있으면 해당 음성으로 재생
- 없으면 브라우저/OS 기본 fallback 음성으로 재생

향후 버전에서 음성을 더 엄격하게 고정하려면:

```js
speechSynthesis.getVoices();
```

아래 조건으로 직접 선택한다:

```js
voice.lang === "en-US";
```

---

## 8. 테스트 계획

### 로컬 개발 테스트

1. `chrome://extensions`로 이동
2. Developer Mode 활성화
3. `Load unpacked` 클릭
4. 프로젝트 폴더 선택
5. `https://chatgpt.com` 열기
6. 텍스트 선택
7. 우클릭 후 `Speak selection` 실행

### 엣지 케이스 테스트

- 긴 문단 선택 후 재생
- 매우 빠른 연속 클릭
- 빈 문자열(실질적으로 선택 없음)
- 재생 중 탭 전환

---

## 9. 알려진 제약사항

- TTS 품질은 사용자 OS 음성 엔진에 좌우된다
- 시스템마다 발음/억양의 일관성을 보장할 수 없다
- 일부 사이트 CSP 정책으로 host permission 조정이 필요할 수 있다
- 브라우저별 Web Speech API 동작이 미세하게 다를 수 있다

---

## 10. 향후 로드맵

### v0.2.0 — 다국어 지원

- 서브메뉴 추가
- 언어 매핑 추가:
  - `en-US`
  - `de-DE`
  - `ja-JP`
  - `fr-FR`

### v0.3.0 — 언어 설정 저장

- `chrome.storage.sync` 적용
- 기본 언어 설정 저장

### v0.4.0 — 재생 제어 기능

- 속도(rate) 조절
- 피치(pitch) 조절
- 반복 재생 모드
- 문장부호 기준 문장 분리 재생

---

## 11. README 기본 구성안

### 무엇을 하는가

선택한 텍스트를 우클릭하면 영어로 읽어준다.

### 왜 필요한가

ChatGPT 사용자에게 가벼운 발음 학습 보조 도구를 제공하기 위함.

### 권한

- contextMenus
- activeTab

### 데이터 수집 없음

- 추적 없음
- 서버 없음
- 분석 수집 없음

---

## 12. 버전 관리 전략

- Chrome Web Store 출시 전까지 `0.x` 유지
- 시맨틱 버저닝(Semantic Versioning) 적용
- 명확한 커밋 구조 유지:
  - `feat: context menu tts`
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
