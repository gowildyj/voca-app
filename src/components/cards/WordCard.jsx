import React, { useState, useEffect, useCallback } from "react";
import { Volume2, Edit3, Trash2, Star } from "lucide-react";
import { playText } from "@/utils/ttsUtils";
import "@/styles/components/cards/wordCard.css";

const WordCard = React.memo(
  ({
    item,
    onAddWord,
    onEdit,
    onDelete,
    onPlay,
    onToggleFavorite,
    hideMode,
  }) => {
    const [tempShow, setTempShow] = useState(false);

    useEffect(() => {
      setTempShow(false);
    }, [hideMode]);

    if (!item) return null;

    const statusClass = item.status ? `status-${item.status}` : "";
    const isWordHidden = hideMode === "word" && !tempShow;
    const isMeaningHidden = hideMode === "meaning" && !tempShow;

    const handleBodyClick = useCallback(() => {
      if (hideMode) {
        setTempShow((prev) => !prev);
      }
    }, [hideMode]);

    return (
      // <div className={`v-word-card ${statusClass} clickable-bounce`}>
      <div className={`v-word-card ${statusClass}`}>
        {/* 오디오 버튼 */}
        <div className="v-word-icon-section">
          <button
            className="v-word-audio-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (onPlay) onPlay(item.word);
            }}
            aria-label="발음 듣기"
          >
            <Volume2 size={20} />
          </button>
        </div>

        {/* 단어 본문 */}
        <div
          className="v-word-body"
          onClick={handleBodyClick}
          style={{ cursor: hideMode ? "pointer" : "default" }}
        >
          <div className="v-word-main-wrapper">
            <span className={`v-word-main ${isWordHidden ? "v-masked" : ""}`}>
              {item.word}
            </span>
          </div>
          <span className={`v-word-sub ${isMeaningHidden ? "v-masked" : ""}`}>
            {item.meaning}
          </span>
        </div>

        {/* 액션 버튼 (세로 배치) */}
        <div className="v-word-actions">
          <button
            className={`v-action-icon-btn favorite ${item.isFavorite ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(item.id);
            }}
            aria-label="즐겨찾기"
          >
            <Star size={16} fill={item.isFavorite ? "currentColor" : "none"} />
          </button>

          <button
            className="v-action-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(item);
            }}
            aria-label="수정"
          >
            <Edit3 size={16} />
          </button>

          <button
            className="v-action-icon-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(item.id);
            }}
            aria-label="삭제"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  },
);

WordCard.displayName = "WordCard";

export default React.memo(WordCard, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.word === next.item.word &&
    prev.item.meaning === next.item.meaning &&
    prev.item.status === next.item.status &&
    prev.item.isFavorite === next.item.isFavorite && // 즐겨찾기 상태 체크
    prev.hideMode === next.hideMode // 가리기 모드 체크
  );
});
