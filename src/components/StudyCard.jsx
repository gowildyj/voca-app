import React, { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw, Volume2 } from "lucide-react";
import { speak } from "../utils/tts";

const StudyCard = ({ word, onSwipe }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // 데이터가 없을 경우 에러 방지
  if (!word) return null;

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onSwipe("right"); // 아는 단어
    } else if (info.offset.x < -100) {
      onSwipe("left"); // 모르는 단어
    }
  };

  return (
    <div
      className="study-card-wrapper"
      style={{
        position: "relative",
        height: "400px",
        width: "100%",
        perspective: "1000px",
      }}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05 }}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          touchAction: "none",
        }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
          }}
        >
          {/* 카드 앞면 (단어) */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              backgroundColor: "var(--card)",
              borderRadius: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              border: "2px solid var(--bg)",
              overflow: "hidden",
            }}
          >
            {/* ✅ 스피커 아이콘: 우측 상단 배치 */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // 카드 뒤집기 이벤트 전파 차단
                speak(word.word, word.deck);
              }}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(108, 92, 231, 0.1)",
                border: "none",
                borderRadius: "12px",
                padding: "10px",
                color: "var(--primary)",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              <Volume2 size={20} />
            </button>

            <h2 style={{ fontSize: "3rem", margin: 0, fontWeight: "800" }}>
              {word?.word}
            </h2>
            <div
              style={{
                marginTop: "20px",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.9rem",
                opacity: 0.6,
              }}
            >
              <RotateCw size={16} /> 클릭해서 뒤집기
            </div>
          </div>

          {/* 카드 뒷면 (뜻) */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              backgroundColor: "var(--primary)",
              color: "white",
              borderRadius: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              transform: "rotateY(180deg)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>{word?.meaning}</h2>
            <p style={{ marginTop: "15px", opacity: 0.9, fontSize: "1.1rem" }}>
              {word?.example}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudyCard;
