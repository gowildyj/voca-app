// src/utils/tts.js

const STORAGE_KEY_GENDER = "tts_preferred_gender";
let preferredVoiceName = null;

// 초기화: 저장된 설정이 있으면 불러오고, 없으면 'female'
let preferredGender =
  typeof window !== "undefined"
    ? localStorage.getItem(STORAGE_KEY_GENDER) || "female"
    : "female";

export const configureTTS = () => {};

export const setPreferredVoiceName = (name) => {
  preferredVoiceName = name || null;
};

// 성별 설정 저장 함수
export const setPreferredGender = (gender) => {
  if (gender === "female" || gender === "male") {
    preferredGender = gender;
    localStorage.setItem(STORAGE_KEY_GENDER, gender);
    console.log(`[TTS] Gender preference set to: ${gender}`);
  } else {
    preferredGender = null;
    localStorage.removeItem(STORAGE_KEY_GENDER);
  }
};

export const getPreferredGender = () => preferredGender;

// ✅ 헬퍼 함수: 여성 목소리 감지
const isFemale = (name) => {
  if (!name) return false;
  const keywords = [
    "Female",
    "Samantha",
    "Monica",
    "Paulina",
    "Yuri",
    "Zira",
    "Google UK English Female",
    "Google US English Female",
    "Helena",
  ];
  return keywords.some((k) => name.includes(k));
};

// ✅ 헬퍼 함수: 남성 목소리 감지 (추가됨)
const isMale = (name) => {
  if (!name) return false;
  const keywords = [
    "Male",
    "Daniel",
    "David",
    "Mark",
    "George",
    "Rishi",
    "Google UK English Male",
    "Google US English Male",
    "Pablo",
    "Stefan",
  ];
  return keywords.some((k) => name.includes(k));
};

const browserSpeak = (text, langCode, opts = {}) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const play = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (langCode) {
      utterance.lang = langCode;
    }

    const voices = window.speechSynthesis.getVoices();

    // 고품질 목소리 키워드
    const preferredNames = [
      "Google",
      "Microsoft",
      "Samantha",
      "Daniel",
      "Monica",
      "Paulina",
      "Premium",
      "Natural",
      "Online",
      "Siri",
    ];

    let selectedVoice = null;

    if (voices && voices.length > 0) {
      // 1. 특정 이름 지정 시 최우선
      if (preferredVoiceName) {
        selectedVoice = voices.find((v) => v.name === preferredVoiceName);
      }

      // 2. 언어 코드에 맞는 목소리 찾기
      if (!selectedVoice && langCode) {
        const langVoices = voices.filter(
          (v) => v.lang && v.lang.replace("_", "-").startsWith(langCode),
        );

        if (langVoices.length > 0) {
          // 우선순위 1: [고품질]이면서 + [선호 성별]인 목소리
          if (preferredGender) {
            selectedVoice = langVoices.find((v) => {
              const isHighQuality = preferredNames.some((name) =>
                v.name.includes(name),
              );
              if (!isHighQuality) return false;

              if (preferredGender === "female") return isFemale(v.name);
              if (preferredGender === "male") return isMale(v.name);
              return false;
            });
          }

          // 우선순위 2: [고품질] 목소리 (성별 무관, 고품질이 우선)
          if (!selectedVoice) {
            selectedVoice = langVoices.find((v) =>
              preferredNames.some((name) => v.name.includes(name)),
            );
          }

          // 우선순위 3: [선호 성별] 일반 목소리 (품질이 낮더라도 성별 맞춤)
          if (!selectedVoice && preferredGender) {
            if (preferredGender === "female") {
              selectedVoice = langVoices.find((v) => isFemale(v.name));
            } else if (preferredGender === "male") {
              // isMale로 찾거나, 명시적이지 않더라도 'Female'이 아닌 것을 찾음 (Google US English 등)
              selectedVoice = langVoices.find((v) => isMale(v.name));
              if (!selectedVoice) {
                // isMale 키워드에 없지만 남성일 확률이 높은 경우 (Female이 아닌 경우) fallback
                selectedVoice = langVoices.find((v) => !isFemale(v.name));
              }
            }
          }

          // 최후의 수단: 그냥 첫 번째
          if (!selectedVoice) {
            selectedVoice = langVoices[0];
          }
        }
      }

      // 3. 언어 매칭 실패 시 전체 목록에서 고품질 찾기
      if (!selectedVoice) {
        selectedVoice = voices.find((v) =>
          preferredNames.some((n) => v.name.includes(n)),
        );
      }

      // 4. Fallback
      if (!selectedVoice) selectedVoice = voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = opts.rate ?? 1.0;
    utterance.pitch = opts.pitch ?? 1.0;

    try {
      window.speechSynthesis.resume();
    } catch (e) {}
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      play();
    };
  } else {
    setTimeout(play, 10);
  }
};

export const speak = async (text, langCode = null, opts = {}) => {
  if (!text) return;
  browserSpeak(text, langCode, opts);
};

export default {
  speak,
  configureTTS,
  setPreferredVoiceName,
  setPreferredGender,
  getPreferredGender,
};
