import React, { useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { RotateCw, Volume2 } from "lucide-react";
import { speak } from "@/utils/tts";

const StudyCard = ({ word, onSwipe, langCode, feedback, setFeedback }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // 1. x 값을 실시간 추적하기 위해 생성
  const x = useMotionValue(0);

  if (!word) return null;

  const SWIPE_THRESHOLD = 50;
  const handleDrag = (event, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) setFeedback("know");
    else if (info.offset.x < -SWIPE_THRESHOLD) setFeedback("unknown");
    else setFeedback(null);
  };

  const handleDragEnd = (event, info) => {
    setFeedback(null);
    if (SWIPE_THRESHOLD) onSwipe("right");
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("left");
  };

  const handleCardClick = () => {
    // 2. 임계값을 5px 정도로 설정하여 '미세한 움직임'은 클릭으로 간주
    // 기존 < 0 조건을 < 5로 수정했습니다.
    if (Math.abs(x.get()) < 5) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div className="study-card-wrapper">
      <motion.div
        style={{ x }} // 3. ⭐ 필수: x 값을 motion.div의 스타일과 동기화
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={handleCardClick} // onTap은 내부적으로 드래그와 클릭을 구분하는 데 유리함
        whileDrag={{ scale: 1.02 }}
        className={`study-card-drag ${feedback ? `flash-${feedback}` : ""}`}
      >
        <div className={`study-card-inner ${isFlipped ? "flipped" : ""}`}>
          <div className="card-face front">
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                speak(word.word, langCode);
              }}
              onClick={(e) => e.stopPropagation()}
              className="card-speaker-btn"
              type="button"
            >
              <Volume2 size={20} />
            </button>
            <h2>{word.word}</h2>
            <div className="flip-hint">
              <RotateCw size={16} /> 클릭해서 뒤집기
            </div>
          </div>

          <div className="card-face back">
            <h2>{word.meaning}</h2>
            {word.example && <p>{word.example}</p>}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudyCard;
