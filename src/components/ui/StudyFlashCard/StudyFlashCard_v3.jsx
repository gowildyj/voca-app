// src/components/ui/StudyFlashCard/StudyFlashCard.jsx
// 카드 클릭하면 위아래로 스와이프

import React, { useState } from "react";
import styles from "./StudyFlashCard.module.css";

// src/components/ui/StudyFlashCard/StudyFlashCard.jsx

// src/components/ui/StudyFlashCard/StudyFlashCard.jsx

const StudyFlashCard = ({ item, onKnow, onUnknown }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className={styles.container}>
      {/* 🌟 외곽 틀은 고정! */}
      <div
        className={styles.fixedFrame}
        onClick={() => setIsRevealed(!isRevealed)}
      >
        <div
          className={`${styles.contentSlider} ${isRevealed ? styles.moveUp : ""}`}
        >
          {/* 앞면 영역 */}
          <div className={styles.slidePanel}>
            <span className={styles.label}>단어</span>
            <h2 className={styles.wordLarge}>{item.word}</h2>
            <p className={styles.hintText}>클릭해서 뜻 보기</p>
          </div>

          {/* 뒷면 영역 */}
          <div className={styles.slidePanel}>
            <div className={styles.meaningGroup}>
              <span className={styles.label}>뜻</span>
              <h2 className={styles.meaningLarge}>{item.meaning}</h2>
            </div>
            {item.example && (
              <div className={styles.exampleGroup}>
                <span className={styles.label}>예문</span>
                <p className={styles.exampleText}>{item.example}</p>
              </div>
            )}
            <p className={styles.hintText}>클릭해서 단어 다시보기</p>
          </div>
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className={styles.actionButtons}> ... </div>
    </div>
  );
};

export default StudyFlashCard;
