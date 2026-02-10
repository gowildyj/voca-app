import React, { useState, useMemo } from "react";
import RenameDeckModal from "./RenameDeckModal";
import { motion } from "framer-motion";
import { Book, ChevronRight, PlusCircle, Trash2, Edit3 } from "lucide-react";

const Dashboard = ({
  decks, // ✅ 추가: 이제 단어장이 아닌 '덱' 리스트를 직접 받습니다.
  words, // 통계 계산용
  onSelectDeck,
  onAddDeck,
  onDeleteDeck,
  onRenameDeck,
}) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [targetDeck, setTargetDeck] = useState({ id: "", name: "" });

  // ✅ 덱 기반으로 통계 계산
  const deckStats = useMemo(() => {
    if (!decks) return [];

    return decks.map((deck) => {
      // 해당 덱에 속한 단어들 필터링
      const relatedWords = words.filter((w) => w.deck === deck.name);
      const total = relatedWords.length;
      const known = relatedWords.filter((w) => w.status === "know").length;
      const progress = total > 0 ? Math.round((known / total) * 100) : 0;

      return {
        id: deck.id,
        name: deck.name,
        total,
        known,
        progress,
      };
    });
  }, [decks, words]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>내 학습 덱</h1>
        <p style={{ opacity: 0.6 }}>오늘도 언어 천재가 되어볼까요? 🚀</p>
      </header>

      <div className="deck-grid">
        {/* 새로운 덱 만들기 카드 */}
        <motion.div
          className="deck-card add-card"
          whileHover={{ y: -5 }}
          onClick={onAddDeck}
        >
          <PlusCircle size={32} color="var(--primary)" />
          <span style={{ marginTop: "10px", fontWeight: "700" }}>
            새로운 덱 만들기
          </span>
        </motion.div>

        {/* ✅ 이제 deckStats(decks 테이블 기준)를 순회합니다. */}
        {deckStats.map((deck) => (
          <motion.div
            key={deck.id}
            className="deck-card"
            whileHover={{ y: -5 }}
            style={{ position: "relative" }}
            onClick={() => onSelectDeck(deck.name)}
          >
            {/* 버튼 그룹 */}
            <div
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                display: "flex",
                gap: "8px",
                zIndex: 10,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetDeck({ id: deck.id, name: deck.name });
                  setIsRenameOpen(true);
                }}
                className="deck-action-btn"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // ✅ 이제 id와 name을 같이 넘겨서 정확히 삭제하게 합니다.
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
              <ChevronRight size={18} opacity={0.3} />
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
        isOpen={isRenameOpen}
        deckId={targetDeck.id}
        oldName={targetDeck.name}
        onClose={() => setIsRenameOpen(false)}
        onRename={onRenameDeck}
      />
    </div>
  );
};

export default Dashboard;
