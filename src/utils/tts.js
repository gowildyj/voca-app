export const speak = (text, langCode) => {
  if (!langCode || typeof window === "undefined" || !window.speechSynthesis)
    return;
  window.speechSynthesis.cancel();

  const play = () => {
    const utterance = new SpeechSynthesisUtterance(text);

    // ✅ 전달받은 langCode를 즉시 적용 (예: "fr-FR")
    utterance.lang = langCode;

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find((v) => v.lang.startsWith(langCode));

    if (selectedVoice) utterance.voice = selectedVoice;

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
