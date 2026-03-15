// src/utils/ttsUtils.js

let voices = [];
let voicesLoaded = false;
let voiceCache = {};

export const initTTS = () => {
  if (!window.speechSynthesis) return;

  const loadVoices = () => {
    voices = window.speechSynthesis.getVoices();
    voicesLoaded = true;
    voiceCache = {};
  };

  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  loadVoices();
};

/**
 * [운영급 품질 점수 체계]
 * 1. Network/Premium Voice (Remote) 인가? (가장 중요)
 * 2. 신뢰할 수 있는 제조사 엔진인가?
 * 3. 시스템 기본값인가?
 */
/**
 * [운영급 품질 점수 체계 - 최종]
 */
const scoreVoice = (voice, targetLang) => {
  let score = 0;

  const vLang = voice.lang.toLowerCase().replace("_", "-");
  const vName = voice.name.toLowerCase();

  // 1. 언어+국가 완전 일치 혹은 광둥어 별칭 인정 (+100점)
  // 사파리의 yue-hk와 우리의 zh-hk를 매칭시켜주는 핵심 로직입니다.
  const isExactMatch = vLang === targetLang;
  const isCantoneseAlias = targetLang === "zh-hk" && vLang === "yue-hk";

  if (isExactMatch || isCantoneseAlias) {
    score += 100;
  }

  // 2. 프리미엄/원격 엔진 가산점 (+50점)
  // 구글 크롬 등에서 고품질 보이스를 우선 선택하게 합니다.
  if (!voice.localService) {
    score += 50;
  }

  // 3. 향상된 품질 키워드 가산점 (+20점)
  if (vName.includes("natural") || vName.includes("premium")) {
    score += 20;
  }

  if (vName.includes("mónica") || vName.includes("monica")) {
    score += 50;
  }

  // 5. 제조사 가산점 (필요시 주석 해제하여 사용 가능)
  // if (voice.name.includes("Google")) score += 40;
  // if (voice.name.includes("Apple")) score += 30;

  // 6. 시스템 기본값 가산점 (+10점)
  if (voice.default) {
    score += 10;
  }

  return score;
};

/**
 * 전문가형 보이스 선별 로직
 */
export const getBestVoice = (langCode) => {
  if (!voicesLoaded || voices.length === 0) return null;

  if (voiceCache[langCode]) return voiceCache[langCode];

  const normalized = langCode.toLowerCase().replace("_", "-");
  const langBase = normalized.split("-")[0];

  let searchBases = [langBase];
  if (langBase === "fil" || langBase === "tl") {
    searchBases = ["fil", "tl"];
  }

  if (normalized === "zh-hk" || langBase === "yue") {
    searchBases = ["zh", "yue"];
  }

  // 후보군 필터링 (최소한 같은 언어 가족)
  let candidates = voices.filter((v) => {
    const vLang = v.lang.toLowerCase().replace("_", "-");
    return searchBases.some((base) => vLang.startsWith(base));
  });

  if (candidates.length === 0) {
    console.warn(`[TTS] No matching voice for ${langCode}. Using default.`);
    return voices[0];
  }

  // 품질 기반 정렬
  candidates.sort(
    (a, b) => scoreVoice(b, normalized) - scoreVoice(a, normalized),
  );

  const best = candidates[0];
  voiceCache[langCode] = best;

  // getBestVoice 함수 내부 정렬 직전
  console.group(`[Expert TTS] Selecting for: ${langCode}`);
  const debugList = candidates
    .map((v) => ({
      name: v.name,
      lang: v.lang,
      score: scoreVoice(v, normalized),
      engine: v.localService ? "Local(Offline)" : "Network(Online)",
    }))
    .sort((a, b) => b.score - a.score);

  console.table(debugList);
  console.groupEnd();

  return best;
};

/**
 * 텍스트 발음 (핵심 로직 단순화)
 */
export const playText = (text, langCode = "en-US", options = {}) => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || !text) return resolve();

    const { rate = 1.0, pitch = 1.0 } = options;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getBestVoice(langCode);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = langCode;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
};

export const stopTTS = () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
};
