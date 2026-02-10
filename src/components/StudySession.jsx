import React, { useState, useEffect, useRef } from "react";
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

const StudySession = ({ words, onFinish, onUpdateStatus }) => {
  const [currentWords, setCurrentWords] = useState(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unknownWords, setUnknownWords] = useState([]);
  const [autoPlay, setAutoPlay] = useState(true);
  const lastPlayedIndex = useRef(-1);

  const isFinished = currentIndex >= currentWords.length;
  const currentWord = currentWords[currentIndex];

  // ✅ 음성 자동 재생 로직 (안정성을 위해 50ms 지연)
  useEffect(() => {
    // 1. 단어가 있고, 자동재생이 켜져 있고, 아직 종료 전일 때
    // 2. ✅ 핵심: 마지막으로 소리 낸 인덱스가 현재 인덱스와 다를 때만 실행
    if (
      currentWord &&
      autoPlay &&
      !isFinished &&
      lastPlayedIndex.current !== currentIndex
    ) {
      const timer = setTimeout(() => {
        speak(currentWord.word, currentWord.deck);
        // 소리를 냈다면 현재 인덱스를 기록
        lastPlayedIndex.current = currentIndex;
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentWord, autoPlay, isFinished]);

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

  // ✅ 학습 완료 화면 (중략 없이 전체 포함)
  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ textAlign: "center", padding: "40px 20px" }}
      >
        <h2 style={{ fontSize: "2rem", fontWeight: "800" }}>학습 완료! 🎉</h2>
        <div
          style={{
            margin: "30px 0",
            padding: "24px",
            backgroundColor: "var(--card)",
            borderRadius: "24px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
          }}
        >
          <p style={{ marginBottom: "10px" }}>
            전체 단어: <strong>{currentWords.length}</strong>
          </p>
          <p style={{ color: "#ef4444", fontWeight: "bold" }}>
            모르는 단어: {unknownWords.length}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {unknownWords.length > 0 && (
            <button
              onClick={handleReviewUnknown}
              style={{
                width: "100%",
                padding: "18px",
                borderRadius: "18px",
                backgroundColor: "var(--text)",
                color: "var(--bg)",
                border: "none",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <RotateCcw size={18} /> 모르는 단어만 복습하기
            </button>
          )}

          <button
            onClick={onFinish}
            style={{
              width: "100%",
              padding: "18px",
              borderRadius: "18px",
              backgroundColor: "var(--primary)",
              color: "white",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            목록으로 돌아가기
          </button>
        </div>
      </motion.div>
    );
  }

  // ✅ 학습 진행 화면 (안전 장치 추가)
  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "40px",
        }}
      >
        <button
          onClick={onFinish}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text)",
          }}
        >
          <ArrowLeft size={24} />
        </button>

        <div style={{ fontWeight: "800", fontSize: "1.1rem" }}>
          {currentIndex + 1} / {currentWords.length}
        </div>

        <button
          onClick={() => setAutoPlay(!autoPlay)}
          style={{
            background: autoPlay ? "rgba(108, 92, 231, 0.1)" : "#eee",
            border: "none",
            padding: "8px",
            borderRadius: "12px",
            color: autoPlay ? "var(--primary)" : "#999",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {autoPlay ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </header>

      <AnimatePresence mode="wait">
        {/* currentWord가 존재할 때만 StudyCard를 렌더링하도록 방어 */}
        {currentWord && (
          <StudyCard
            key={currentWord.id}
            word={currentWord}
            onSwipe={handleSwipe}
          />
        )}
      </AnimatePresence>

      <div
        style={{
          marginTop: "60px",
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          opacity: 0.3,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <XCircle size={32} />
          <div
            style={{ fontSize: "0.75rem", marginTop: "8px", fontWeight: "600" }}
          >
            모름 (좌)
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <CheckCircle size={32} />
          <div
            style={{ fontSize: "0.75rem", marginTop: "8px", fontWeight: "600" }}
          >
            알음 (우)
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySession;
