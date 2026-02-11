import React from "react";
import { motion } from "framer-motion";
import { Book, ChevronRight, Trash2, Edit3 } from "lucide-react";

const DeckCard = ({ deck, onSelect, onEdit, onDelete }) => {
  return (
    <motion.div className="deck-card" whileHover={{ y: -5 }} onClick={onSelect}>
      <div className="deck-actions">
        <button onClick={onEdit} className="deck-action-btn">
          <Edit3 size={16} />
        </button>
        <button onClick={onDelete} className="deck-action-btn">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="deck-info">
        <div className="deck-icon">
          <Book size={20} />
        </div>
        <div className="deck-text">
          <h3>{deck.name}</h3>
          <span>{deck.total}개 단어</span>
        </div>
        <ChevronRight size={18} className="chevron-icon" />
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
