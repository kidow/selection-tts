# 토스트 UI 구현 계획 (한국어 언어 표기)

## 목표
선택 텍스트를 TTS로 재생할 때, 상단 토스트로 **실행 언어를 한국어로 표시**합니다.

- 영어 재생 시: `발음 언어: 영어`
- 일본어 재생 시: `발음 언어: 일본어`

## 현재 구조 요약
- `content.js`에서 선택 텍스트를 읽고 언어 감지/선정 후 `namespace.speak(...)`를 호출합니다.
- `content/voiceProfiles.js`에서 지원 언어 코드(`en-US`, `ja-JP` 등)를 관리합니다.
- `manifest.json`에서 content script 로드 순서를 관리합니다.

## 구현 범위

### 1) 토스트 모듈 추가
신규 파일 `content/toast.js`를 추가합니다.

구현 포인트:
- `window.SelectionTTS.showToast(message, options)` 함수 제공
- 토스트 DOM 1회 생성 후 재사용 (중복 방지)
- 상단 중앙 고정 배치 (`position: fixed; top: 16px; left: 50%; transform: translateX(-50%)`)
- 높은 `z-index`로 화면 상단에 안정 노출
- 자동 닫힘 타이머(예: 1.6초), 연속 호출 시 타이머 초기화

### 2) 언어 코드 → 한국어 라벨 매핑
`content/voiceProfiles.js` 또는 공용 상수 파일에 한국어 표시명 맵을 추가합니다.

예시:
- `en-US: 영어`
- `ja-JP: 일본어`
- `zh-CN: 중국어`
- `fr-FR: 프랑스어`
- `de-DE: 독일어`
- `es-ES: 스페인어`
- `ar-SA: 아랍어`
- `ru-RU: 러시아어`
- `pt-PT: 포르투갈어`

보조 함수:
- `getLanguageLabelKo(languageCode)`
- 매핑 누락 시 fallback 문자열 제공 (`언어(${languageCode})`)

### 3) 실행 흐름에 토스트 연결
`content.js`의 언어 확정 시점에서 토스트를 표시합니다.

권장 동작:
1. 텍스트 선택 확인
2. 언어 감지/선정
3. `targetLanguage`가 있으면 `발음 언어: {한국어명}` 토스트 출력
4. `namespace.speak(selectedText, targetLanguage)` 실행

선택 동작:
- `targetLanguage`가 없을 때 안내 토스트 노출 여부는 UX 정책에 따라 결정

### 4) content script 로드 순서 반영
`manifest.json`에서 `content/toast.js`가 `content.js`보다 먼저 로드되도록 추가합니다.

## UX 세부 가이드
- 단축키 연타 시 토스트가 겹치지 않도록 단일 인스턴스 사용
- 너무 튀지 않되 가독성 높은 스타일 적용 (반투명 배경 + 흰색 텍스트)
- 사라지는 시간은 짧게 유지(1.5~2초)

## 테스트 체크리스트
- 영어 문장 선택 후 단축키 실행 시 `발음 언어: 영어` 표기
- 일본어 문장 선택 후 단축키 실행 시 `발음 언어: 일본어` 표기
- 연속 실행 시 이전 토스트가 자연스럽게 갱신되는지 확인
- ChatGPT 페이지 UI 위로 토스트가 가려지지 않는지 확인

## 추후 확장 아이디어
- 다국어 UI 전환을 위해 `LABELS_BY_LOCALE` 구조로 확장
- 토스트에 감지 신뢰도(%)를 디버그 모드에서만 표시
