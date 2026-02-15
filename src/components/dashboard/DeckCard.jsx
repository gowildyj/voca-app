import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { Book, Trash2, Edit3 } from "lucide-react";

/**
 * React.memo를 사용하여 부모 컴포넌트가 리렌더링되어도
 * 해당 카드의 데이터가 변하지 않았다면 리렌더링을 완전히 차단합니다.
 */
const DeckCard = React.memo(({ deck, onSelect, onEdit, onDelete }) => {
  // 데이터 구조 분해 할당 및 기본값 방어 (예외 처리)
  const { deck_name = "이름 없는 덱", total = 0, progress = 0 } = deck || {};

  // 이벤트 버블링 방지를 위한 핸들러 메모이제이션 (성능 최적화)
  const handleAction = useCallback((e, callback) => {
    e.stopPropagation(); // 카드 클릭 이벤트(onSelect)로 번지는 것 차단
    if (callback) callback(e);
  }, []);

  return (
    <motion.div
      className="deck-card"
      // whileHover={{ y: -4, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      layout // 리스트 순서 변경 시 자연스러운 애니메이션 제공
    >
      <div className="deck-actions">
        <button
          onClick={(e) => handleAction(e, onEdit)}
          className="deck-action-btn edit"
          aria-label="단어장 수정"
          type="button"
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={(e) => handleAction(e, onDelete)}
          className="deck-action-btn delete"
          aria-label="단어장 삭제"
          type="button"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="deck-info">
        <div className="deck-icon">
          <Book size={20} />
        </div>
        <div className="deck-text">
          <h3 className="deck-title">{deck_name}</h3>
          <span className="deck-count">{total.toLocaleString()}개 단어</span>
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
