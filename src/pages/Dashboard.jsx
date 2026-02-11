import React, { useState, useMemo } from "react";
import RenameDeckModal from "@/components/RenameDeckModal";
import DeckCard from "@/components/dashboard/DeckCard";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";

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

  //  데이터 가공 로직: Props로 받은 데이터를 화면에 맞게 변환
  const deckStats = useMemo(() => {
    if (!decks) return [];
    return decks.map((deck) => {
      // 만약 useWords에서 이미 total을 계산해서 보내준다면 이 로직은 더 간소화될 수 있습니다.
      const relatedWords = words.filter((w) => w.deck === deck.name);
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

        {/*  분리된 DeckCard 컴포넌트 사용 */}
        {deckStats.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onSelect={() => onSelectDeck(deck.name)}
            onEdit={(e) => handleEditClick(e, deck)}
            onDelete={(e) => {
              e.stopPropagation();
              onDeleteDeck(deck.id, deck.name);
            }}
          />
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
