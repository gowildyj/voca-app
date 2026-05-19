import React, { useState, useEffect, useCallback } from "react";
import { Volume2, Edit3, Trash2, Star } from "lucide-react";
import "@/styles/components/cards/wordCard.css";

const WordCard = ({
  item,
  onEdit,
  onDelete,
  onPlay,
  onToggleWordFavorite,
  hideMode,
}) => {
  const [tempShow, setTempShow] = useState(false);

  // 모드가 바뀌면 임시로 보여주던 것 다시 가리기
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

  const isRTL = (text) => {
    if (!text) return false;

    const rtlRegex =
      /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}]/u;
    return rtlRegex.test(text);
  };

  const wordDir = isRTL(item.word) ? "rtl" : "ltr";
  const meaningDir = isRTL(item.meaning) ? "rtl" : "ltr";
  const exampleDir = isRTL(item.example) ? "rtl" : "ltr";

  return (
    <div className={`v-word-card ${statusClass}`}>
      {/* 1. 오디오 버튼 */}
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

      {/* 2. 단어 본문 (클릭 시 가림 토글) */}
      <div
        className="v-word-body"
        onClick={handleBodyClick}
        style={{
          cursor: hideMode ? "pointer" : "default",
          textAlign: wordDir === "rtl" ? "right" : "left",
        }}
      >
        <div className="v-word-main-wrapper" dir={wordDir}>
          <span className={`v-word-main ${isWordHidden ? "v-masked" : ""}`}>
            {item.word}
          </span>
        </div>

        <div className="v-word-sub-wrapper" dir={meaningDir}>
          <span
            className={`v-word-sub ${hideMode === "meaning" && !tempShow ? "v-masked" : ""}`}
          >
            {item.meaning}
          </span>
        </div>

        {/* 🌟 예문 표시 (값이 있을 때만 렌더링) */}
        {item.example && (
          <span
            className={`v-word-sub example-text ${isMeaningHidden ? "v-masked" : ""}`}
            style={{
              marginTop: "4px",
              color: "#888",
              fontSize: "0.9em",
              fontStyle: "italic",
            }}
          >
            {item.example}
          </span>
        )}
      </div>

      {/* 3. 액션 버튼 (우측 세로) */}
      <div className="v-word-actions">
        <button
          className={`v-action-icon-btn favorite ${item.isFavorite ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWordFavorite &&
              onToggleWordFavorite(item.id, item.isFavorite);
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
};

// 🌟 React.memo 최적화
export default React.memo(WordCard, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.word === next.item.word &&
    prev.item.meaning === next.item.meaning &&
    prev.item.example === next.item.example &&
    prev.item.status === next.item.status &&
    prev.item.isFavorite === next.item.isFavorite &&
    prev.hideMode === next.hideMode
  );
});
