import React from "react";
import { motion } from "framer-motion";
import { Book, Trash2, Edit3 } from "lucide-react";

const DeckCard = ({ deck, onSelect, onEdit, onDelete }) => {
  return (
    <motion.div className="deck-card" whileHover={{ y: -2 }} onClick={onSelect}>
      <div className="deck-actions">
        <button onClick={onEdit} className="deck-action-btn" aria-label="덱 수정">
          <Edit3 size={16} />
        </button>
        <button onClick={onDelete} className="deck-action-btn" aria-label="덱 삭제">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="deck-info">
        <div className="deck-icon">
          <Book size={18} />
        </div>
        <div className="deck-text">
          <h3>{deck.name}</h3>
          <span>{deck.total}개 단어</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-label">
          <span>진행률</span>
          <span>{deck.progress}%</span>
        </div>
        <div className="progress-bar-bg">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${deck.progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default DeckCard;
