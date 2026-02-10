import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, CheckCircle, XCircle } from "lucide-react";

const StudyCard = ({ word, onSwipe }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // 카드를 던지는 로직
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
            }}
          >
            <h2 style={{ fontSize: "3rem", margin: 0 }}>{word.word}</h2>
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
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: 0 }}>{word.meaning}</h2>
            <p style={{ marginTop: "15px", opacity: 0.9, fontSize: "1.1rem" }}>
              {word.example}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* 가이드 아이콘 (드래그 시 살짝 보이면 좋음) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "-60px",
          color: "#ef4444",
          opacity: 0.2,
        }}
      >
        <XCircle size={48} />
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "-60px",
          color: "#10b981",
          opacity: 0.2,
        }}
      >
        <CheckCircle size={48} />
      </div>
    </div>
  );
};

export default StudyCard;
