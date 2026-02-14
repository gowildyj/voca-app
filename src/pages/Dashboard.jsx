import React, { useState, useMemo } from "react";
import RenameDeckModal from "@/components/RenameDeckModal";
import AddWordModal from "@/components/AddWordModal";
import DeckCard from "@/components/dashboard/DeckCard";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";

const Dashboard = ({
  decks = [],
  words = [],
  loading,
  onSelectDeck,
  addDeck,
  deleteDeck,
  renameDeck,
}) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isAddDeckOpen, setIsAddDeckOpen] = useState(false);
  const [targetDeck, setTargetDeck] = useState({
    id: "",
    name: "",
    lang_code: "",
  });

  //  데이터 가공 로직: Props로 받은 데이터를 화면에 맞게 변환
  const deckStats = useMemo(() => {
    if (!decks) return [];
    return decks.map((deck) => {
      const relatedWords = words.filter((w) => w.deck_id === deck.id);
      const total = deck.total ?? relatedWords.length;
      const known = relatedWords.filter((w) => w.status === "know").length;
      const progress = total > 0 ? Math.round((known / total) * 100) : 0;

      return { ...deck, total, progress };
    });
  }, [decks, words]);

  // 핸들러 로직 추출
  const handleEditClick = (e, deck) => {
    e.stopPropagation();
    setTargetDeck({ id: deck.id, name: deck.name, lang_code: deck.lang_code });
    setIsRenameOpen(true);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">내 학습 덱</h1>
        <p className="dashboard-subtitle">오늘도 언어 천재가 되어볼까요? 🚀</p>
      </header>

      <div className="deck-grid">
        <motion.div
          className="deck-card add-card"
          whileHover={{ y: -2 }}
          onClick={() => setIsAddDeckOpen(true)}
        >
          <PlusCircle size={28} color="var(--primary)" />
          <span className="add-card-text">새 덱 만들기</span>
        </motion.div>

        {loading ? (
          <div className="deck-grid-loading" aria-hidden>
            <span>불러오는 중...</span>
          </div>
        ) : (
          deckStats.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onSelect={() => onSelectDeck(deck.name)}
              onEdit={(e) => handleEditClick(e, deck)}
              onDelete={(e) => {
                e.stopPropagation();
                deleteDeck(deck.id, deck.name);
              }}
            />
          ))
        )}
      </div>

      <AddWordModal
        isOpen={isAddDeckOpen}
        mode="deck"
        onClose={() => setIsAddDeckOpen(false)}
        onAddDeck={addDeck}
      />

      <RenameDeckModal
        key={targetDeck.id}
        isOpen={isRenameOpen}
        deckId={targetDeck.id}
        oldName={targetDeck.name}
        oldLangCode={targetDeck.lang_code}
        onClose={() => setIsRenameOpen(false)}
        onRename={renameDeck}
      />
    </div>
  );
};

export default Dashboard;
