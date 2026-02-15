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
    const savedDeckId = localStorage.getItem("temp_study_deck_id");
    if (currentDeckId && String(savedDeckId) === String(currentDeckId)) {
      const savedWords = localStorage.getItem("temp_study_words");
      return savedWords ? JSON.parse(savedWords) : (words ?? []);
    }
    return words ?? [];
  });

  const [loading, setLoading] = useState(
    () => currentWords.length === 0 && !!currentDeckId,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [unknownWords, setUnknownWords] = useState([]);
  const [knownWords, setKnownWords] = useState([]);
  const [autoPlay, setAutoPlay] = useState(true);
  const lastPlayedIndex = useRef(-1);

  const isFinished =
    currentIndex >= currentWords.length && currentWords.length > 0;
  const currentWord = currentWords[currentIndex];

  // 로컬스토리지 청소
  const clearStudySession = useCallback(() => {
    const keys = ["temp_study_words", "temp_study_index", "temp_study_deck_id"];
    keys.forEach((key) => localStorage.removeItem(key));
  }, []);

  // ⭐ 모르는 단어만 복습하기 핸들러
  const handleReviewUnknown = useCallback(() => {
    if (unknownWords.length === 0) return;

    const reviewList = [...unknownWords];
    setCurrentWords(reviewList); // 단어 리스트 교체
    setCurrentIndex(0); // 인덱스 초기화
    setUnknownWords([]); // 점수판 초기화
    setKnownWords([]);
    lastPlayedIndex.current = -1;

    // 복습 세션 상태 저장
    localStorage.setItem("temp_study_words", JSON.stringify(reviewList));
    localStorage.setItem("temp_study_index", "0");
  }, [unknownWords]);

  const handleFinishStudy = useCallback(() => {
    clearStudySession();
    onFinish(currentDeckName);
  }, [clearStudySession, onFinish, currentDeckName]);

  // Swipe 핸들러
  const handleSwipe = useCallback(
    (direction) => {
      if (isFinished || !currentWord || feedback) return;

      const status = direction === "left" ? "unknown" : "know";
      if (direction === "left") {
        setUnknownWords((prev) => [...prev, currentWord]);
      } else {
        setKnownWords((prev) => [...prev, currentWord]);
      }

      onUpdateStatus?.(currentWord.id, status);
      setFeedback(status);

      setTimeout(() => {
        setFeedback(null);
        setCurrentIndex((prev) => prev + 1);
      }, 150);
    },
    [isFinished, currentWord, onUpdateStatus, feedback],
  );

  const handleUndo = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevWord = currentWords[prevIndex];

      setCurrentIndex(prevIndex);
      // ✅ 몰라요/알아요 양쪽 목록에서 해당 단어를 찾아 제거
      setUnknownWords((prev) => prev.filter((w) => w.id !== prevWord.id));
      setKnownWords((prev) => prev.filter((w) => w.id !== prevWord.id));
      lastPlayedIndex.current = prevIndex - 1;
    }
  }, [currentIndex, currentWords]);

  // 키보드 이벤트
  useEffect(() => {
    const onKey = (e) => {
      if (isFinished || loading || feedback) return;
      if (e.key === "ArrowLeft") handleSwipe("left");
      else if (e.key === "ArrowRight") handleSwipe("right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFinished, loading, feedback, handleSwipe]);

  // 렌더링...
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
        onReview={handleReviewUnknown} // ⭐ 여기로 수정된 함수 전달
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
          onToggleAutoPlay={() => setAutoPlay(!autoPlay)}
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

        <main className="study-card-area">
          <AnimatePresence mode="wait">
            {currentWord && (
              <StudyCard
                key={currentWord.id}
                word={currentWord}
                langCode={langCode}
                onSwipe={handleSwipe}
                feedback={feedback}
              />
            )}
          </AnimatePresence>
        </main>

        <div className="study-score-board">
          <div
            className="score-item unknown"
            onClick={() => handleSwipe("left")}
          >
            <span className="label">몰라요</span>
            <span className="count">{unknownWords.length}</span>
          </div>
          <div className="score-item know" onClick={() => handleSwipe("right")}>
            <span className="label">알아요</span>
            <span className="count">{knownWords.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StudySession);
