import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWordsContext } from "@/hooks/useWordsContext";
import { useModal } from "@/contexts/ModalContext";
import DeckCard from "@/components/dashboard/DeckCard";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, LayoutGrid } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const { decks, loading, deleteDeck, updateDeck, addDeck, refresh } =
    useWordsContext();

  useEffect(() => {
    if (refresh) refresh();
  }, [refresh]);

  const memoizedDecks = useMemo(() => {
    return Array.isArray(decks) ? decks : [];
  }, [decks]);

  const handleSelectDeck = (deckName) => {
    navigate(`/list/${encodeURIComponent(deckName)}`);
  };

  const handleEditClick = (deck) => {
    openModal("EDIT_DECK", {
      deckId: deck.id,
      oldName: deck.deck_name,
      oldLangCode: deck.lang_code,
      onRename: updateDeck,
    });
  };

  const handleDeleteClick = (deck) => {
    if (window.confirm(`"${deck.deck_name}" 덱을 삭제하시겠습니까?`)) {
      deleteDeck(deck.id, deck.deck_name);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">내 단어장</h1>
        <p className="dashboard-subtitle">오늘도 암기 천재가 되어볼까요? 🚀</p>
      </header>

      <div className="deck-grid">
        <motion.div
          className="deck-card add-card"
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            openModal("ADD_DECK", { mode: "deck", onAddDeck: addDeck })
          }
        >
          <PlusCircle size={28} color="var(--primary)" />
          <span className="add-card-text">새 단어장 만들기</span>
        </motion.div>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="deck-card skeleton-card animate-pulse" />
          ))
        ) : (
          <AnimatePresence>
            {" "}
            {memoizedDecks.length > 0 ? (
              memoizedDecks.map((deck) => (
                <motion.div
                  key={deck.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <DeckCard
                    deck={deck}
                    onSelect={() => handleSelectDeck(deck.deck_name)}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                </motion.div>
              ))
            ) : (
              <div className="empty-state">
                <LayoutGrid size={40} opacity={0.2} />
                <p>
                  아직 생성된 단어장이 없네요.
                  <br />첫 번째 단어장을 만들어보세요!
                </p>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
