import React, { useState, useRef } from "react";
import { Star, Volume2 } from "lucide-react";
import styles from "./StudyFlashCard.module.css";

const StudyFlashCard = ({ item, onKnow, onUnknown, onToggleFavorite }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState(null);
  const [isBtnClicking, setIsBtnClicking] = useState(false);
  const dragStart = useRef({ x: 0 });

  const SWIPE_THRESHOLD = 150;
  const MAX_OPACITY = 0.8;

  const handleStart = (e) => {
    if (exitDirection) return;
    setIsDragging(true);
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    dragStart.current = { x: clientX };
  };

  const handleMove = (e) => {
    if (!isDragging || exitDirection) return;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const x = clientX - dragStart.current.x;
    setDragOffset({ x, y: x * 0.1 });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (isBtnClicking) {
      setIsBtnClicking(false);
      return;
    }

    const distance = Math.abs(dragOffset.x);

    if (distance < 10) {
      setIsRevealed((prev) => !prev);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    if (dragOffset.x > SWIPE_THRESHOLD) {
      setExitDirection("right");
      setTimeout(() => onKnow(item.id), 200);
    } else if (dragOffset.x < -SWIPE_THRESHOLD) {
      setExitDirection("left");
      setTimeout(() => onUnknown(item.id), 200);
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleBtnAction = (direction) => {
    if (exitDirection) return;
    setExitDirection(direction);
    setTimeout(() => {
      if (direction === "right") onKnow(item.id);
      else onUnknown(item.id);
    }, 250);
  };

  const getColor = () => {
    if (exitDirection === "right") return `rgba(34, 197, 94, ${MAX_OPACITY})`;
    if (exitDirection === "left") return `rgba(239, 68, 68, ${MAX_OPACITY})`;

    const currentOpacity = Math.min(
      Math.abs(dragOffset.x) / SWIPE_THRESHOLD,
      MAX_OPACITY,
    );

    if (dragOffset.x > 0) return `rgba(34, 197, 94, ${currentOpacity})`;
    if (dragOffset.x < 0) return `rgba(239, 68, 68, ${currentOpacity})`;

    return "var(--border)";
  };

  const getCardStyle = () => {
    if (exitDirection === "right")
      return {
        transform: "translateX(1500px) rotate(60deg)",
        borderColor: getColor(),
        transition: "all 0.3s ease-in",
      };

    if (exitDirection === "left")
      return {
        transform: "translateX(-1500px) rotate(-60deg)",
        borderColor: getColor(),
        transition: "all 0.3s ease-in",
      };

    return {
      transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.03}deg)`,
      borderColor: getColor(),
      transition: isDragging
        ? "none"
        : "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    };
  };

  const onBtnDown = (e) => {
    e.stopPropagation();
    setIsBtnClicking(true);
  };

  const handleSpeak = (e, text) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    window.speechSynthesis.speak(utterance);
    setIsBtnClicking(false);
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.wideCard}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={getCardStyle()}
      >
        {/* 상단 툴바: 스피커(좌), 즐겨찾기(우) */}
        <div className={styles.leftToolbar}>
          <button
            className={styles.iconBtn}
            onMouseDown={onBtnDown}
            onClick={(e) => handleSpeak(e, item.word)}
          >
            <Volume2 size={25} />
          </button>
        </div>

        <div className={styles.rightToolbar}>
          <button
            className={`${styles.iconBtn} ${item.isFavorite ? styles.activeStar : ""}`}
            onMouseDown={onBtnDown}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
              setIsBtnClicking(false);
            }}
          >
            <Star
              size={25}
              fill={item.isFavorite ? "#EAB308" : "none"}
              stroke={item.isFavorite ? "#EAB308" : "currentColor"}
            />
          </button>
        </div>

        {/* 앞면: 단어 영역 */}
        <div
          className={`${styles.contentLayer} ${isRevealed ? styles.hide : styles.show}`}
        >
          <span className={styles.label}>단어</span>
          <h2 className={styles.wordLarge}>{item.word}</h2>
        </div>

        {/* 뒷면: 뜻 + 예문 영역 */}
        <div
          className={`${styles.contentLayer} ${isRevealed ? styles.show : styles.hide}`}
        >
          <div className={styles.revealedContent}>
            <div className={styles.section}>
              <span className={styles.label}>뜻</span>
              <h2 className={styles.meaningLarge}>{item.meaning}</h2>
            </div>
            {item.example && (
              <div className={styles.exampleSection}>
                <span className={styles.label}>예문</span>
                <p className={styles.exampleText}>{item.example}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className={styles.actionButtons}>
        <button
          className={styles.noBtn}
          onClick={() => handleBtnAction("left")}
        >
          ❌ 몰라요
        </button>
        <button
          className={styles.yesBtn}
          onClick={() => handleBtnAction("right")}
        >
          ✅ 알아요
        </button>
      </div>
    </div>
  );
};

export default StudyFlashCard;
