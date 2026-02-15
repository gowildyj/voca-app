import React from "react";
import { BookOpen, Edit3, Trash2, Volume2, Sparkles } from "lucide-react";
import { speak } from "@/utils/tts";

const WordItem = React.memo(({ item, onEdit, onDelete, langCode }) => {
  if (!item) return null;

  const isGuide = item.isGuide || false;

  return (
    <div className={`word-item-card ${isGuide ? "guide-mode" : ""}`}>
      {/* 1. 왼쪽 아이콘 */}
      <div className="word-item-icon">
        {isGuide ? (
          <Sparkles size={20} className="guide-icon" />
        ) : (
          <BookOpen size={20} />
        )}
      </div>

      {/* 2. 중앙 텍스트 콘텐츠 */}
      <div className="word-item-content">
        <div className="word-text-wrapper">
          <span className="word-text">{item.word}</span>
          {!isGuide && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(item.word, langCode); // langCode가 'auto'면 speak 내부에서 다시 감지함
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

      {/* 3. 우측 상단 수정/삭제 버튼 (Absolute Position) */}
      {!isGuide && (
        <div className="word-item-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
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
                onDelete(item.id);
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

export default WordItem;
