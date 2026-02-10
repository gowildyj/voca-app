// utils/tts.js

export const speak = (text, deckName = "") => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // 1. 현재 재생 중인 모든 음성을 즉시 중단 (중첩 방지)
  window.speechSynthesis.cancel();

  // 2. 언어 코드 설정
  let langCode = "en-US";
  if (deckName.includes("프랑스")) langCode = "fr-FR";
  else if (deckName.includes("스페인")) langCode = "es-ES";
  else if (deckName.includes("영어")) langCode = "en-US";
  else if (deckName.includes("한국")) langCode = "ko-KR";

  const play = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;

    // 브라우저에서 사용 가능한 음성 목록 가져오기
    const voices = window.speechSynthesis.getVoices();

    // ✅ 복잡한 필터링 없이 해당 언어의 첫 번째 음성을 바로 선택
    const selectedVoice = voices.find((v) => v.lang.startsWith(langCode));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      // console.log(`🎙 재생 음성: [${selectedVoice.name}] | 텍스트: "${text}"`);
    }

    // 재생 설정 (가장 표준적인 값)
    utterance.rate = 1.0; // 속도 1.0 (표준)
    utterance.pitch = 1.0; // 피치 1.0 (표준)

    // 사파리/크롬 버그 방지용 resume 호출 후 재생
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  };

  // ✅ 브라우저 엔진 준비 상태에 따라 실행
  // 목록이 비어있으면 로드될 때까지 기다리고, 있으면 바로 실행
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null; // 중복 실행 방지
      play();
    };
  } else {
    // 아주 미세한 지연을 주어 cancel()이 완전히 처리된 후 실행되게 함
    setTimeout(play, 10);
  }
};
