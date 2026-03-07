// src/components/ui/StudyFlashCard/StudyFlashCard.jsx
// 카드 뒤집지 않고, 텍스트만 바뀜

import React, { useState } from "react";
import styles from "./StudyFlashCard.module.css";

// src/components/ui/StudyFlashCard/StudyFlashCard.jsx

const StudyFlashCard = ({ item, onKnow, onUnknown }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className={styles.container}>
      {/* 🌟 800px 너비에 최적화된 고정형 카드 */}
      <div
        className={styles.wideCard}
        onClick={() => setIsRevealed(!isRevealed)}
      >
        {/* 앞면 (단어) - 정답 확인 전 */}
        <div
          className={`${styles.contentLayer} ${isRevealed ? styles.hide : styles.show}`}
        >
          <span className={styles.label}>단어</span>
          <h2 className={styles.wordLarge}>{item.word}</h2>
          <p className={styles.tapHint}>정답 확인하기</p>
        </div>

        {/* 뒷면 (뜻 + 예문) - 정답 확인 후 */}
        <div
          className={`${styles.contentLayer} ${isRevealed ? styles.show : styles.hide}`}
        >
          <div className={styles.revealedContent}>
            <div className={styles.meaningSection}>
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
          <p className={styles.tapHint}>다시 단어 보기</p>
        </div>
      </div>

      {/* 액션 버튼 (기존과 동일) */}
      <div className={styles.actionButtons}> ... </div>
    </div>
  );
};

export default StudyFlashCard;
