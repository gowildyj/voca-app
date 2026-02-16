import { useState, useCallback, useRef } from "react";

export const useStudyLogic = (initialWords, onUpdateStatus) => {
  const [currentWords, setCurrentWords] = useState(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unknownWords, setUnknownWords] = useState([]);
  const [knownWords, setKnownWords] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const lastPlayedIndex = useRef(-1);
  const [autoPlay, setAutoPlay] = useState(() => {
    const saved = localStorage.getItem("study_setting_autoplay");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // 셔플 로직
  const handleShuffle = useCallback(() => {
    const remaining = [...currentWords.slice(currentIndex)].sort(
      () => Math.random() - 0.5,
    );
    setCurrentWords([...currentWords.slice(0, currentIndex), ...remaining]);
  }, [currentWords, currentIndex]);

  // Undo 로직
  const handleUndo = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevWord = currentWords[prevIndex];
      setCurrentIndex(prevIndex);
      setUnknownWords((prev) => prev.filter((w) => w.id !== prevWord.id));
      setKnownWords((prev) => prev.filter((w) => w.id !== prevWord.id));
      lastPlayedIndex.current = -1;
    }
  }, [currentIndex, currentWords]);

  // 자동 재생 토글
  const handleToggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => {
      const newValue = !prev;
      localStorage.setItem("study_setting_autoplay", JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  // 스와이프 완료 로직
  const handleSwipeComplete = useCallback(
    (direction, currentWord) => {
      const status = direction === "left" ? "unknown" : "know";
      if (direction === "left") {
        setUnknownWords((prev) => [...prev, currentWord]);
      } else {
        setKnownWords((prev) => [...prev, currentWord]);
      }

      onUpdateStatus?.(currentWord.id, status);
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
    },
    [onUpdateStatus],
  );

  const handleReviewUnknown = useCallback(() => {
    if (unknownWords.length === 0) return;

    const nextList = [...unknownWords];
    setCurrentWords(nextList);
    setCurrentIndex(0);
    setUnknownWords([]);
    setKnownWords([]);
    setIsAnimating(false);

    localStorage.setItem("temp_study_words", JSON.stringify(nextList));
    localStorage.setItem("temp_study_index", "0");
    localStorage.setItem("temp_study_unknown", "[]");
    localStorage.setItem("temp_study_known", "[]");
  }, [
    unknownWords,
    setCurrentWords,
    setCurrentIndex,
    setUnknownWords,
    setKnownWords,
    setIsAnimating,
  ]);

  return {
    currentWords,
    setCurrentWords,
    currentIndex,
    setCurrentIndex,
    unknownWords,
    setUnknownWords,
    knownWords,
    setKnownWords,
    isAnimating,
    setIsAnimating,
    lastPlayedIndex,
    handleShuffle,
    handleUndo,
    handleSwipeComplete,
    handleReviewUnknown,
    autoPlay,
    handleToggleAutoPlay,
  };
};
