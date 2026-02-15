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
  const [feedback, setFeedback] = useState(null);
  const [unknownWords, setUnknownWords] = useState([]);
  const [knownWords, setKnownWords] = useState([]);
  const [autoPlay, setAutoPlay] = useState(() => {
    const saved = localStorage.getItem("study_setting_autoplay");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const lastPlayedIndex = useRef(-1);

  const isFinished =
    currentIndex >= currentWords.length && currentWords.length > 0;
  const currentWord = currentWords[currentIndex];

  const handleToggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => {
      const newValue = !prev;
      localStorage.setItem("study_setting_autoplay", JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  // 로컬스토리지 청소
  const clearStudySession = useCallback(() => {
    const keys = ["temp_study_words", "temp_study_index", "temp_study_deck_id"];
    keys.forEach((key) => localStorage.removeItem(key));
  }, []);

  // ⭐ 모르는 단어만 복습하기 핸들러
  const handleReviewUnknown = useCallback(() => {
    if (unknownWords.length === 0) return;

    const reviewList = [...unknownWords];
    setCurrentWords(reviewList);
    setCurrentIndex(0);
    setUnknownWords([]);
    setKnownWords([]);
    lastPlayedIndex.current = -1; // 복습 시작 시 재생 인덱스 초기화

    localStorage.setItem("temp_study_words", JSON.stringify(reviewList));
    localStorage.setItem("temp_study_index", "0");
  }, [unknownWords]);

  const handleFinishStudy = useCallback(() => {
    clearStudySession();
    onFinish(currentDeckName);
  }, [clearStudySession, onFinish, currentDeckName]);

  useEffect(() => {
    // 1. 자동재생 켜짐 확인
    // 2. 단어가 존재하고, 아직 끝나지 않았는지 확인
    // 3. 현재 인덱스가 방금 재생한 인덱스와 다른지 확인 (중복 재생 방지)
    if (
      autoPlay &&
      currentWord &&
      !isFinished &&
      !loading &&
      lastPlayedIndex.current !== currentIndex
    ) {
      // 약간의 딜레이를 주어 화면 전환 후 자연스럽게 재생
      const timer = setTimeout(() => {
        speak(currentWord.word, langCode);
        lastPlayedIndex.current = currentIndex; // 재생 완료 표시
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentWord, autoPlay, isFinished, loading, langCode]);

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
      setUnknownWords((prev) => prev.filter((w) => w.id !== prevWord.id));
      setKnownWords((prev) => prev.filter((w) => w.id !== prevWord.id));

      // Undo 시에는 자동재생이 다시 되지 않도록 처리하거나,
      // 다시 듣고 싶다면 아래 줄을 -2 등으로 설정.
      // 보통 Undo 후에는 다시 듣는 게 좋으므로 -1로 초기화하여 재진입 시 소리나게 함.
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
          // 데이터 로드 후 인덱스 복구 시도
          const savedIndex = localStorage.getItem("temp_study_index");
          if (savedIndex) setCurrentIndex(parseInt(savedIndex, 10));
        }
        setLoading(false);
      };
      restoreData();
    }
  }, [currentDeckId, currentWords.length, loading, fetchWordsByDeck]);
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
            // 셔플 시 인덱스가 그대로라면 다시 재생되지 않도록 주의
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
                setFeedback={setFeedback} // StudyCard에 prop으로 전달 필요
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
