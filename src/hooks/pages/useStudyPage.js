import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useWordStore } from "@/store/useWordStore";
import { playText } from "@/utils/ttsUtils";
import { toast } from "react-hot-toast";
import { useMotionValue, useTransform, useAnimation } from "framer-motion";

export const useStudyPage = (
  deckId,
  initialWords = null,
  initialDeckData = null,
) => {
  const fetchWordsByDeck = useWordStore((state) => state.fetchWordsByDeck);
  const fetchDeckById = useWordStore((state) => state.fetchDeckById);
  const updateWordStatus = useWordStore((state) => state.updateWordStatus);
  const updateWordFavorite = useWordStore((state) => state.updateWordFavorite);

  // --- Framer Motion 상태 ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const [swipeDirection, setSwipeDirection] = useState(null);

  // --- 기본 상태 ---
  const [currentDeck, setCurrentDeck] = useState(initialDeckData || null);
  const [history, setHistory] = useState([]);
  const cardRef = useRef();
  const transitionLock = useRef(false);
  const initializedRef = useRef(false);
  const autoPlayTimerRef = useRef(null);

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState({ know: 0, unknown: 0 });
  const [unknownStack, setUnknownStack] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- 설정 상태 및 함수 (호이스팅 방지 위로 이동) ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studySettings, setStudySettings] = useState(() => {
    try {
      const saved = localStorage.getItem("study_settings");
      return saved
        ? JSON.parse(saved)
        : { isAutoPlay: false, isAutoAudio: true, viewMode: "frontFirst" };
    } catch {
      return { isAutoPlay: false, isAutoAudio: true, viewMode: "frontFirst" };
    }
  });

  const updateSettings = useCallback((newSettings) => {
    setStudySettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("study_settings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // --- 테두리 색상 감지 ---
  useEffect(() => {
    const unsubscribe = x.on("change", (latestX) => {
      if (latestX > 50) setSwipeDirection("right");
      else if (latestX < -50) setSwipeDirection("left");
      else setSwipeDirection(null);
    });
    return () => unsubscribe();
  }, [x]);

  // --- 초기 데이터 로드 ---
  useEffect(() => {
    if (initializedRef.current) return;
    if (initialWords) {
      setWords(initialWords);
      initializedRef.current = true;
    } else if (deckId) {
      fetchWordsByDeck(deckId).then((data) => {
        setWords(data || []);
        initializedRef.current = true;
      });
    }
    if (initialDeckData) setCurrentDeck(initialDeckData);
    else if (deckId)
      fetchDeckById(deckId).then((deck) => deck && setCurrentDeck(deck));
  }, [deckId, initialWords, initialDeckData, fetchWordsByDeck, fetchDeckById]);

  // --- autoAudio 읽기 --
  useEffect(() => {
    if (words[currentIndex] && studySettings.isAutoAudio && !isFinished) {
      playText(words[currentIndex].word, currentDeck?.language || "en-US");
    }
  }, [currentIndex, studySettings.isAutoAudio, isFinished, currentDeck]);

  // --- 카드 위치 초기화 ---
  const resetCardPosition = useCallback(() => {
    x.set(0);
    y.set(0);
    controls.set({ x: 0, y: 0, opacity: 1 });
    setIsFlipped(false);
    setSwipeDirection(null);
  }, [x, y, controls]);

  // --- Flip 핸들러 ---
  const handleFlip = useCallback(() => {
    if (Math.abs(x.get()) < 5) setIsFlipped((prev) => !prev);
  }, [x]);

  // --- Undo 핸들러 ---
  // useStudyPage.js 내부의 handleUndo

  const handleUndo = useCallback(() => {
    if (currentIndex === 0 || history.length === 0) {
      // toast.error("되돌릴 카드가 없습니다.");
      return;
    }

    const lastAction = history[history.length - 1];

    setCurrentIndex((prev) => prev - 1);

    if (lastAction.status !== "auto") {
      setCounts((prev) => ({
        ...prev,
        [lastAction.status]: prev[lastAction.status] - 1,
      }));

      if (lastAction.status === "unknown") {
        setUnknownStack((prev) => prev.slice(0, -1));
      }
    }

    setHistory((prev) => prev.slice(0, -1));
    setIsFlipped(false);
    resetCardPosition();

    // toast.success("이전 카드로 돌아왔습니다.");
  }, [currentIndex, history, resetCardPosition]);

  // --- Shuffle 핸들러 ---
  const handleShuffle = useCallback(() => {
    if (words.length <= currentIndex + 1) {
      // toast.error("섞을 남은 단어가 없습니다.");
      return;
    }
    setWords((prev) => {
      const learned = prev.slice(0, currentIndex);
      const remaining = prev.slice(currentIndex);
      const shuffled = [...remaining].sort(() => Math.random() - 0.5);
      return [...learned, ...shuffled];
    });
    setIsFlipped(false);
    // toast.success("남은 단어들을 섞었습니다!");
  }, [currentIndex, words.length]);

  // --- 틀린 단어 재학습 핸들러 ---
  const handleRetryUnknown = useCallback(() => {
    if (unknownStack.length > 0) {
      setWords([...unknownStack].sort(() => Math.random() - 0.5));
      setUnknownStack([]);
      setCurrentIndex(0);
      setCounts({ know: 0, unknown: 0 });
      setIsFinished(false);
      setIsFlipped(false);
      resetCardPosition();
      // toast.success("틀린 단어 복습 시작! 🔥");
    } else {
      // toast.success("모든 단어 마스터! 🎉");
    }
  }, [unknownStack, resetCardPosition]);

  // --- 스와이프 액션 ---
  const onSwipeAction = useCallback(
    async (direction) => {
      if (transitionLock.current || currentIndex >= words.length) return;

      const currentWord = words[currentIndex];
      const isKnown = direction === "right";
      const status = isKnown ? "know" : "unknown";

      transitionLock.current = true;

      await controls.start({
        x: direction === "right" ? 500 : -500,
        opacity: 0,
        transition: { duration: 0.15 },
      });

      setHistory((prev) => [...prev, { index: currentIndex, status }]);
      setCounts((prev) => ({ ...prev, [status]: prev[status] + 1 }));
      if (!isKnown) setUnknownStack((prev) => [...prev, currentWord]);
      updateWordStatus(currentWord.id, status);

      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= words.length) setIsFinished(true);
        return nextIndex;
      });

      resetCardPosition();
      transitionLock.current = false;
    },
    [words, currentIndex, controls, updateWordStatus, resetCardPosition],
  );

  const triggerSwipe = useCallback(
    (direction) => {
      if (!transitionLock.current && !isFinished) onSwipeAction(direction);
    },
    [onSwipeAction, isFinished],
  );

  // --- AutoPlay ---
  useEffect(() => {
    if (!studySettings.isAutoPlay || isFinished) {
      clearTimeout(autoPlayTimerRef.current);
      return;
    }

    const runAutoPlayLoop = async () => {
      const currentWord = words[currentIndex];
      if (!currentWord) return;

      // playText(currentWord.word, currentDeck?.language || "en-US");
      autoPlayTimerRef.current = setTimeout(() => {
        setIsFlipped(true);

        autoPlayTimerRef.current = setTimeout(() => {
          if (currentIndex < words.length - 1) {
            setIsFlipped(false);
            setHistory((prev) => [
              ...prev,
              { index: currentIndex, status: "auto" },
            ]);
            setCurrentIndex((prev) => prev + 1);
            resetCardPosition();
          } else {
            setIsFinished(true);
            updateSettings({ isAutoPlay: false });
          }
        }, 1500);
      }, 1500);
    };
    runAutoPlayLoop();
    return () => clearTimeout(autoPlayTimerRef.current);
  }, [
    studySettings.isAutoPlay,
    currentIndex,
    isFinished,
    words,
    currentDeck,
    updateSettings,
    resetCardPosition,
  ]);

  // --- 키보드 이벤트 ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSettingsOpen || isFinished) return;
      if (e.key === "ArrowRight") triggerSwipe("right");
      if (e.key === "ArrowLeft") triggerSwipe("left");
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, isFinished, triggerSwipe, handleFlip]);

  const onToggleWordFavorite = useCallback(
    async (wordId, currentStatus) => {
      await updateWordFavorite(wordId, !currentStatus);
      setWords((prev) =>
        prev.map((w) =>
          w.id === wordId ? { ...w, isFavorite: !currentStatus } : w,
        ),
      );
    },
    [updateWordFavorite],
  );

  // --- 리턴 ---

  return {
    // Data
    words,
    currentCard: words[currentIndex] || null,
    nextCard: words[currentIndex + 1] || null,
    currentDeck,
    total: words.length,
    currentIndex,
    counts,
    isFinished,
    // State & Animation
    isSettingsOpen,
    studySettings,
    isFlipped,
    swipeDirection,
    x,
    y,
    rotate,
    controls,
    // Actions
    setIsSettingsOpen,
    setStudySettings: updateSettings,
    handleRetryUnknown,
    triggerSwipe,
    onToggleWordFavorite,
    handleUndo,
    handleShuffle,
    handleFlip,
    onSwipeAction,
    // UI 컨트롤러용 토글 함수들
    toggleAutoPlay: () =>
      updateSettings({ isAutoPlay: !studySettings.isAutoPlay }),
    toggleAutoAudio: () =>
      updateSettings({ isAutoAudio: !studySettings.isAutoAudio }),
    toggleViewMode: () =>
      updateSettings({
        viewMode:
          studySettings.viewMode === "frontFirst" ? "backFirst" : "frontFirst",
      }),
  };
};
