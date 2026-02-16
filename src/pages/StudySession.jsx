import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams } from "react-router-dom";
import { speak } from "@/utils/tts";
import StudyCard from "@/components/study/StudyCard";
import StudyHeader from "@/components/study/StudyHeader";
import StudyFinishView from "@/components/study/StudyFinishView";
import { AnimatePresence } from "framer-motion";

const StudySession = ({
  words = [],
  decks = [],
  onFinish,
  onUpdateStatus,
  fetchWordsByDeck,
}) => {
  const { deckName: urlDeckParam } = useParams();
  const currentDeckName = useMemo(
    () => decodeURIComponent(urlDeckParam || ""),
    [urlDeckParam],
  );

  const currentDeck = useMemo(
    () => decks?.find((d) => d.deck_name === currentDeckName),
    [decks, currentDeckName],
  );
  const currentDeckId = currentDeck?.id;
  const langCode = currentDeck?.lang_code || "en-US";

  // 상태 초기화
  const [currentWords, setCurrentWords] = useState(() => {
    try {
      const savedDeckId = localStorage.getItem("temp_study_deck_id");
      if (currentDeckId && String(savedDeckId) === String(currentDeckId)) {
        const savedWords = localStorage.getItem("temp_study_words");
        return savedWords ? JSON.parse(savedWords) : (words ?? []);
      }
    } catch (e) {
      console.error(e);
    }
    return words ?? [];
  });

  const [loading, setLoading] = useState(
    () => currentWords.length === 0 && !!currentDeckId,
  );
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedDeckId = localStorage.getItem("temp_study_deck_id");
    if (currentDeckId && String(savedDeckId) === String(currentDeckId)) {
      const savedIndex = localStorage.getItem("temp_study_index");
      return savedIndex ? parseInt(savedIndex, 10) : 0;
    }
    return 0;
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [unknownWords, setUnknownWords] = useState([]);
  const [knownWords, setKnownWords] = useState([]);
  const [autoPlay, setAutoPlay] = useState(() => {
    const saved = localStorage.getItem("study_setting_autoplay");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const lastPlayedIndex = useRef(-1);

  // 카드를 제어하기 위한 Ref
  const cardRef = useRef(null);

  const isFinished =
    currentIndex >= currentWords.length && currentWords.length > 0;
  const currentWord = currentWords[currentIndex];
  const nextWord = currentWords[currentIndex + 1];

  const handleToggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => {
      const newValue = !prev;
      localStorage.setItem("study_setting_autoplay", JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const clearStudySession = useCallback(() => {
    const keys = ["temp_study_words", "temp_study_index", "temp_study_deck_id"];
    keys.forEach((key) => localStorage.removeItem(key));
  }, []);

  const handleReviewUnknown = useCallback(() => {
    if (unknownWords.length === 0) return;
    const reviewList = [...unknownWords];
    setCurrentWords(reviewList);
    setCurrentIndex(0);
    setUnknownWords([]);
    setKnownWords([]);
    lastPlayedIndex.current = -1;
    localStorage.setItem("temp_study_words", JSON.stringify(reviewList));
    localStorage.setItem("temp_study_index", "0");
  }, [unknownWords]);

  const handleFinishStudy = useCallback(() => {
    clearStudySession();
    onFinish(currentDeckName);
  }, [clearStudySession, onFinish, currentDeckName]);

  useEffect(() => {
    if (
      autoPlay &&
      currentWord &&
      !isFinished &&
      !loading &&
      !isAnimating &&
      lastPlayedIndex.current !== currentIndex
    ) {
      const timer = setTimeout(() => {
        speak(currentWord.word, langCode);
        lastPlayedIndex.current = currentIndex;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    currentIndex,
    currentWord,
    autoPlay,
    isFinished,
    loading,
    langCode,
    isAnimating,
  ]);

  const handleSwipeComplete = useCallback(
    (direction) => {
      if (isFinished || !currentWord) return;

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
    [isFinished, currentWord, onUpdateStatus],
  );

  const triggerCardSwipe = useCallback(
    (direction) => {
      if (isFinished || loading || isAnimating) return;
      if (cardRef.current) {
        setIsAnimating(true);
        cardRef.current.triggerSwipe(direction);
      }
    },
    [isFinished, loading, isAnimating],
  );

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

  useEffect(() => {
    if (currentDeckId && currentWords.length > 0) {
      localStorage.setItem("temp_study_deck_id", String(currentDeckId));
      localStorage.setItem("temp_study_words", JSON.stringify(currentWords));
      localStorage.setItem("temp_study_index", String(currentIndex));
    }
  }, [currentDeckId, currentWords, currentIndex]);

  useEffect(() => {
    if (
      !loading &&
      currentWords.length === 0 &&
      currentDeckId &&
      fetchWordsByDeck
    ) {
      const restoreData = async () => {
        setLoading(true);
        const data = await fetchWordsByDeck(currentDeckId);
        if (data) {
          setCurrentWords(data);
          const savedIndex = localStorage.getItem("temp_study_index");
          if (savedIndex) setCurrentIndex(parseInt(savedIndex, 10));
        }
        setLoading(false);
      };
      restoreData();
    }
  }, [currentDeckId, currentWords.length, loading, fetchWordsByDeck]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") triggerCardSwipe("left");
      else if (e.key === "ArrowRight") triggerCardSwipe("right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerCardSwipe]);

  if (loading)
    return (
      <div className="loading-screen flex-center">
        <p>데이터 동기화 중...</p>
      </div>
    );

  if (isFinished) {
    return (
      <StudyFinishView
        totalCount={currentWords.length}
        unknownCount={unknownWords.length}
        onReview={handleReviewUnknown}
        onBack={handleFinishStudy}
      />
    );
  }

  return (
    <div className="App study-session-page">
      <div className="study-main-container">
        <StudyHeader
          currentIndex={currentIndex}
          totalCount={currentWords.length}
          autoPlay={autoPlay}
          onToggleAutoPlay={handleToggleAutoPlay}
          onBack={handleFinishStudy}
          onShuffle={() => {
            const remaining = [...currentWords.slice(currentIndex)].sort(
              () => Math.random() - 0.5,
            );
            setCurrentWords([
              ...currentWords.slice(0, currentIndex),
              ...remaining,
            ]);
          }}
          onUndo={handleUndo}
        />

        {/* [수정됨] popLayout 제거
            CSS position: absolute가 적용되어 있으므로 기본 모드가 가장 안전합니다.
        */}
        <main className="study-card-area">
          {/* 1. 배경 카드 (다음 단어) */}
          {nextWord && (
            <StudyCard
              key={nextWord.id + "-back"}
              word={nextWord}
              isFront={false}
              langCode={langCode}
            />
          )}

          {/* 2. 앞면 카드 (현재 단어) */}
          <AnimatePresence>
            {currentWord && (
              <StudyCard
                ref={cardRef}
                key={currentWord.id}
                word={currentWord}
                isFront={true}
                langCode={langCode}
                onSwipe={handleSwipeComplete}
              />
            )}
          </AnimatePresence>
        </main>

        <div className="study-score-board">
          <div
            className="score-item unknown"
            onClick={() => triggerCardSwipe("left")}
          >
            <span className="label">몰라요</span>
            <span className="count">{unknownWords.length}</span>
          </div>
          <div
            className="score-item know"
            onClick={() => triggerCardSwipe("right")}
          >
            <span className="label">알아요</span>
            <span className="count">{knownWords.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StudySession);
