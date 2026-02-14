import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { speak } from "@/utils/tts";
import StudyCard from "@/components/StudyCard";
import StudyHeader from "@/components/study/StudyHeader"; // ✅ [분리] 헤더 추출
import StudyFinishView from "@/components/study/StudyFinishView"; // ✅ [분리] 결과화면 추출
import { AnimatePresence, motion } from "framer-motion";
import { XCircle, CheckCircle } from "lucide-react";

const StudySession = ({ words, decks, onFinish, onUpdateStatus }) => {
  const { deckName: urlDeckParam } = useParams();
  const currentDeckName = decodeURIComponent(urlDeckParam || "");

  const currentDeck = decks?.find((d) => d.name === currentDeckName);
  const langCode = currentDeck?.lang_code;

  const [feedback, setFeedback] = useState(null); // 'know' | 'unknown' | null
  const [currentWords, setCurrentWords] = useState(words ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unknownWords, setUnknownWords] = useState([]);
  const [autoPlay, setAutoPlay] = useState(true);
  const lastPlayedIndex = useRef(-1);

  const isFinished = currentIndex >= currentWords.length;
  const currentWord = currentWords[currentIndex];
  const isEmpty = currentWords.length === 0;

  // ✅ 음성 자동 재생 로직
  useEffect(() => {
    if (
      currentWord &&
      autoPlay &&
      !isFinished &&
      lastPlayedIndex.current !== currentIndex
    ) {
      const timer = setTimeout(() => {
        speak(currentWord.word, langCode);
        lastPlayedIndex.current = currentIndex;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentWord, autoPlay, isFinished, langCode]);

  // ✅ [로직 최적화] 스와이프 핸들러
  const handleSwipe = useCallback(
    (direction) => {
      if (isFinished) return;
      const wordToUpdate = currentWords[currentIndex];

      // 상태 업데이트 로직을 명확하게 분리
      if (direction === "left") {
        setUnknownWords((prev) => [...prev, wordToUpdate]);
        onUpdateStatus(wordToUpdate.id, "unknown");
        setFeedback("unknown");
      } else {
        onUpdateStatus(wordToUpdate.id, "know");
        setFeedback("know");
      }
      setTimeout(() => setFeedback(null), 500);
      setCurrentIndex((prev) => prev + 1);
    },
    [isFinished, currentWords, currentIndex, onUpdateStatus],
  );

  // ✅ [로직 최적화] 복습 핸들러
  const handleReviewUnknown = () => {
    lastPlayedIndex.current = -1;
    setCurrentWords(unknownWords);
    setCurrentIndex(0);
    setUnknownWords([]);
  };

  // 키보드 핸들러: 좌/우 화살표로 몰라/알아 표시
  useEffect(() => {
    const onKey = (e) => {
      if (isFinished) return;
      if (e.key === "ArrowLeft") {
        handleSwipe("left");
      } else if (e.key === "ArrowRight") {
        handleSwipe("right");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFinished, currentIndex, currentWords, handleSwipe]);

  if (isEmpty) {
    return (
      <div className="finish-container">
        <p className="finish-title">학습할 단어가 없습니다</p>
        <p className="result-row">
          단어장에서 단어를 추가한 뒤 학습을 시작해주세요.
        </p>
        <button
          onClick={() => onFinish(currentDeckName)}
          className="btn-primary"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <StudyFinishView
        totalCount={currentWords.length}
        unknownCount={unknownWords.length}
        onReview={handleReviewUnknown}
        onBack={() => onFinish(currentDeckName)}
      />
    );
  }

  // 남은 단어 셔플 함수
  const handleShuffleRemaining = () => {
    const past = currentWords.slice(0, currentIndex);
    const remaining = currentWords.slice(currentIndex);

    // 피셔-예이츠 셔플 알고리즘
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    setCurrentWords([...past, ...remaining]);
  };

  // 이전 카드로 돌아가기 (간단 버전)
  const handleGoBack = () => {
    if (currentIndex <= 0) return;

    const prevIndex = currentIndex - 1;
    const prevWord = currentWords[prevIndex];

    // 몰라 목록에서 제거 (있었다면)
    setUnknownWords((prev) => prev.filter((w) => w.id !== prevWord.id));

    // 인덱스 복구
    setCurrentIndex(prevIndex);
    lastPlayedIndex.current = prevIndex - 1; // 다시 읽어주기 위해 리셋
  };

  return (
    <div className="App">
      <div className="study-main-container">
        <StudyHeader
          currentIndex={currentIndex}
          totalCount={currentWords.length}
          autoPlay={autoPlay}
          onToggleAutoPlay={() => setAutoPlay(!autoPlay)}
          onBack={() => onFinish(currentDeckName)}
          onShuffle={handleShuffleRemaining}
          onUndo={handleGoBack}
        />
        <div
          className={`study-card-area ${feedback ? `flash-${feedback}` : ""}`}
        >
          <AnimatePresence mode="wait">
            {currentWord && (
              <StudyCard
                key={currentWord.id}
                word={currentWord}
                langCode={langCode}
                onSwipe={handleSwipe}
              />
            )}
          </AnimatePresence>
        </div>

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
            <span className="count">{currentIndex - unknownWords.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySession;
