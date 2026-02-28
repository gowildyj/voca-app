import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useWordStore } from "@/store/useWordStore";
import { toast } from "react-hot-toast";

export const useStudyPage = (
  deckId,
  initialWords = null,
  initialDeckData = null,
) => {
  const fetchWordsByDeck = useWordStore((state) => state.fetchWordsByDeck);
  const fetchDeckById = useWordStore((state) => state.fetchDeckById);
  const updateWordStatus = useWordStore((state) => state.updateWordStatus);

  const [currentDeck, setCurrentDeck] = useState(initialDeckData || null);
  const cardRef = useRef();
  const transitionLock = useRef(false);

  // 🌟 [핵심 수정] 초기화가 이미 됐는지 체크하는 Ref
  const initializedRef = useRef(false);

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState({ know: 0, unknown: 0 });
  const [unknownStack, setUnknownStack] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studySettings, setStudySettings] = useState(() => {
    try {
      const saved = localStorage.getItem("study_settings");
      return saved
        ? JSON.parse(saved)
        : { isAutoPlay: false, viewMode: "frontFirst" };
    } catch {
      return { isAutoPlay: false, viewMode: "frontFirst" };
    }
  });

  // --- [초기 데이터 로드 로직 수정] ---
  useEffect(() => {
    // 이미 초기화됐다면, 부모 데이터가 바뀌어도 무시!
    if (initializedRef.current) return;

    if (initialWords) {
      setWords(initialWords);
      initializedRef.current = true;
    } else if (deckId) {
      // initialWords가 아예 없을 때만(null) 서버 요청
      fetchWordsByDeck(deckId).then((data) => {
        setWords(data || []);
        initializedRef.current = true;
      });
    }

    // 덱 정보 로드
    if (initialDeckData) {
      setCurrentDeck(initialDeckData);
    } else if (deckId) {
      fetchDeckById(deckId).then((deck) => {
        if (deck) setCurrentDeck(deck);
      });
    }
  }, [deckId, initialWords, initialDeckData, fetchWordsByDeck, fetchDeckById]);

  // --- [나머지 로직 동일] ---
  const updateSettings = useCallback((newSettings) => {
    setStudySettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("study_settings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleNextCard = useCallback(
    (direction) => {
      if (transitionLock.current || currentIndex >= words.length) return;

      const currentWord = words[currentIndex];
      if (!currentWord) return;

      const isKnown = direction === "right";
      const status = isKnown ? "know" : "unknown";

      transitionLock.current = true;
      setIsAnimating(true);

      // 점수 기록
      setCounts((prev) => ({ ...prev, [status]: prev[status] + 1 }));
      if (!isKnown) {
        setUnknownStack((prev) => [...prev, currentWord]);
      }

      // DB 업데이트 (이게 부모 리렌더링을 유발하지만, 위에서 막았으니 안전!)
      updateWordStatus(currentWord.id, status);

      setTimeout(() => {
        setCurrentIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= words.length) setIsFinished(true);
          return nextIndex;
        });
        setIsAnimating(false);
        transitionLock.current = false;
      }, 50);
    },
    [words, currentIndex, updateWordStatus],
  );

  const handleRetryUnknown = useCallback(() => {
    if (unknownStack.length > 0) {
      setWords([...unknownStack].sort(() => Math.random() - 0.5));
      setUnknownStack([]);
      setCurrentIndex(0);
      setCounts({ know: 0, unknown: 0 });
      setIsFinished(false);
      toast.success("틀린 단어 복습 시작! 🔥");
    } else {
      toast.success("모든 단어 마스터! 🎉");
    }
  }, [unknownStack]);

  const triggerSwipe = useCallback(
    (direction) => {
      if (cardRef.current && !transitionLock.current && !isFinished) {
        direction === "right"
          ? cardRef.current.swipeRight()
          : cardRef.current.swipeLeft();
      }
    },
    [isFinished],
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSettingsOpen || isFinished) return;
      if (e.key === "ArrowRight") triggerSwipe("right");
      if (e.key === "ArrowLeft") triggerSwipe("left");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, isFinished, triggerSwipe]);

  const currentCard = useMemo(
    () => words[currentIndex] || null,
    [words, currentIndex],
  );

  return {
    words,
    currentCard,
    currentDeck,
    total: words.length,
    currentIndex,
    counts,
    cardRef,
    isSettingsOpen,
    studySettings,
    isFinished,
    setIsSettingsOpen,
    setStudySettings: updateSettings,
    handleNextCard,
    handleRetryUnknown,
    triggerSwipe,
  };
};
