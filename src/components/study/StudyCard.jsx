import React, { useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { RotateCw, Volume2 } from "lucide-react";
import { speak } from "@/utils/tts";

const StudyCard = ({ word, onSwipe, langCode, feedback, setFeedback }) => {
  const [isFlipped, setIsFlipped] = useState(false);
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
    if (info.offset.x > SWIPE_THRESHOLD) onSwipe("right");
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("left");
  };

  const handleCardClick = () => {
    // 드래그가 거의 없을 때만 클릭으로 간주 (5px 미만 이동)
    if (Math.abs(x.get()) < 5) {
      setIsFlipped(!isFlipped);
    }
  };

  // 스피커 버튼 클릭 핸들러 (이벤트 전파 중단 핵심)
  const handleSpeakerClick = (e) => {
    e.stopPropagation(); // 부모(카드)로 클릭 이벤트가 전파되는 것을 막음
    speak(word.word, langCode);
  };

  return (
    <div className="study-card-wrapper">
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onClick={handleCardClick}
        whileDrag={{ scale: 1.02 }}
        className={`study-card-drag ${feedback ? `flash-${feedback}` : ""}`}
      >
        <div className={`study-card-inner ${isFlipped ? "flipped" : ""}`}>
          <div className="card-face front">
            <button
              onClick={handleSpeakerClick}
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
            <button
              onClick={handleSpeakerClick}
              className="card-speaker-btn"
              type="button"
            >
              <Volume2 size={20} />
            </button>
            <h2>{word.meaning}</h2>
            {word.example && <p>{word.example}</p>}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudyCard;
