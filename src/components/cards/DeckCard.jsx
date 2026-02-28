import React, { memo } from "react";
import { PencilLine, Trash2, BookOpen, Star } from "lucide-react";
import "@/styles/components/cards/deckCard.css";

const DeckCard = ({
  title,
  wordCount,
  progress = 0,
  icon,
  isFavorite = false,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const handleAction = (e, callback) => {
    e.stopPropagation();
    callback?.();
  };

  return (
    <div className="deck-card clickable-bounce" onClick={onClick}>
      <div className="deck-card-header">
        <div className="deck-card-main-info">
          <div className="deck-card-icon-wrapper">
            {icon ? (
              <span className="deck-emoji">{icon}</span>
            ) : (
              <BookOpen className="deck-default-icon" />
            )}
          </div>
          <div className="deck-text-content">
            <h4 className="deck-title">{title}</h4>
            <p className="deck-info">{wordCount.toLocaleString()}개 단어</p>
          </div>
        </div>
        <div className="deck-actions">
          <Star
            className={`action-icon favorite ${isFavorite ? "active" : ""}`}
            onClick={(e) => handleAction(e, onToggleFavorite)}
            fill={isFavorite ? "currentColor" : "none"}
          />
          <PencilLine
            className="action-icon"
            onClick={(e) => handleAction(e, onEdit)}
          />
          <Trash2
            className="action-icon danger"
            onClick={(e) => handleAction(e, onDelete)}
          />
        </div>
      </div>
      <div className="deck-card-footer">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-percent">{progress}%</span>
      </div>
    </div>
  );
};

export default memo(DeckCard, (prev, next) => {
  return (
    prev.title === next.title &&
    prev.wordCount === next.wordCount &&
    prev.progress === next.progress &&
    prev.isFavorite === next.isFavorite &&
    prev.icon === next.icon
  );
});
