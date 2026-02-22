// src/pages/WordDeckList.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import "@/styles/pages/wordDeckList.css";

import FilterBar from "@/components/common/FilterBar";
import SearchBar from "@/components/common/SearchBar";
import Button from "@/components/common/Button";
import DeckCard from "@/components/cards/DeckCard";

import { ROUTES, generatePath } from "@/routes/AppRoutes";
import { useWordDeckList } from "@/hooks/pages/useWordDeckList";

const WordDeckList = ({ currentLangValue }) => {
  const navigate = useNavigate();

  // 🌟 분리한 훅 호출
  const {
    decks,
    loading,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    categories,
    openModal,
    handleDeleteClick,
  } = useWordDeckList(currentLangValue);

  if (loading) return <div className="v-loader" />;

  return (
    <div className="v-deck-list-page">
      <section className="v-deck-list-header">
        <p className="v-deck-welcome-msg">오늘도 암기 천재가 되어볼까요? 🚀</p>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="단어장 제목을 검색하세요"
        />
        <div className="v-filter-wrapper">
          <FilterBar
            items={categories}
            activeItem={activeTab}
            onSelect={setActiveTab}
          />
        </div>
      </section>

      <main className="v-deck-grid-container">
        {decks.length > 0 ? (
          <div className="v-home-grid">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                title={deck.deck_name} // DB 컬럼명에 맞춤
                wordCount={deck.total || 0}
                progress={deck.progress || 0}
                icon={deck.icon || "📁"}
                onClick={() =>
                  navigate(
                    generatePath(ROUTES.DECK_DETAIL, { deckId: deck.id }),
                  )
                }
                onEdit={() => openModal("DECK_EDIT", { deckData: deck })}
                onDelete={() => handleDeleteClick(deck)}
              />
            ))}
          </div>
        ) : (
          <div className="v-empty-state">
            <p>해당 언어의 단어장이 아직 없어요! 😅</p>
          </div>
        )}
      </main>

      <Button
        variant="fab"
        icon={<Plus size={28} />}
        onClick={() => openModal("DECK_ADD")}
        aria-label="새 단어장 추가"
      />
    </div>
  );
};

export default WordDeckList;
