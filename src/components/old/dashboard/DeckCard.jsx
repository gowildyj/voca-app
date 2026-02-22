import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { Book, Trash2, Edit3 } from "lucide-react";

const DeckCard = React.memo(({ deck, onSelect, onEdit, onDelete }) => {
  const {
    deck_name = "이름 없는 덱",
    total = 0,
    progress: rawProgress = 0,
  } = deck || {};

  const progress = Math.min(100, Math.max(0, rawProgress));

  // ✅ 리팩토링 포인트: 부모(Dashboard)는 deck 객체만 받으면 됩니다.
  const handleEdit = useCallback(
    (e) => {
      e.stopPropagation(); // 카드 클릭 방지
      if (onEdit) onEdit(deck); // 부모에 deck 객체만 전달
    },
    [deck, onEdit],
  );

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation(); // 카드 클릭 방지
      if (onDelete) onDelete(deck); // 부모에 deck 객체만 전달
    },
    [deck, onDelete],
  );

  return (
    <motion.div
      className="deck-card"
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      layout
    >
      <div className="deck-actions">
        <button
          onClick={handleEdit}
          className="deck-action-btn edit"
          aria-label={`${deck_name} 수정`}
          type="button"
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={handleDelete}
          className="deck-action-btn delete"
          aria-label={`${deck_name} 삭제`}
          type="button"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* 이하 디자인 코드는 동일하므로 생략 */}
      <div className="deck-info">
        <div className="deck-icon">
          <Book size={20} />
        </div>
        <div className="deck-text">
          <h3 className="deck-title">{deck_name}</h3>
          <span className="deck-count">
            {Number(total).toLocaleString()}개 단어
          </span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-label">
          <span>진행률</span>
          <span className="progress-value">{progress}%</span>
        </div>
        <div className="progress-bar-bg">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          />
        </div>
      </div>
    </motion.div>
  );
});

DeckCard.displayName = "DeckCard";

export default DeckCard;
