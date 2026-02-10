import React, { useState } from "react";
import StudyCard from "./StudyCard";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, XCircle, CheckCircle } from "lucide-react";

const StudySession = ({ words, onFinish }) => {
  // 현재 학습 중인 단어 목록을 상태로 관리 (처음엔 전체 데이터)
  const [currentWords, setCurrentWords] = useState(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unknownWords, setUnknownWords] = useState([]);

  const isFinished = currentIndex >= currentWords.length;

  const handleSwipe = (direction) => {
    if (direction === "left") {
      setUnknownWords([...unknownWords, currentWords[currentIndex]]);
    }
    setCurrentIndex(currentIndex + 1);
  };

  // [추가] 모르는 단어만 다시 하기 함수
  const handleReviewUnknown = () => {
    setCurrentWords(unknownWords); // 학습 대상을 모르는 단어로 변경
    setCurrentIndex(0); // 인덱스 초기화
    setUnknownWords([]); // 모르는 단어 보관함 비우기
  };

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
          {/* 모르는 단어가 있을 때만 이 버튼을 보여줍니다 */}
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
