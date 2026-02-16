import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useWordsContext } from "@/hooks/useWordsContext";
import { useStudyLogic } from "@/hooks/useStudyLogic";
import {
  useStudyPersistence,
  clearStudySession,
} from "@/hooks/useStudyPersistence";
import StudyCard from "@/components/study/StudyCard";
import StudyHeader from "@/components/study/StudyHeader";
import StudyFinishView from "@/components/study/StudyFinishView";
import { AnimatePresence } from "framer-motion";
import { speak } from "@/utils/tts";

const StudySession = () => {
  const navigate = useNavigate();
  const { deckName: urlDeckParam } = useParams();
  const { decks, updateWordStatus, onFinish, fetchWordsByDeck } =
    useWordsContext();
  const cardRef = useRef(null);

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

  const logic = useStudyLogic([], updateWordStatus);

  const { loading } = useStudyPersistence(
    currentDeckId,
    logic.currentWords,
    logic.currentIndex,
    logic.unknownWords,
    logic.knownWords,
    (state) => {
      logic.setCurrentWords(state.currentWords);
      logic.setCurrentIndex(state.currentIndex);
      logic.setUnknownWords(state.unknownWords);
      logic.setKnownWords(state.knownWords);
    },
  );

  const isFinished =
    logic.currentIndex >= logic.currentWords.length &&
    logic.currentWords.length > 0;
  const currentWord = logic.currentWords[logic.currentIndex];
  const nextWord = logic.currentWords[logic.currentIndex + 1];

  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter") || "all";
  const sortParam = searchParams.get("sort") || "default";

  useEffect(() => {
    if (!loading && logic.currentWords.length === 0 && currentDeckId) {
      fetchWordsByDeck(currentDeckId).then((data) => {
        if (data) {
          let processed = data.filter((word) => {
            if (filterParam === "all") return true;
            if (filterParam === "none")
              return !word.status || word.status === "none";
            return word.status === filterParam;
          });

          if (sortParam === "alpha") {
            processed.sort((a, b) => a.word.localeCompare(b.word));
          } else if (sortParam === "shuffle") {
            processed.sort(() => Math.random() - 0.5);
          }

          logic.setCurrentWords(processed);
        }
      });
    }
  }, [currentDeckId, loading, logic, fetchWordsByDeck, filterParam, sortParam]);

  const triggerCardSwipe = useCallback(
    (direction) => {
      if (isFinished || loading || logic.isAnimating) return;
      if (cardRef.current) {
        logic.setIsAnimating(true);
        cardRef.current.triggerSwipe(direction);
      }
    },
    [isFinished, loading, logic],
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFinished || loading || logic.isAnimating) return;
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName))
        return;
      if (e.key === "ArrowLeft") triggerCardSwipe("left");
      if (e.key === "ArrowRight") triggerCardSwipe("right");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFinished, loading, logic, triggerCardSwipe]);

  useEffect(() => {
    if (
      logic.autoPlay &&
      currentWord &&
      !isFinished &&
      !loading &&
      !logic.isAnimating &&
      logic.lastPlayedIndex.current !== logic.currentIndex
    ) {
      // 카드가 교체되는 애니메이션 시간을 고려해 약간의 딜레이를 줍니다.
      const timer = setTimeout(() => {
        speak(currentWord.word, langCode);
        logic.lastPlayedIndex.current = logic.currentIndex;
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [
    logic.currentIndex,
    currentWord,
    logic.autoPlay,
    isFinished,
    loading,
    langCode,
    logic.isAnimating,
    logic,
  ]);

  const handleExit = useCallback(() => {
    clearStudySession();
    if (onFinish) onFinish(currentDeckName);
    navigate("/");
  }, [currentDeckName, navigate, onFinish]);

  const handleToList = useCallback(() => {
    clearStudySession();
    if (onFinish) onFinish(currentDeckName);

    const params = new URLSearchParams();
    if (filterParam !== "all") params.append("filter", filterParam);
    if (sortParam !== "default") params.append("sort", sortParam);

    const queryString = params.toString();
    const suffix = queryString ? `?${queryString}` : "";

    navigate(`/list/${encodeURIComponent(currentDeckName)}${suffix}`);
  }, [currentDeckName, navigate, onFinish, filterParam, sortParam]);

  if (loading)
    return (
      <div className="loading-screen flex-center">
        <p>데이터 동기화 중...</p>
      </div>
    );

  if (isFinished) {
    return (
      <StudyFinishView
        totalCount={logic.currentWords.length}
        unknownCount={logic.unknownWords.length}
        onReview={logic.handleReviewUnknown}
        onBack={handleToList}
      />
    );
  }

  return (
    <div className="App study-session-page">
      <div className="study-main-container">
        <StudyHeader
          currentIndex={logic.currentIndex}
          totalCount={logic.currentWords.length}
          onUndo={logic.handleUndo}
          onShuffle={logic.handleShuffle}
          autoPlay={logic.autoPlay}
          onToggleAutoPlay={logic.handleToggleAutoPlay}
          onBack={handleToList}
        />

        <main className="study-card-area">
          {nextWord && (
            <StudyCard
              key={nextWord.id + "-back"}
              word={nextWord}
              isFront={false}
              langCode={langCode}
            />
          )}

          <AnimatePresence mode="wait">
            {currentWord && (
              <StudyCard
                ref={cardRef}
                key={currentWord.id}
                word={currentWord}
                isFront={true}
                langCode={langCode}
                onSwipe={(dir) => {
                  logic.handleSwipeComplete(dir, currentWord);
                  logic.setIsAnimating(false);
                }}
              />
            )}
          </AnimatePresence>
        </main>

        {/* ✅ 기존 스코어 보드 디자인 복구 */}
        <div className="study-score-board">
          <div
            className="score-item unknown"
            onClick={() => triggerCardSwipe("left")}
          >
            <span className="label">몰라요</span>
            <span className="count">{logic.unknownWords.length}</span>
          </div>
          <div
            className="score-item know"
            onClick={() => triggerCardSwipe("right")}
          >
            <span className="label">알아요</span>
            <span className="count">{logic.knownWords.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StudySession);
