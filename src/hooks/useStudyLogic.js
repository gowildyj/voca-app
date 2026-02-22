import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

/**
 * 학습(Study) 모드의 핵심 로직을 담당하는 훅
 * 프로덕션 레벨: 상태 불변성 강화, 애니메이션 동기화, 자동 재생 로직 고도화
 */
export const useStudyLogic = (initialWords = [], onUpdateStatus) => {
  // --- [1] 상태 관리 ---
  const [currentWords, setCurrentWords] = useState(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unknownWords, setUnknownWords] = useState([]);
  const [knownWords, setKnownWords] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // 설정 데이터 (LocalStorage 연동)
  const [autoPlay, setAutoPlay] = useState(() => {
    try {
      const saved = localStorage.getItem("study_setting_autoplay");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const timerRef = useRef(null);
  // 애니메이션 중 중복 스와이프 방지를 위한 가드 변수
  const transitionLock = useRef(false);

  // --- [2] 학습 제어 함수 ---

  /**
   * 남은 단어 셔플 (불변성 유지하며 섞기)
   */
  const handleShuffle = useCallback(() => {
    setCurrentWords((prev) => {
      const alreadyPlayed = prev.slice(0, currentIndex);
      const remaining = prev
        .slice(currentIndex)
        .sort(() => Math.random() - 0.5);
      return [...alreadyPlayed, ...remaining];
    });
    toast.success("남은 단어들을 섞었습니다! 🔀");
  }, [currentIndex]);

  /**
   * Undo 로직: 이전 카드로 되돌리기
   */
  const handleUndo = useCallback(() => {
    if (currentIndex > 0 && !transitionLock.current) {
      const prevIndex = currentIndex - 1;
      const prevWord = currentWords[prevIndex];

      setCurrentIndex(prevIndex);
      // 결과 리스트에서 제거 (낙관적 업데이트의 반대 과정)
      setUnknownWords((prev) => prev.filter((w) => w.id !== prevWord.id));
      setKnownWords((prev) => prev.filter((w) => w.id !== prevWord.id));

      toast("이전 카드로 되돌아갔습니다.", { icon: "↩️" });
    }
  }, [currentIndex, currentWords]);

  /**
   * 자동 재생 토글 및 저장
   */
  const handleToggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => {
      const newValue = !prev;
      localStorage.setItem("study_setting_autoplay", JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  /**
   * 핵심: 스와이프 완료 시 데이터 처리
   */
  const handleSwipeComplete = useCallback(
    (direction) => {
      if (transitionLock.current || currentIndex >= currentWords.length) return;

      const currentWord = currentWords[currentIndex];
      const isKnown = direction === "right";
      const status = isKnown ? "know" : "unknown";

      transitionLock.current = true;
      setIsAnimating(true);

      // 1. 결과 기록 및 DB 업데이트
      if (isKnown) {
        setKnownWords((prev) => [...prev, currentWord]);
      } else {
        setUnknownWords((prev) => [...prev, currentWord]);
      }

      onUpdateStatus?.(currentWord.id, status);

      // 2. 애니메이션 시간 후 인덱스 증가 (UX 최적화)
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsAnimating(false);
        transitionLock.current = false;
      }, 300);
    },
    [currentIndex, currentWords, onUpdateStatus],
  );

  /**
   * 모르는 단어만 다시 학습 세팅
   */
  const handleReviewUnknown = useCallback(() => {
    if (unknownWords.length === 0) {
      toast.error("복습할 단어가 없습니다.");
      return;
    }

    const shuffledUnknown = [...unknownWords].sort(() => Math.random() - 0.5);

    setCurrentWords(shuffledUnknown);
    setCurrentIndex(0);
    setUnknownWords([]);
    setKnownWords([]);

    toast.success("모르는 단어 복습을 시작합니다! 🔥");
  }, [unknownWords]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    // Computed States
    currentWord: currentWords[currentIndex],
    currentIndex,
    totalCount: currentWords.length,
    unknownWords,
    knownWords,
    isAnimating,
    autoPlay,
    isFinished: currentIndex >= currentWords.length && currentWords.length > 0,
    progress:
      currentWords.length > 0 ? (currentIndex / currentWords.length) * 100 : 0,

    // Actions
    setCurrentWords,
    setIsAnimating,
    handleShuffle,
    handleUndo,
    handleSwipeComplete,
    handleReviewUnknown,
    handleToggleAutoPlay,
  };
};
