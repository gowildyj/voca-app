import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

/**
 * TTS(Text-to-Speech) 엔진 제어 훅
 * 프로덕션 레벨: 보이스 로딩 동기화, 에러 경계 처리, 메모리 누수 방지
 */
export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState([]);
  const synthRef = useRef(null);

  // 1. 초기화 및 지원 여부 확인
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;

      // 브라우저마다 보이스 로드 시점이 다르므로 이벤트 리스너 등록
      const updateVoices = () => {
        const availableVoices = synthRef.current.getVoices();
        setVoices(availableVoices);
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    } else {
      setSupported(false);
      console.warn("이 브라우저는 Web Speech API를 지원하지 않습니다.");
    }

    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  /**
   * 🌟 고품질 목소리 선택 로직 (Google 보이스 우선순위)
   */
  const getBestVoice = useCallback(
    (langCode) => {
      if (voices.length === 0) return null;

      // 1. 해당 언어의 Google 고품질 보이스 검색
      const googleVoice = voices.find(
        (v) => v.lang.startsWith(langCode) && v.name.includes("Google"),
      );
      if (googleVoice) return googleVoice;

      // 2. 프리미엄/내장 보이스 검색
      const premiumVoice = voices.find(
        (v) => v.lang.startsWith(langCode) && v.name.includes("Premium"),
      );
      if (premiumVoice) return premiumVoice;

      // 3. 언어 코드 일치하는 첫 번째 보이스
      return voices.find((v) => v.lang.startsWith(langCode)) || null;
    },
    [voices],
  );

  /**
   * 음성 재생 실행
   */
  const speak = useCallback(
    (text, lang = "en-US", rate = 0.9) => {
      if (!supported || !synthRef.current) {
        toast.error("음성 기능을 사용할 수 없는 환경입니다.");
        return;
      }

      if (!text) return;

      // 🌟 이전 재생 중인 음성 즉시 중단 (겹침 방지)
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getBestVoice(lang);

      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = lang;
      utterance.rate = rate; // 학습용이므로 약간 느린 속도 권장
      utterance.pitch = 1.0;

      // 상태 동기화 이벤트
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        setIsSpeaking(false);
        // 'interrupted'는 cancel() 호출 시 발생하므로 에러 처리 제외
        if (e.error !== "interrupted") {
          console.error("TTS 재생 에러:", e);
        }
      };

      synthRef.current.speak(utterance);
    },
    [supported, getBestVoice],
  );

  /**
   * 재생 강제 중지
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
    availableVoices: voices,
  };
};
