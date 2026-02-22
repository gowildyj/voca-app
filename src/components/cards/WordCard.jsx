import React, { useState, useEffect, useCallback } from "react";
import { Volume2, Edit3, Trash2, Heart, Sparkles } from "lucide-react";
import { playText } from "@/utils/ttsUtils";
import "@/styles/components/cards/wordCard.css";

const WordCard = React.memo(
  ({ item, onEdit, onDelete, onPlay, onToggleFavorite, hideMode }) => {
    const [tempShow, setTempShow] = useState(false);

    useEffect(() => {
      setTempShow(false);
    }, [hideMode]);

    if (!item) return null;

    const isGuide = item.isGuide || false;
    const statusClass = item.status ? `status-${item.status}` : "";
    const isWordHidden = hideMode === "word" && !tempShow;
    const isMeaningHidden = hideMode === "meaning" && !tempShow;

    const handleBodyClick = useCallback(() => {
      if (hideMode) {
        setTempShow((prev) => !prev);
      }
    }, [hideMode]);

    // 1. 가이드 모드 (데이터가 없을 때 표시되는 빈 카드)
    if (isGuide) {
      return (
        <div className="v-word-card guide-mode">
          <div className="v-word-icon-section">
            <Sparkles size={22} className="guide-icon" />
          </div>
          <div className="v-word-body">
            <span className="v-word-main">첫 단어를 추가해보세요!</span>
            <span className="v-word-sub">우측 하단 + 버튼을 눌러주세요</span>
          </div>
          {/* 일반 카드와 크기를 맞추기 위해 보이지 않는 액션 영역 유지 */}
          <div className="v-word-actions" style={{ visibility: "hidden" }}>
            <div className="v-action-icon-btn">
              <Edit3 size={18} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`v-word-card ${statusClass} clickable-bounce`}>
        {/* [섹션 1] 오디오 버튼 */}
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

        {/* [섹션 2] 단어 본문 */}
        <div
          className="v-word-body"
          onClick={handleBodyClick}
          style={{ cursor: hideMode ? "pointer" : "default" }}
        >
          <div className="v-word-main-wrapper">
            {/* 🌟 수정: v-masked 클래스 바인딩 */}
            <span className={`v-word-main ${isWordHidden ? "v-masked" : ""}`}>
              {item.word}
            </span>
          </div>
          {/* 🌟 수정: v-masked 클래스 바인딩 */}
          <span className={`v-word-sub ${isMeaningHidden ? "v-masked" : ""}`}>
            {item.meaning}
          </span>
        </div>

        {/* [섹션 3] 액션 버튼 (세로 배치) */}
        <div className="v-word-actions">
          {/* <button
            className={`v-action-icon-btn favorite ${item.isFavorite ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(item.id);
            }}
            aria-label="즐겨찾기"
          >
            <Heart size={16} fill={item.isFavorite ? "currentColor" : "none"} />
          </button> */}

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

export default WordCard;
