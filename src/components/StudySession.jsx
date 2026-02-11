import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom"; // ✅ 추가
import { speak } from "../utils/tts";
import StudyCard from "./StudyCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RotateCcw,
  XCircle,
  CheckCircle,
  Volume2,
  VolumeX,
} from "lucide-react";

const StudySession = ({ words, decks, onFinish, onUpdateStatus }) => {
  // ✅ [수정] URL에서 덱 이름을 가져와서 langCode를 직접 찾습니다.
  const { deckName: urlDeckParam } = useParams();
  const currentDeckName = decodeURIComponent(urlDeckParam || "");

  const currentDeck = decks.find((d) => d.name === currentDeckName);
  const langCode = currentDeck?.lang_code;

  const [currentWords, setCurrentWords] = useState(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unknownWords, setUnknownWords] = useState([]);
  const [autoPlay, setAutoPlay] = useState(true);
  const lastPlayedIndex = useRef(-1);

  const isFinished = currentIndex >= currentWords.length;
  const currentWord = currentWords[currentIndex];

  // ✅ 음성 자동 재생 (langCode 연결 완료)
  useEffect(() => {
    if (
      currentWord &&
      autoPlay &&
      !isFinished &&
      lastPlayedIndex.current !== currentIndex
    ) {
      const timer = setTimeout(() => {
        speak(currentWord.word, langCode); // 이제 정확한 언어로 읽습니다.
        lastPlayedIndex.current = currentIndex;
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentWord, autoPlay, isFinished, langCode]);

  const handleSwipe = (direction) => {
    if (isFinished) return;
    const wordToUpdate = currentWords[currentIndex];

    if (direction === "left") {
      setUnknownWords((prev) => [...prev, wordToUpdate]);
      onUpdateStatus(wordToUpdate.id, "unknown");
    } else {
      onUpdateStatus(wordToUpdate.id, "know");
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleReviewUnknown = () => {
    lastPlayedIndex.current = -1;
    setCurrentWords(unknownWords);
    setCurrentIndex(0);
    setUnknownWords([]);
  };

  // ✅ finish-container 등 스타일 클래스 적용됨
  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="finish-container"
      >
        <h2 className="finish-title">학습 완료! 🎉</h2>
        <div className="result-card">
          <p className="result-row">
            전체 단어: <strong>{currentWords.length}</strong>
          </p>
          <p
            className="result-row"
            style={{ color: "#ef4444", fontWeight: "bold" }}
          >
            모르는 단어: {unknownWords.length}
          </p>
        </div>

        <div className="btn-group">
          {unknownWords.length > 0 && (
            <button onClick={handleReviewUnknown} className="btn-secondary">
              <RotateCcw size={18} /> 모르는 단어만 복습하기
            </button>
          )}
          {/* ✅ onFinish 호출 시 현재 덱 이름을 넘겨줍니다. */}
          <button
            onClick={() => onFinish(currentDeckName)}
            className="btn-primary"
          >
            목록으로 돌아가기
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="App">
      <header className="study-header">
        {/* ✅ onFinish 호출 시 현재 덱 이름을 넘겨줍니다. */}
        <button onClick={() => onFinish(currentDeckName)} className="back-btn">
          <ArrowLeft size={24} />
        </button>

        <div className="study-progress-text">
          {currentIndex + 1} / {currentWords.length}
        </div>

        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className="autoplay-btn"
          style={{
            backgroundColor: autoPlay
              ? "rgba(108, 92, 231, 0.1)"
              : "var(--card)",
            color: autoPlay ? "var(--primary)" : "#999",
          }}
        >
          {autoPlay ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </header>

      <AnimatePresence mode="wait">
        {currentWord && (
          <StudyCard
            key={currentWord.id}
            word={currentWord}
            langCode={langCode} // ✅ 자식에게 정확히 전달
            onSwipe={handleSwipe}
          />
        )}
      </AnimatePresence>

      <div className="swipe-guide">
        <div className="guide-item">
          <XCircle size={32} />
          <div className="guide-text">모름 (좌)</div>
        </div>
        <div className="guide-item">
          <CheckCircle size={32} />
          <div className="guide-text">알음 (우)</div>
        </div>
      </div>
    </div>
  );
};

export default StudySession;
