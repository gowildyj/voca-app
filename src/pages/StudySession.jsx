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

  // ----------------------------------------------------------------
  // 1. 상태 초기화 (새로고침 시 데이터 유지 로직 포함)
  // ----------------------------------------------------------------

  // (1) 학습할 단어 목록
  const [currentWords, setCurrentWords] = useState(() => {
    try {
      const savedDeckId = localStorage.getItem("temp_study_deck_id");
      // 저장된 덱 ID가 있으면 일단 불러옴 (나중에 currentDeckId와 검증)
      if (savedDeckId) {
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

  // (2) 현재 인덱스
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedDeckId = localStorage.getItem("temp_study_deck_id");
    if (savedDeckId) {
      const savedIndex = localStorage.getItem("temp_study_index");
      return savedIndex ? parseInt(savedIndex, 10) : 0;
    }
    return 0;
  });

  // (3) 몰라요 목록 (✅ 수정됨: 조건 완화하여 데이터 복구)
  const [unknownWords, setUnknownWords] = useState(() => {
    try {
      const savedDeckId = localStorage.getItem("temp_study_deck_id");
      const saved = localStorage.getItem("temp_study_unknown");

      // 저장된 데이터가 있고 덱 ID가 존재하면 일단 로드
      if (savedDeckId && saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return [];
  });

  // (4) 알아요 목록 (✅ 수정됨: 조건 완화하여 데이터 복구)
  const [knownWords, setKnownWords] = useState(() => {
    try {
      const savedDeckId = localStorage.getItem("temp_study_deck_id");
      const saved = localStorage.getItem("temp_study_known");

      if (savedDeckId && saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return [];
  });

  const [isAnimating, setIsAnimating] = useState(false);
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

  // ----------------------------------------------------------------
  // 2. 이벤트 핸들러 및 유틸리티
  // ----------------------------------------------------------------

  const handleToggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => {
      const newValue = !prev;
      localStorage.setItem("study_setting_autoplay", JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  // 학습 종료 및 데이터 정리
  const clearStudySession = useCallback(() => {
    const keys = [
      "temp_study_words",
      "temp_study_index",
      "temp_study_deck_id",
      "temp_study_unknown",
      "temp_study_known",
    ];
    keys.forEach((key) => localStorage.removeItem(key));
  }, []);

  // "몰라요" 단어만 모아서 재학습
  const handleReviewUnknown = useCallback(() => {
    if (unknownWords.length === 0) return;
    const reviewList = [...unknownWords];

    // 상태 초기화
    setCurrentWords(reviewList);
    setCurrentIndex(0);
    setUnknownWords([]);
    setKnownWords([]);
    lastPlayedIndex.current = -1;

    // 로컬 스토리지 갱신
    localStorage.setItem("temp_study_words", JSON.stringify(reviewList));
    localStorage.setItem("temp_study_index", "0");
    localStorage.removeItem("temp_study_unknown");
    localStorage.removeItem("temp_study_known");
  }, [unknownWords]);

  // 학습 완전 종료 (뒤로가기)
  const handleFinishStudy = useCallback(() => {
    clearStudySession();
    onFinish(currentDeckName);
  }, [clearStudySession, onFinish, currentDeckName]);

  // Undo (이전 카드로 돌아가기)
  const handleUndo = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevWord = currentWords[prevIndex];
      setCurrentIndex(prevIndex);

      // 목록에서 제거
      setUnknownWords((prev) => prev.filter((w) => w.id !== prevWord.id));
      setKnownWords((prev) => prev.filter((w) => w.id !== prevWord.id));

      lastPlayedIndex.current = -1;
    }
  }, [currentIndex, currentWords]);

  // ----------------------------------------------------------------
  // 3. 핵심 로직 (스와이프 및 애니메이션)
  // ----------------------------------------------------------------

  // (1) 실제 데이터 처리 (애니메이션 종료 후 호출됨)
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

  // (2) 애니메이션 트리거 (키보드/버튼 입력 시 호출)
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

  // ----------------------------------------------------------------
  // 4. useEffect (사이드 이펙트)
  // ----------------------------------------------------------------

  // (1) 자동 재생
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

  // (2) 로컬 스토리지 저장 (진행 상황) - ✅ 핵심 수정: 조건 강화
  useEffect(() => {
    // 덱 ID가 아직 로딩되지 않았거나 단어가 없으면 저장 금지 (초기화 방지)
    if (!currentDeckId || currentWords.length === 0) return;

    // 저장된 덱 ID와 현재 덱 ID가 다르면 저장 금지 (데이터 오염 방지)
    const savedDeckId = localStorage.getItem("temp_study_deck_id");
    if (savedDeckId && String(savedDeckId) !== String(currentDeckId)) {
      return;
    }

    localStorage.setItem("temp_study_deck_id", String(currentDeckId));
    localStorage.setItem("temp_study_words", JSON.stringify(currentWords));
    localStorage.setItem("temp_study_index", String(currentIndex));
    localStorage.setItem("temp_study_unknown", JSON.stringify(unknownWords));
    localStorage.setItem("temp_study_known", JSON.stringify(knownWords));
  }, [currentDeckId, currentWords, currentIndex, unknownWords, knownWords]);

  // (3) 데이터 복구 (새로고침 후 데이터가 없으면 Fetch)
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
          // 점수는 위 useState 초기화에서 로드됨
        }
        setLoading(false);
      };
      restoreData();
    }
  }, [currentDeckId, currentWords.length, loading, fetchWordsByDeck]);

  // (4) 키보드 이벤트 연결
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") triggerCardSwipe("left");
      else if (e.key === "ArrowRight") triggerCardSwipe("right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerCardSwipe]);

  // ----------------------------------------------------------------
  // 5. 렌더링
  // ----------------------------------------------------------------

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
                ref={cardRef} // ✅ Ref 연결 (필수)
                key={currentWord.id}
                word={currentWord}
                isFront={true}
                langCode={langCode}
                onSwipe={handleSwipeComplete} // ✅ 애니메이션 후 호출
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
