import React, { useMemo } from "react"; // ✅ useMemo 추가됨
import { motion } from "framer-motion";
import { Book, ChevronRight, PlusCircle } from "lucide-react";

const Dashboard = ({ words, onSelectDeck, onAddDeck }) => {
  // 단어 데이터를 덱별로 그룹화하고 통계 계산
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
        {/* 새 덱 추가 카드 */}
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

        {/* 기존 덱 카드들 */}
        {deckStats.map((deck) => (
          <motion.div
            key={deck.name}
            className="deck-card"
            whileHover={{ y: -5 }}
            onClick={() => onSelectDeck(deck.name)}
          >
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
    </div>
  );
};

export default Dashboard;
