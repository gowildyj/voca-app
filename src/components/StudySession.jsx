import React, { useState } from "react";
import StudyCard from "./StudyCard";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, XCircle, CheckCircle } from "lucide-react";

const StudySession = ({ words, onFinish, onUpdateStatus }) => {
  const [currentWords, setCurrentWords] = useState(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unknownWords, setUnknownWords] = useState([]);

  const isFinished = currentIndex >= currentWords.length;

  const handleSwipe = (direction) => {
    const currentWord = currentWords[currentIndex];

    if (direction === "left") {
      // 왼쪽 스와이프: 모르는 단어
      setUnknownWords([...unknownWords, currentWord]);
      onUpdateStatus(currentWord.id, "unknown");
    } else {
      // 오른쪽 스와이프: 아는 단어
      onUpdateStatus(currentWord.id, "know");
    }

    setCurrentIndex(currentIndex + 1);
  };

  const handleReviewUnknown = () => {
    setCurrentWords(unknownWords);
    setCurrentIndex(0);
    setUnknownWords([]);
  };

  // ✅ 여기가 에러가 났던 지점입니다. 함수 블록 내부여야 합니다.
  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ textAlign: "center", padding: "40px 20px" }}
      >
        <h2 style={{ fontSize: "2rem" }}>학습 완료! 🎉</h2>
        <div
          style={{
            margin: "30px 0",
            padding: "20px",
            backgroundColor: "var(--card)",
            borderRadius: "20px",
          }}
        >
          <p>전체 단어: {currentWords.length}</p>
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
                padding: "16px",
                borderRadius: "16px",
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
              padding: "16px",
              borderRadius: "16px",
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

  return (
    <div style={{ padding: "20px" }}>
      <header
        style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}
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
        <div style={{ flex: 1, textAlign: "center", fontWeight: "700" }}>
          {currentIndex + 1} / {currentWords.length}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <StudyCard
          key={currentWords[currentIndex].id}
          word={currentWords[currentIndex]}
          onSwipe={handleSwipe}
        />
      </AnimatePresence>

      <div
        style={{
          marginTop: "50px",
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          opacity: 0.4,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <XCircle size={32} />
          <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>모름 (좌)</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <CheckCircle size={32} />
          <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>
            아는 단어 (우)
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySession;
