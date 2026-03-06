// src/components/ui/VocabItem/VocabItem.jsx
import React from "react";
import { Star, Volume2 } from "lucide-react";
import styles from "./VocabItem.module.css";

const VocabItem = ({
  item,
  hideMode,
  revealedIds,
  onReveal,
  onPlayAudio,
  onToggleFavorite,
}) => {
  const isWordHidden =
    hideMode === "word" && !revealedIds.includes(`${item.id}-word`);
  const isMeaningHidden =
    hideMode === "meaning" && !revealedIds.includes(`${item.id}-meaning`);

  const isExampleHidden = isWordHidden || isMeaningHidden;

  return (
    <div className={styles.vocabItem}>
      <div className={styles.vocabMain}>
        <div className={styles.wordRow}>
          <div className="hide-wrapper">
            <span
              className={`${styles.wordText} ${isWordHidden ? "hide-text" : ""}`}
            >
              {item.word}
            </span>
            {isWordHidden && (
              <div
                className="hide-overlay"
                onClick={() => onReveal(`${item.id}-word`)}
              />
            )}
          </div>
          <div className={styles.vocabActions}>
            {/* <button className={styles.iconBtn} onClick={onPlayAudio}>
              <Volume2 size={18} />
            </button> */}
            <button className={styles.iconBtn} onClick={onToggleFavorite}>
              <Star
                size={25}
                className={item.isFavorite ? styles.starActive : ""}
                fill={item.isFavorite ? "var(--warning)" : "none"}
              />
            </button>
          </div>
        </div>

        <div className={`${styles.meaningRow} hide-wrapper`}>
          <span
            className={`${styles.meaningText} ${isMeaningHidden ? "hide-text" : ""}`}
          >
            {item.meaning}
          </span>
          {isMeaningHidden && (
            <div
              className="hide-overlay"
              onClick={() => onReveal(`${item.id}-meaning`)}
            />
          )}
        </div>

        {item.example && (
          <div
            className={`${styles.exampleBox} ${isExampleHidden ? "hide-text" : ""}`}
          >
            <p
              className={`${styles.exampleText} ${isExampleHidden ? "hide-text" : ""}`}
            >
              {item.example}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabItem;
