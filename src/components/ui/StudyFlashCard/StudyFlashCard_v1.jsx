// src/components/ui/StudyFlashCard/StudyFlashCard.jsx
// 카드 클릭하면 flip

import React, { useState } from "react";
import styles from "./StudyFlashCard.module.css";

const StudyFlashCard = ({ item, onKnow, onUnknown }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // 🌟 카드 뒤집기 토글
  const handleFlip = () => setIsFlipped(!isFlipped);

  return (
    <div className={styles.container}>
      {/* 🌟 Tinder 스타일의 스와이프 가이드 (선택 사항) */}
      <div className={styles.swipeGuide}>
        <span className={styles.leftGuide}>← 몰라요</span>
        <span className={styles.rightGuide}>알아요 →</span>
      </div>

      <div
        className={`${styles.card} ${isFlipped ? styles.flipped : ""}`}
        onClick={handleFlip}
      >
        <div className={styles.stampBadges}>
          <div className={styles.stampUnknown}>몰라요</div>
          <div className={styles.stampKnown}>알아요</div>
        </div>
        {/* 앞면: 단어 영역 */}
        <div className={styles.cardFront}>
          <div className={styles.content}>
            {/* <span className={styles.label}>단어</span> */}
            <h2 className={styles.wordText}>{item.word}</h2>
          </div>
          <p className={styles.hint}>터치해서 뜻 확인</p>
        </div>

        {/* 뒷면: 뜻 및 예문 영역 */}
        <div className={styles.cardBack}>
          <div className={styles.content}>
            {/* <span className={styles.label}>뜻</span> */}
            <h2 className={styles.meaningText}>{item.meaning}</h2>
            {item.example && (
              <div className={styles.exampleBox}>
                <p className={styles.example}>{item.example}</p>
              </div>
            )}
          </div>
          <p className={styles.hint}>터치해서 단어 확인</p>
        </div>
      </div>

      {/* 🌟 하단 컨트롤 버튼 (스와이프 대용) */}
      <div className={styles.actionButtons}>
        <button className={styles.noBtn} onClick={() => onUnknown(item.id)}>
          ❌ 몰라요
        </button>
        <button className={styles.yesBtn} onClick={() => onKnow(item.id)}>
          ✅ 알아요
        </button>
      </div>
    </div>
  );
};

export default StudyFlashCard;
