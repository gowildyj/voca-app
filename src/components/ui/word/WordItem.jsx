import React from "react";
import {
  BookOpen,
  Edit3,
  Trash2,
  Volume2,
  Sparkles,
  Heart,
} from "lucide-react";
import "@/styles/components/ui/word/wordItem.css";

const WordItem = React.memo(
  ({ item, onEdit, onDelete, onPlay, onToggleFavorite, hideMode }) => {
    if (!item) return null;

    const isGuide = item.isGuide || false;
    const statusClass = item.status ? `status-${item.status}` : "";
    const isWordHidden = hideMode === "word";
    const isMeaningHidden = hideMode === "meaning";

    // 가이드 모드 (데이터 없음) 렌더링
    if (isGuide) {
      return (
        <div className="word-item-card guide-mode">
          <div className="section-audio">
            <Sparkles size={24} className="guide-icon" />
          </div>
          <div className="section-body" style={{ alignItems: "center" }}>
            <span className="word-text">첫 단어를 추가해보세요!</span>
            <span className="word-meaning">우측 하단 + 버튼을 눌러주세요</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`word-item-card ${statusClass}`}>
        {/* [섹션 1] 오디오/아이콘 (왼쪽) */}
        <div className="section-audio">
          <div
            className="word-item-icon"
            onClick={(e) => {
              e.stopPropagation();
              onPlay && onPlay(item.word);
            }}
          >
            <Volume2 size={20} />
          </div>
        </div>

        {/* [섹션 2] 단어 본문 (가운데 - 남는 공간 차지) */}
        <div className="section-body">
          <div className="word-text-wrapper">
            <span className={`word-text ${isWordHidden ? "masked" : ""}`}>
              {item.word}
            </span>
          </div>
          <span className={`word-meaning ${isMeaningHidden ? "masked" : ""}`}>
            {item.meaning}
          </span>
        </div>

        {/* [섹션 3] 액션 버튼들 (오른쪽) */}
        <div className="section-actions">
          {/* 1. 즐겨찾기 (하트) */}
          <button
            className={`action-btn favorite ${item.isFavorite ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(item.id);
            }}
            aria-label="즐겨찾기"
          >
            <Heart size={18} />
          </button>

          {/* 2. 수정 */}
          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(item);
            }}
            aria-label="수정"
          >
            <Edit3 size={18} />
          </button>

          {/* 3. 삭제 */}
          <button
            className="action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(item.id);
            }}
            aria-label="삭제"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  },
);

WordItem.displayName = "WordItem";

export default WordItem;
