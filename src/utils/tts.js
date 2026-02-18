const STORAGE_KEY_GENDER = "tts_preferred_gender";
let currentUtterance = null;

// 초기화: 저장된 설정이 있으면 불러오고, 없으면 'female'
let preferredGender =
  typeof window !== "undefined"
    ? localStorage.getItem(STORAGE_KEY_GENDER) || "female"
    : "female";

export const configureTTS = () => {};

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

// 여성 목소리 감지
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
    "Siri",
  ];
  return keywords.some((k) => name.includes(k));
};

// 남성 목소리 감지
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

// 목소리 선택 로직
const getBestVoice = (langCode) => {
  const voices = window.speechSynthesis.getVoices();

  if (!voices || voices.length === 0) {
    console.warn("[TTS] 로드된 목소리가 없습니다.");
    return null;
  }

  const normalizedLang = langCode?.replace("_", "-").toLowerCase();
  const baseLang = normalizedLang?.split("-")[0];

  // 1️⃣ 정확한 언어 매칭 (en-US)
  let langVoices = voices.filter(
    (v) => v.lang && v.lang.replace("_", "-").toLowerCase() === normalizedLang,
  );

  // 2️⃣ base language 매칭 (en)
  if (langVoices.length === 0 && baseLang) {
    langVoices = voices.filter(
      (v) =>
        v.lang && v.lang.replace("_", "-").toLowerCase().startsWith(baseLang),
    );
  }

  if (langVoices.length === 0) {
    console.warn(
      `[TTS] ${langCode} 언어에 맞는 목소리가 없습니다. 기본값 사용.`,
    );
    return voices[0] || null;
  }

  const highQualityNames = ["Google", "Premium", "Enhanced", "Natural", "Siri"];

  let selectedVoice = null;

  if (preferredGender) {
    selectedVoice = langVoices.find((v) => {
      const isHQ = highQualityNames.some((hq) => v.name.includes(hq));
      if (!isHQ) return false;
      return preferredGender === "female" ? isFemale(v.name) : isMale(v.name);
    });
  }

  if (!selectedVoice && preferredGender) {
    selectedVoice = langVoices.find((v) =>
      preferredGender === "female" ? isFemale(v.name) : isMale(v.name),
    );
  }

  if (!selectedVoice) {
    selectedVoice = langVoices.find((v) =>
      highQualityNames.some((hq) => v.name.includes(hq)),
    );
  }

  return selectedVoice || langVoices[0];
};

// 실제 말하기 함수 (Promise 반환 + 목소리 선택 적용)
export const speak = (text, lang = "en-US", rate = 1.0) => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || !text) {
      resolve();
      return;
    }

    // PC Chrome 대응: voices 강제 로드 트리거
    window.speechSynthesis.getVoices();

    window.speechSynthesis.cancel();

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;
    utterance.lang = lang;
    utterance.rate = rate;

    // 목소리 설정 로직 적용
    const setVoiceAndSpeak = () => {
      const selectedVoice = getBestVoice(lang);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(
          `[TTS] 선택된 목소리 (${preferredGender}):`,
          selectedVoice.name,
        );
      } else {
        console.log(`[TTS] 기본 목소리 사용 (선택된 것 없음)`);
      }

      window.speechSynthesis.speak(utterance);
    };

    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        setTimeout(trySpeak, 100);
        return;
      }
      setVoiceAndSpeak();
    };

    trySpeak();

    // 종료 처리
    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      if (e.error === "canceled" || e.error === "interrupted") {
        resolve();
        return;
      }
      console.error("[TTS] Error:", e);
      resolve();
    };

    setTimeout(() => resolve(), 3000);
  });
};

export default {
  speak,
  configureTTS,
  setPreferredGender,
  getPreferredGender,
};
