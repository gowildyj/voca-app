import React, { useState, useMemo, useEffect, useCallback } from "react";
import UpdateDeckModal from "@/components/common/modals/UpdateDeckModal";
import AddWordModal from "@/components/common/modals/AddWordModal";
import DeckCard from "@/components/dashboard/DeckCard";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle } from "lucide-react";

const Dashboard = ({
  decks = [],
  loading,
  onSelectDeck,
  addDeck,
  deleteDeck,
  updateDeck,
  refresh,
}) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isAddDeckOpen, setIsAddDeckOpen] = useState(false);

  // 초기값을 null로 설정하여 불필요한 객체 생성을 방지합니다.
  const [targetDeck, setTargetDeck] = useState(null);

  // 컴포넌트 마운트 시 데이터 갱신
  useEffect(() => {
    if (refresh) refresh();
  }, [refresh]);

  // ✅ 불필요한 가공 없이 decks를 그대로 사용하되, 메모이제이션으로 렌더링 최적화
  const memoizedDecks = useMemo(() => {
    return Array.isArray(decks) ? decks : [];
  }, [decks]);

  // 핸들러들을 useCallback으로 감싸 자식 컴포넌트의 리렌더링을 방지합니다. (성능 핵심)
  const handleEditClick = useCallback((e, deck) => {
    e.stopPropagation();
    setTargetDeck(deck);
    setIsRenameOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    (e, deck) => {
      e.stopPropagation();
      if (window.confirm(`"${deck.deck_name}" 덱을 삭제하시겠습니까?`)) {
        deleteDeck(deck.id, deck.deck_name);
      }
    },
    [deleteDeck],
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">내 단어장</h1>
        <p className="dashboard-subtitle">오늘도 암기 천재가 되어볼까요? 🚀</p>
      </header>

      <div className="deck-grid">
        {/* 새 덱 만들기 카드 */}
        <motion.div
          className="deck-card add-card"
          // whileHover={{ y: -4, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddDeckOpen(true)}
        >
          <PlusCircle size={28} color="var(--primary)" />
          <span className="add-card-text">새 단어장 만들기</span>
        </motion.div>

        {loading ? (
          <div className="deck-grid-loading">
            <span>불러오는 중...</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {memoizedDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onSelect={() => onSelectDeck(deck.deck_name)}
                onEdit={(e) => handleEditClick(e, deck)}
                onDelete={(e) => handleDeleteClick(e, deck)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* 모달: 불필요한 렌더링을 막기 위해 조건부 렌더링 적용 */}
      {isAddDeckOpen && (
        <AddWordModal
          isOpen={isAddDeckOpen}
          mode="deck"
          onClose={() => setIsAddDeckOpen(false)}
          onAddDeck={addDeck}
        />
      )}

      {isRenameOpen && targetDeck && (
        <UpdateDeckModal
          key={targetDeck.id}
          isOpen={isRenameOpen}
          deckId={targetDeck.id}
          oldName={targetDeck.deck_name}
          oldLangCode={targetDeck.lang_code}
          onClose={() => {
            setIsRenameOpen(false);
            setTargetDeck(null);
          }}
          onRename={updateDeck}
        />
      )}
    </div>
  );
};

export default Dashboard;
