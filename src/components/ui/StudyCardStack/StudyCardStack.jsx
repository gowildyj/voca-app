// src/components/ui/StudyCardStack/StudyCardStack.jsx
import React from "react";
import StudyFlashCard from "@/components/ui/StudyFlashCard/StudyFlashCard";
import { Star, Volume2 } from "lucide-react";
import styles from "./StudyCardStack.module.css";

const StudyCardStack = ({ items, currentIndex, onKnow, onUnknown }) => {
  const currentItem = items[currentIndex];
  const nextItem = items[currentIndex + 1];

  return (
    <div className={styles.stackContainer}>
      {currentItem ? (
        <>
          {/* 1. 배경 카드: 앞 카드와 똑같은 위치에 대기 */}

          {/* 1. 배경 카드: 앞 카드와 100% 동일한 비주얼 */}
          <div className={`${styles.baseCard} ${styles.backCard}`}>
            {nextItem ? (
              <>
                {/* 🌟 배경 카드 툴바 (모양만 똑같이!) */}
                <div className={styles.leftToolbar}>
                  <div className={styles.fakeIconBtn}>
                    <Volume2 size={25} />
                  </div>
                </div>
                <div className={styles.rightToolbar}>
                  <div
                    className={`${styles.fakeIconBtn} ${nextItem.isFavorite ? styles.activeStar : ""}`}
                  >
                    <Star
                      size={25}
                      fill={nextItem.isFavorite ? "#EAB308" : "none"}
                      stroke={nextItem.isFavorite ? "#EAB308" : "currentColor"}
                    />
                  </div>
                </div>

                <div className={styles.nextPreview}>
                  <span className={styles.nextLabel}>단어</span>
                  <h2 className={styles.nextWord}>{nextItem.word}</h2>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>마지막 카드입니다 🏁</p>
              </div>
            )}
          </div>

          {/* 2. 현재 활성화된 카드 */}
          <StudyFlashCard
            key={currentItem.id}
            item={currentItem}
            onKnow={onKnow}
            onUnknown={onUnknown}
          />
        </>
      ) : (
        <div className={styles.finishBox}>
          <h2>🎉 학습을 모두 마쳤습니다!</h2>
          <button
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            다시 시작하기
          </button>
        </div>
      )}
    </div>
  );
};

export default StudyCardStack;
