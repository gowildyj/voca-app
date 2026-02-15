let preferredVoiceName = null;
let preferredGender = null;

export const configureTTS = () => {};

export const setPreferredVoiceName = (name) => {
  preferredVoiceName = name || null;
};

export const setPreferredGender = (gender) => {
  if (gender !== "female" && gender !== "male") preferredGender = null;
  else preferredGender = gender;
};

const browserSpeak = (text, langCode, opts = {}) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // 중복 재생 방지
  window.speechSynthesis.cancel();

  const play = () => {
    const utterance = new SpeechSynthesisUtterance(text);

    // 언어 코드가 있을 때만 설정 (없으면 브라우저 기본값)
    if (langCode) {
      utterance.lang = langCode;
    }

    const voices = window.speechSynthesis.getVoices();

    // 괴물 목소리 방지용 고품질 키워드
    const preferredNames = [
      "Google",
      "Microsoft",
      "Samantha",
      "Daniel",
      "Premium",
      "Natural",
      "Online",
      "Siri",
    ];

    let selectedVoice = null;

    if (voices && voices.length > 0) {
      // 1. 특정 이름 지정
      if (preferredVoiceName) {
        selectedVoice = voices.find((v) => v.name === preferredVoiceName);
      }

      // 2. 언어 코드에 맞는 고품질 목소리 찾기
      if (!selectedVoice && langCode) {
        // 해당 언어 코드를 가진 목소리 필터링
        const langVoices = voices.filter(
          (v) => v.lang && v.lang.replace("_", "-").startsWith(langCode),
        );

        if (langVoices.length > 0) {
          // 고품질 키워드 우선
          selectedVoice = langVoices.find((v) =>
            preferredNames.some((name) => v.name.includes(name)),
          );

          // 성별 선호도
          if (!selectedVoice && preferredGender) {
            const isFemale = (n) =>
              ["Female", "Samantha", "Joanna"].some((h) => n.includes(h));
            const isMale = (n) =>
              ["Male", "Daniel", "Jerome"].some((h) => n.includes(h));

            if (preferredGender === "female")
              selectedVoice = langVoices.find((v) => isFemale(v.name));
            else if (preferredGender === "male")
              selectedVoice = langVoices.find((v) => isMale(v.name));
          }

          // 없으면 해당 언어 첫 번째
          if (!selectedVoice) selectedVoice = langVoices[0];
        }
      }

      // 3. 언어 매칭 실패 시 전체 목록에서 고품질 찾기 (비상용)
      if (!selectedVoice) {
        selectedVoice = voices.find((v) =>
          preferredNames.some((n) => v.name.includes(n)),
        );
      }

      // 4. 최후의 수단
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
};
