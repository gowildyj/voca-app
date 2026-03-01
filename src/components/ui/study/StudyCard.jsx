import React from "react";
import { motion } from "framer-motion";
import { Volume2, Star } from "lucide-react";
import { playText } from "@/utils/ttsUtils";
import "@/styles/components/ui/study/studyCard.css";

const StudyCard = ({
  cardData,
  x,
  y,
  rotate,
  controls,
  isFlipped,
  swipeDirection,
  onFlip,
  onSwipeAction,
  onToggleWordFavorite,
  isNextPreview,
  language,
  viewMode = "frontFirst",
}) => {
  if (!cardData) return null;

  const isBackFirst = viewMode === "backFirst";
  const frontContent = isBackFirst ? cardData.meaning : cardData.word;
  const backContent = isBackFirst ? cardData.word : cardData.meaning;
  const frontClass = isBackFirst ? "meaning-text" : "word-text";
  const backClass = isBackFirst ? "word-text" : "meaning-text";

  // 다음 카드 프리뷰 모드
  if (isNextPreview) {
    return (
      <div className="study-card-container preview next-card-preview">
        <div className="card-motion-wrapper">
          <div
            className="card-icons-layer"
            style={{
              zIndex: 20,
              transform: "translateZ(10px)",
            }}
          >
            <button className="icon-btn volume">
              <Volume2 size={24} />
            </button>
            <button className="icon-btn favorite">
              <Star size={24} />
            </button>
          </div>
          <div
            className="card-inner preview-mode"
            style={{ border: "2px solid transparent" }}
          >
            <div className="card-face card-front">
              <span className={frontClass}>{frontContent}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getBorderStyle = () => {
    if (swipeDirection === "right") return "#10b981";
    if (swipeDirection === "left") return "#ef4444";
    return "transparent";
  };

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 80 || velocity > 500) {
      onSwipeAction("right");
    } else if (offset < -80 || velocity < -500) {
      onSwipeAction("left");
    } else {
      controls.start({ x: 0, y: 0, opacity: 1 });
    }
  };

  return (
    <div className="study-card-container">
      <motion.div
        className="card-motion-wrapper"
        style={{ x, y, rotate, cursor: "grab" }}
        animate={controls}
        whileTap={{ cursor: "grabbing" }}
        drag={true}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        onClick={onFlip}
      >
        <div
          className="card-icons-layer"
          style={{
            zIndex: 20,
            transform: "translateZ(10px)",
          }}
        >
          <button
            className="icon-btn volume"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              playText(cardData.word, language || "en-US");
            }}
          >
            <Volume2 size={24} />
          </button>
          <button
            className={`icon-btn favorite ${cardData.isFavorite ? "active" : ""}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWordFavorite &&
                onToggleWordFavorite(cardData.id, cardData.isFavorite);
            }}
          >
            <Star
              size={24}
              fill={cardData.isFavorite ? "currentColor" : "none"}
            />
          </button>
        </div>

        <motion.div
          className="card-inner"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
          }}
          style={{
            border: "2px solid",
            borderColor: getBorderStyle(),
            transformStyle: "preserve-3d",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {/* 앞면 */}
          <div
            className="card-face card-front"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className={frontClass}>{frontContent}</span>
          </div>

          {/* 뒷면 */}
          <div
            className="card-face card-back"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <span className={backClass}>{backContent}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudyCard;
