import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

/**
 * 학습(Study) 모드의 핵심 로직을 담당하는 훅
 * @param {Array} initialWords - 학습할 단어 목록
 * @param {Function} onUpdateStatus - 단어 상태(know/unknown)를 DB에 업데이트할 함수
 */
export const useStudyLogic = (initialWords = [], onUpdateStatus) => {
  // --- [1] 상태 관리 ---
  const [currentWords, setCurrentWords] = useState(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unknownWords, setUnknownWords] = useState([]);
  const [knownWords, setKnownWords] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // 자동 재생 설정 (로컬 스토리지 연동)
  const [autoPlay, setAutoPlay] = useState(() => {
    try {
      const saved = localStorage.getItem("study_setting_autoplay");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // 오디오나 타이머 제어를 위한 Ref
  const lastPlayedIndex = useRef(-1);
  const timerRef = useRef(null);

  // --- [2] 학습 제어 함수 ---

  /**
   * 남은 단어들을 무작위로 섞습니다.
   */
  const handleShuffle = useCallback(() => {
    setCurrentWords((prev) => {
      const alreadyPlayed = prev.slice(0, currentIndex);
      const remaining = prev
        .slice(currentIndex)
        .sort(() => Math.random() - 0.5);
      return [...alreadyPlayed, ...remaining];
    });
    toast.success("남은 단어들이 섞였습니다.");
  }, [currentIndex]);

  /**
   * 직전 카드로 되돌아갑니다. (Undo)
   */
  const handleUndo = useCallback(() => {
    if (currentIndex > 0 && !isAnimating) {
      const prevIndex = currentIndex - 1;
      const prevWord = currentWords[prevIndex];

      setCurrentIndex(prevIndex);
      // 기록된 결과에서 제거
      setUnknownWords((prev) => prev.filter((w) => w.id !== prevWord.id));
      setKnownWords((prev) => prev.filter((w) => w.id !== prevWord.id));

      lastPlayedIndex.current = -1; // 오디오 재생 인덱스 리셋
      toast("이전 카드로 되돌아갔습니다.", { icon: "↩️" });
    }
  }, [currentIndex, currentWords, isAnimating]);

  /**
   * 자동 재생 모드를 토글합니다.
   */
  const handleToggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => {
      const newValue = !prev;
      localStorage.setItem("study_setting_autoplay", JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  /**
   * 스와이프 동작이 완료되었을 때 호출되는 핵심 로직
   */
  const handleSwipeComplete = useCallback(
    (direction, currentWord) => {
      if (!currentWord) return;

      const isKnown = direction === "right";
      const status = isKnown ? "know" : "unknown";

      // 1. 학습 결과 기록
      if (isKnown) {
        setKnownWords((prev) => [...prev, currentWord]);
      } else {
        setUnknownWords((prev) => [...prev, currentWord]);
      }

      // 2. 부모(Context)를 통해 DB 상태 업데이트
      onUpdateStatus?.(currentWord.id, status);

      // 3. 다음 카드로 이동
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
    },
    [onUpdateStatus],
  );

  /**
   * '모르는 단어만 다시 학습' 로직
   */
  const handleReviewUnknown = useCallback(() => {
    if (unknownWords.length === 0) {
      toast.error("다시 학습할 단어가 없습니다.");
      return;
    }

    const nextList = [...unknownWords].sort(() => Math.random() - 0.5);

    // 상태 초기화 및 새로운 목록 세팅
    setCurrentWords(nextList);
    setCurrentIndex(0);
    setUnknownWords([]);
    setKnownWords([]);
    setIsAnimating(false);

    toast.success("모르는 단어 복습을 시작합니다!");
  }, [unknownWords]);

  // --- [3] 생명주기 관리 (Cleanup) ---
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    // 상태
    currentWords,
    currentIndex,
    currentWord: currentWords[currentIndex],
    unknownWords,
    knownWords,
    isAnimating,
    autoPlay,
    isFinished: currentIndex >= currentWords.length && currentWords.length > 0,
    progress:
      currentWords.length > 0 ? (currentIndex / currentWords.length) * 100 : 0,

    // 함수
    setCurrentWords,
    setIsAnimating,
    handleShuffle,
    handleUndo,
    handleSwipeComplete,
    handleReviewUnknown,
    handleToggleAutoPlay,

    // Refs
    lastPlayedIndex,
  };
};
