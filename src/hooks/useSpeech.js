import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

/**
 * 단어 및 문장을 음성으로 읽어주는 TTS(Text-to-Speech) 공통 훅
 */
export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const synthRef = useRef(null);

  // 초기화: Web Speech API 지원 여부 확인
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    } else {
      setSupported(false);
      console.error("이 브라우저는 Web Speech API를 지원하지 않습니다.");
    }

    // 컴포넌트 언마운트 시 음성 중지 (메모리 누수 방지)
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  /**
   * 해당 언어에 가장 적합한 목소리(Voice)를 찾습니다.
   * @param {string} langCode - 'en-US', 'ko-KR' 등
   */
  const getBestVoice = useCallback((langCode) => {
    if (!synthRef.current) return null;
    const voices = synthRef.current.getVoices();

    // 1. 해당 언어의 Google 보이스가 있으면 최우선 (품질이 좋음)
    const googleVoice = voices.find(
      (v) => v.lang === langCode && v.name.includes("Google"),
    );
    if (googleVoice) return googleVoice;

    // 2. 해당 언어의 일반 보이스 찾기
    return voices.find((v) => v.lang === langCode) || null;
  }, []);

  /**
   * 텍스트를 음성으로 재생합니다.
   * @param {string} text - 읽을 내용
   * @param {string} lang - 언어 코드 (default: 'en-US')
   * @param {number} rate - 읽기 속도 (0.1 ~ 10, default: 0.9)
   */
  const speak = useCallback(
    (text, lang = "en-US", rate = 0.9) => {
      if (!supported || !synthRef.current) {
        toast.error("음성 재생을 지원하지 않는 브라우저입니다.");
        return;
      }

      if (!text) return;

      // 이전 재생 중인 음성이 있다면 즉시 중단
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // 목소리 설정
      const voice = getBestVoice(lang);
      if (voice) utterance.voice = voice;

      utterance.lang = lang;
      utterance.rate = rate; // 프로덕션에서는 약간 천천히 읽어주는 것이 학습에 도움됨
      utterance.pitch = 1.0;

      // 이벤트 리스너 등록
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        setIsSpeaking(false);
        console.error("TTS 에러 발생:", e);
      };

      // 재생 실행
      synthRef.current.speak(utterance);
    },
    [supported, getBestVoice],
  );

  /**
   * 재생 중인 음성을 강제 중지합니다.
   */
  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    supported,
  };
};
