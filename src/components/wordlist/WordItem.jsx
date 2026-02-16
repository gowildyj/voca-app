import React from "react";
import { BookOpen, Edit3, Trash2, Volume2, Sparkles } from "lucide-react";
import { speak } from "@/utils/tts";

const WordItem = React.memo(({ item, onEdit, onDelete, langCode }) => {
  if (!item) return null;

  const isGuide = item.isGuide || false;
  const statusClass = item.status ? `status-${item.status}` : "";

  return (
    <div
      className={`word-item-card ${isGuide ? "guide-mode" : ""}${statusClass}`}
    >
      <div className="word-item-icon">
        {isGuide ? (
          <Sparkles size={20} className="guide-icon" />
        ) : (
          <BookOpen size={20} />
        )}
      </div>

      <div className="word-item-content">
        <div className="word-text-wrapper">
          <span className="word-text">{item.word}</span>
          {!isGuide && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (item.word) speak(item.word, langCode);
              }}
              className="speaker-btn"
              aria-label="발음 듣기"
            >
              <Volume2 size={18} />
            </button>
          )}
        </div>
        <div className="word-meaning">{item.meaning}</div>
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
});

WordItem.displayName = "WordItem";

export default WordItem;
