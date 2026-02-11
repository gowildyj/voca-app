import React, { useState, useMemo } from "react";
import RenameDeckModal from "./RenameDeckModal";
import { motion } from "framer-motion";
import { Book, ChevronRight, PlusCircle, Trash2, Edit3 } from "lucide-react";

const Dashboard = ({
  decks,
  words,
  onSelectDeck,
  onAddDeck,
  onDeleteDeck,
  onRenameDeck,
}) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [targetDeck, setTargetDeck] = useState({
    id: "",
    name: "",
    lang_code: "",
  });

  const deckStats = useMemo(() => {
    if (!decks) return [];
    return decks.map((deck) => {
      const relatedWords = words.filter((w) => w.deck === deck.name);
      const total = relatedWords.length;
      const known = relatedWords.filter((w) => w.status === "know").length;
      const progress = total > 0 ? Math.round((known / total) * 100) : 0;

      return { ...deck, total, known, progress };
    });
  }, [decks, words]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>내 학습 덱</h1>
        <p>오늘도 언어 천재가 되어볼까요? 🚀</p>
      </header>

      <div className="deck-grid">
        {/* 새로운 덱 만들기 카드 */}
        <motion.div
          className="deck-card add-card"
          whileHover={{ y: -5 }}
          onClick={onAddDeck}
        >
          <PlusCircle size={32} color="var(--primary)" />
          <span className="add-card-text">새로운 덱 만들기</span>
        </motion.div>

        {/* 덱 리스트 */}
        {deckStats.map((deck) => (
          <motion.div
            key={deck.id}
            className="deck-card"
            whileHover={{ y: -5 }}
            onClick={() => onSelectDeck(deck.name)}
          >
            {/* 상단 액션 버튼 그룹 */}
            <div className="deck-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetDeck({
                    id: deck.id,
                    name: deck.name,
                    lang_code: deck.lang_code,
                  });
                  setIsRenameOpen(true);
                }}
                className="deck-action-btn"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDeck(deck.id, deck.name);
                }}
                className="deck-action-btn"
              >
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
        ))}
      </div>

      <RenameDeckModal
        key={targetDeck.id}
        isOpen={isRenameOpen}
        deckId={targetDeck.id}
        oldName={targetDeck.name}
        oldLangCode={targetDeck.lang_code}
        onClose={() => setIsRenameOpen(false)}
        onRename={onRenameDeck}
      />
    </div>
  );
};

export default Dashboard;
