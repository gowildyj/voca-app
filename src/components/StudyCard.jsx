import React, { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw, Volume2 } from "lucide-react";
import { speak } from "../utils/tts";

const StudyCard = ({ word, onSwipe, langCode }) => {
  // ✅ langCode 추가
  const [isFlipped, setIsFlipped] = useState(false);

  if (!word) return null;

  const handleDragEnd = (event, info) => {
    // 100px 이상 드래그 시 스와이프 판정
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  };

  return (
    <div className="study-card-wrapper">
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
          className="study-card-inner"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          {/* 카드 앞면 (단어) */}
          <div className="card-face front">
            <button
              onPointerDown={(e) => e.stopPropagation()} // 1. 드래그 시작 방지
              onClick={(e) => {
                e.stopPropagation(); // 2. 카드 뒤집기 방지
                e.preventDefault(); // 3. 브라우저 기본 동작 방지
                speak(word.word, langCode);
              }}
              className="card-speaker-btn"
              type="button" // 폼 안에 있을 경우를 대비해 명시
            >
              <Volume2 size={20} />
            </button>
            <h2>{word.word}</h2>
            <div className="flip-hint">
              <RotateCw size={16} /> 클릭해서 뒤집기
            </div>
          </div>

          {/* 카드 뒷면 (뜻) */}
          <div className="card-face back">
            <h2>{word.meaning}</h2>
            {word.example && <p>{word.example}</p>}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudyCard;
