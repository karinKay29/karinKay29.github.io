// 1. 사용자가 선택한 언어를 저장할 때 쓸 키 이름
const STORAGE_KEY = "portfolio_lang";
// 2. 기본 언어 (아무것도 저장 안 돼 있으면 일본어부터 시작)
const DEFAULT_LANG = "ja";

// 3. 번역 데이터(JSON)를 담아둘 변수
let dictionary = {};

// 4. 번역 함수 (translate)
// fallback = 대체값. 찾는 키가 없으면 이 값을 반환.
// 지금은 기본값을 빈 문자열("")로 설정.
function translate(key, fallback = "") {
  // "home.catch" → ["home","catch"]
  const parts = key.split(".");
  let current = dictionary;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // 현재 위치가 객체가 아니거나, 키가 없으면 fallback 반환
    if (current == null || typeof current !== "object" || !(part in current)) {
      return fallback;
    }

    // 한 단계 아래로 내려가기
    current = current[part];
  }

  // 끝까지 찾았으면 최종 값 반환
  return current;
}

// HTML의 [data-i18n] 요소들을 찾아서 번역 텍스트로 바꿔주기
function applyTexts() {
  // 모든 data-i18n 요소 반복
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = translate(key, el.textContent);
  });
}

// 언어별 JSON을 불러와서 dictionary에 넣고 화면 갱신
async function loadDictionary(lang) {
  // 1) JSON 가져오기 (개발 중 캐시 방지용 쿼리 붙임)
  const res = await fetch(`/i18n/${lang}.json?v=2025-09-22`);
  if (!res.ok) {
    throw new Error(`i18n load failed: ${lang}`);
  }

  // 2) 파싱 → 전역 dictionary에 저장
  dictionary = await res.json();

  // 3) 문서 언어 설정 (접근성)
  document.documentElement.lang = lang;

  // 4) 번역 적용 (앞에서 만든 applyTexts 사용)
  applyTexts();
  //   applyLists?.();
  //   applyCards?.();

  syncLanguageUI(lang);
}

// 사용자가 언어를 선택했을 때: 저장하고 불러와서 화면 갱신
function setLanguage(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
  loadDictionary(lang);
}

// 페이지가 처음 로드될 때: 저장된 언어로 시작하고, 버튼 클릭 연결
document.addEventListener("DOMContentLoaded", () => {
  // 1) 이전에 선택한 언어 불러오기 (없으면 기본 'ja')
  const savedLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

  // 2) 저장된 언어로 JSON 로드 → 화면에 적용
  loadDictionary(savedLang);

  // 3) 모든 언어 버튼에 클릭 이벤트 연결
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.lang); // data-lang="ja|en"
    });
  });
});

function syncLanguageUI(lang) {
  // 루트에 현재 언어 기록
  const normalized = String(lang).trim().toLowerCase();
  document.documentElement.lang = normalized;
  document.documentElement.setAttribute("data-lang", normalized);

  // 모든 버튼 상태 동기화
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const val = String(btn.dataset.lang || "")
      .trim()
      .toLowerCase();
    const isActive = val === normalized;

    // aria-pressed는 "true"/"false" 문자열이어야 CSS가 잡음
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");

    // 선택된 것만 disabled, 나머지는 반드시 enable
    if (isActive) btn.setAttribute("disabled", "");
    else btn.removeAttribute("disabled");
  });
}
