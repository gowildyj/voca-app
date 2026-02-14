import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { speak } from "@/utils/tts";
import StudyCard from "@/components/StudyCard";
import StudyHeader from "@/components/study/StudyHeader"; // ✅ [분리] 헤더 추출
import StudyFinishView from "@/components/study/StudyFinishView"; // ✅ [분리] 결과화면 추출
import { AnimatePresence } from "framer-motion";
import { XCircle, CheckCircle } from "lucide-react";

const StudySession = ({ words, decks, onFinish, onUpdateStatus }) => {
  const { deckName: urlDeckParam } = useParams();
  const currentDeckName = decodeURIComponent(urlDeckParam || "");

  const currentDeck = decks?.find((d) => d.name === currentDeckName);
  const langCode = currentDeck?.lang_code;

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
  const handleSwipe = (direction) => {
    if (isFinished) return;
    const wordToUpdate = currentWords[currentIndex];

    // 상태 업데이트 로직을 명확하게 분리
    if (direction === "left") {
      setUnknownWords((prev) => [...prev, wordToUpdate]);
      onUpdateStatus(wordToUpdate.id, "unknown");
    } else {
      onUpdateStatus(wordToUpdate.id, "know");
    }

    setCurrentIndex((prev) => prev + 1);
  };

  // ✅ [로직 최적화] 복습 핸들러
  const handleReviewUnknown = () => {
    lastPlayedIndex.current = -1;
    setCurrentWords(unknownWords);
    setCurrentIndex(0);
    setUnknownWords([]);
  };

  if (isEmpty) {
    return (
      <div className="finish-container">
        <p className="finish-title">학습할 단어가 없습니다</p>
        <p className="result-row">단어장에서 단어를 추가한 뒤 학습을 시작해주세요.</p>
        <button onClick={() => onFinish(currentDeckName)} className="btn-primary">
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

  return (
    <div className="App">
      {/* ✅ [분리 적용] 학습 헤더 */}
      <StudyHeader
        currentIndex={currentIndex}
        totalCount={currentWords.length}
        autoPlay={autoPlay}
        onToggleAutoPlay={() => setAutoPlay(!autoPlay)}
        onBack={() => onFinish(currentDeckName)}
      />

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

      <div className="swipe-guide">
        <div className="guide-item">
          <XCircle size={32} />
          <div className="guide-text">몰라 (좌)</div>
        </div>
        <div className="guide-item">
          <CheckCircle size={32} />
          <div className="guide-text">알아 (우)</div>
        </div>
      </div>
    </div>
  );
};

export default StudySession;
