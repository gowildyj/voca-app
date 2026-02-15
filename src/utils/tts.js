// src/utils/tts.js

let provider = "browser"; // 'browser' | 'hf'
let hfConfig = {
  apiKey: null,
  model: "facebook/fastspeech2-en-ljspeech", // override if you want a different model
};

// Optional preferences for browser voice selection
let preferredVoiceName = null; // exact voice name to prefer
let preferredGender = null; // 'female' | 'male' | null

export const configureTTS = ({
  provider: p = "browser",
  hfApiKey = null,
  hfModel = null,
} = {}) => {
  provider = p;
  if (hfApiKey) hfConfig.apiKey = hfApiKey;
  if (hfModel) hfConfig.model = hfModel;
};

export const setPreferredVoiceName = (name) => {
  preferredVoiceName = name || null;
};

export const setPreferredGender = (gender) => {
  if (gender !== "female" && gender !== "male") preferredGender = null;
  else preferredGender = gender;
};

const browserSpeak = (text, langCode, opts = {}) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // 기존 발화 취소 (중복 재생 방지)
  window.speechSynthesis.cancel();

  const play = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (langCode) utterance.lang = langCode;

    const voices = window.speechSynthesis.getVoices();

    // ✅ [핵심 수정] 고품질 목소리 우선순위 키워드
    // 이 키워드들이 포함된 목소리를 우선적으로 찾습니다.
    const preferredNames = [
      "Google", // Chrome/Android 고품질
      "Microsoft", // Edge/Windows 고품질
      "Samantha", // macOS Siri 여성
      "Daniel", // macOS Siri 남성
      "Premium", // 모바일 고품질
      "Natural", // 자연스러운 목소리 표기
      "Online", // 온라인 음성
    ];

    let selectedVoice = null;

    if (voices && voices.length > 0) {
      // 1. 특정 목소리 이름이 지정된 경우 최우선 선택
      if (preferredVoiceName) {
        selectedVoice = voices.find((v) => v.name === preferredVoiceName);
      }

      // 2. 언어 코드가 지정된 경우의 로직 (괴물 목소리 방지 핵심)
      if (!selectedVoice && langCode) {
        // 2-1. 해당 언어 코드를 가진 목소리들만 필터링
        // (ex: 'en-US' -> Google US English, Samantha, Fred, Zarvox 등)
        const langVoices = voices.filter(
          (v) => v.lang && v.lang.replace("_", "-").startsWith(langCode),
        );

        if (langVoices.length > 0) {
          // 2-2. 필터링된 목록 중에서 '고품질 키워드'가 포함된 목소리를 찾음
          selectedVoice = langVoices.find((v) =>
            preferredNames.some((name) => v.name.includes(name)),
          );

          // 2-3. 고품질 목소리를 못 찾았으면, 성별 선호도라도 맞춤
          if (!selectedVoice && preferredGender) {
            const isFemale = (n) =>
              ["Female", "Samantha", "Joanna", "Google UK English Female"].some(
                (h) => n.includes(h),
              );
            const isMale = (n) =>
              ["Male", "Daniel", "Google UK English Male"].some((h) =>
                n.includes(h),
              );

            if (preferredGender === "female")
              selectedVoice = langVoices.find((v) => isFemale(v.name));
            else if (preferredGender === "male")
              selectedVoice = langVoices.find((v) => isMale(v.name));
          }

          // 2-4. 그래도 없으면 해당 언어의 첫 번째 목소리 사용
          if (!selectedVoice) {
            selectedVoice = langVoices[0];
          }
        }
      }

      // 3. 언어 코드가 없거나, 위에서 못 찾은 경우 전체 목록에서 고품질 검색
      if (!selectedVoice) {
        selectedVoice = voices.find((v) =>
          preferredNames.some(
            (n) => v.name.includes(n) || (v.voiceURI || "").includes(n),
          ),
        );
      }

      // 4. 최후의 수단: 목록의 첫 번째
      if (!selectedVoice) selectedVoice = voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      // console.log(`[TTS] Selected Voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    }

    utterance.rate = opts.rate ?? 1.0;
    utterance.pitch = opts.pitch ?? 1.0;

    // 브라우저 호환성: resume() 호출 후 speak()
    try {
      window.speechSynthesis.resume();
    } catch (e) {}
    window.speechSynthesis.speak(utterance);
  };

  // 목소리 목록 로드 대기 처리
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      play();
    };
  } else {
    setTimeout(play, 10);
  }
};

const hfSpeak = async (text) => {
  // Note: Exposing API keys in frontend is insecure for production.
  if (!hfConfig.apiKey || !hfConfig.model)
    throw new Error("HF TTS not configured");

  const url = `https://api-inference.huggingface.co/models/${hfConfig.model}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfConfig.apiKey}`,
      Accept: "audio/wav",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HF TTS error: ${res.status} ${txt}`);
  }

  const buffer = await res.arrayBuffer();
  const blob = new Blob([buffer], { type: "audio/wav" });
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);
  audio.play().finally(() => {
    setTimeout(() => URL.revokeObjectURL(audioUrl), 2000);
  });
};

export const speak = async (text, langCode = null, opts = {}) => {
  if (!text) return;

  if (provider === "hf") {
    try {
      await hfSpeak(text);
      return;
    } catch (e) {
      console.warn("HF TTS failed, falling back to browser TTS:", e);
      browserSpeak(text, langCode, opts);
      return;
    }
  }

  // default: browser
  browserSpeak(text, langCode, opts);
};

export default { speak, configureTTS };
