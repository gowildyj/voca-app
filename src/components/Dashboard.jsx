import React, { useState, useMemo } from "react";
import RenameDeckModal from "./RenameDeckModal";
import { motion } from "framer-motion";
import { Book, ChevronRight, PlusCircle, Trash2, Edit3 } from "lucide-react";

const Dashboard = ({
  words,
  onSelectDeck,
  onAddDeck,
  onDeleteDeck,
  onRenameDeck,
}) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [targetDeck, setTargetDeck] = useState("");

  const deckStats = useMemo(() => {
    if (!words) return [];
    const groups = words.reduce((acc, word) => {
      const deckName = word.deck || "기본 덱";
      if (!acc[deckName]) acc[deckName] = { total: 0, known: 0 };
      acc[deckName].total += 1;
      if (word.status === "know") acc[deckName].known += 1;
      return acc;
    }, {});

    return Object.entries(groups).map(([name, stat]) => ({
      name,
      ...stat,
      progress: Math.round((stat.known / stat.total) * 100) || 0,
    }));
  }, [words]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>내 학습 덱</h1>
        <p style={{ opacity: 0.6 }}>오늘도 언어 천재가 되어볼까요? 🚀</p>
      </header>

      <div className="deck-grid">
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

        {deckStats.map((deck) => (
          <motion.div
            key={deck.name}
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
                zIndex: 10, // 카드 클릭보다 우선순위 높임
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 카드 클릭 방지
                  setTargetDeck(deck.name);
                  setIsRenameOpen(true);
                }}
                className="deck-action-btn"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 카드 클릭 방지
                  onDeleteDeck(deck.name);
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

      {/* ✅ 중요: 모달은 map 밖으로 꺼내서 딱 하나만 렌더링합니다! */}
      <RenameDeckModal
        isOpen={isRenameOpen}
        oldName={targetDeck}
        onClose={() => setIsRenameOpen(false)}
        onRename={onRenameDeck}
      />
    </div>
  );
};

export default Dashboard;
