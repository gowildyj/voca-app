// src/utils/ttsUtils.js

let voices = [];
let voicesLoaded = false;
let voiceCache = {};

/**
 * 앱 시작 시 한번 실행
 */
export const initTTS = () => {
  if (!window.speechSynthesis) return;

  const loadVoices = () => {
    voices = window.speechSynthesis.getVoices();
    voicesLoaded = true;
  };

  loadVoices();

  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
};

/**
 * 언어 normalize
 */
const normalizeLang = (lang) => {
  return lang.toLowerCase().replace("_", "-");
};

/**
 * voice 품질 점수
 */
const scoreVoice = (voice) => {
  let score = 0;

  if (!voice.localService) score += 50;

  if (voice.name.includes("Google")) score += 40;
  if (voice.name.includes("Microsoft")) score += 35;
  if (voice.name.includes("Apple")) score += 30;

  if (voice.default) score += 10;

  return score;
};

/**
 * gender 추정
 */
const detectGender = (voice) => {
  const name = voice.name.toLowerCase();

  const femaleKeywords = [
    "female",
    "woman",
    "girl",
    "samantha",
    "victoria",
    "zira",
    "anna",
    "karen",
    "serena",
    "siri",
  ];

  const maleKeywords = [
    "male",
    "man",
    "david",
    "mark",
    "daniel",
    "alex",
    "fred",
  ];

  if (femaleKeywords.some((k) => name.includes(k))) return "female";
  if (maleKeywords.some((k) => name.includes(k))) return "male";

  return "unknown";
};

/**
 * 최고 voice 찾기
 */
export const getBestVoice = (langCode, preferredGender = "female") => {
  if (!voicesLoaded) return null;

  const cacheKey = `${langCode}_${preferredGender}`;

  if (voiceCache[cacheKey]) {
    return voiceCache[cacheKey];
  }

  const normalized = normalizeLang(langCode);

  const filtered = voices.filter((v) =>
    normalizeLang(v.lang).startsWith(normalized.split("-")[0]),
  );

  if (!filtered.length) return voices[0];

  // 성별 필터
  let candidates = filtered;

  if (preferredGender) {
    const genderMatches = filtered.filter(
      (v) => detectGender(v) === preferredGender,
    );

    if (genderMatches.length) {
      candidates = genderMatches;
    }
  }

  // 품질 점수 정렬
  candidates.sort((a, b) => scoreVoice(b) - scoreVoice(a));

  const best = candidates[0];

  voiceCache[cacheKey] = best;

  return best;
};

/**
 * 텍스트 발음
 */
export const playText = (text, langCode = "en-US", options = {}) => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      console.error("TTS not supported");
      resolve();
      return;
    }

    if (!text) {
      resolve();
      return;
    }

    const { gender = "female", rate = 1.0, pitch = 1.0 } = options;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voice = getBestVoice(langCode, gender);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = langCode;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = () => {
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * TTS 정지
 */
export const stopTTS = () => {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();
};
