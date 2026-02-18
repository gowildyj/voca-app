import React, { useState, useEffect } from "react";
import { BookOpen, Edit3, Trash2, Volume2, Sparkles } from "lucide-react";
import { speak } from "@/utils/tts";

const WordItem = React.memo(
  ({ item, onEdit, onDelete, langCode, hideMode }) => {
    if (!item) return null;

    const isGuide = item.isGuide || false;
    const statusClass = item.status ? `status-${item.status}` : "";

    const [tempReveal, setTempReveal] = useState({
      word: false,
      meaning: false,
    });

    useEffect(() => {
      setTempReveal({ word: false, meaning: false });
    }, [hideMode]);

    const isWordHidden = hideMode === "word" && !tempReveal.word;
    const isMeaningHidden = hideMode === "meaning" && !tempReveal.meaning;

    const handleSpeak = (e) => {
      if (e) e.stopPropagation(); // 이벤트 전파 방지
      if (!isGuide && item.word) {
        speak(item.word, langCode);
      }
    };

    return (
      <div
        className={`word-item-card ${isGuide ? "guide-mode" : ""}${statusClass}`}
      >
        <div
          className="word-item-icon"
          onClick={!isGuide ? handleSpeak : undefined}
          style={{ cursor: !isGuide ? "pointer" : "default" }}
        >
          {isGuide ? (
            <Sparkles size={20} className="guide-icon" />
          ) : (
            // <BookOpen size={20} />
            <Volume2 size={18} />
          )}
        </div>

        <div className="word-item-content">
          <div className="word-text-wrapper">
            <span
              className={`word-text ${isWordHidden ? "masked" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setTempReveal((prev) => ({ ...prev, word: !prev.word }));
              }}
            >
              {item.word}
            </span>
            {/* {!isGuide && (
              <button
                onClick={handleSpeak}
                className="speaker-btn"
                aria-label="발음 듣기"
              >
                <Volume2 size={18} />
              </button>
            )} */}
          </div>
          <div
            className={`word-meaning ${isMeaningHidden ? "masked" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setTempReveal((prev) => ({ ...prev, meaning: !prev.meaning }));
            }}
          >
            {item.meaning}
          </div>
        </div>

        {!isGuide && (
          <div className="word-item-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(item);
              }}
              className="deck-action-btn"
              aria-label="수정"
            >
              <Edit3 size={16} />
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.id) onDelete(item.id);
                }}
                className="deck-action-btn"
                aria-label="삭제"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);

WordItem.displayName = "WordItem";

export default WordItem;
