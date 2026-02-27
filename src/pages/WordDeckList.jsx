import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import "@/styles/pages/wordDeckList.css";

// 공통 컴포넌트
import SearchBar from "@/components/common/SearchBar";
import Button from "@/components/common/Button";
import DeckCard from "@/components/cards/DeckCard";
import AddDeckCard from "@/components/cards/AddDeckCard";

// 라우트 및 커스텀 훅
import { ROUTES, generatePath } from "@/routes/AppRoutes";
import { useWordDeckList } from "@/hooks/pages/useWordDeckList";

import { LANG_OPTIONS } from "@/constants/languages";

const WordDeckList = ({ currentLangValue }) => {
  const navigate = useNavigate();

  const {
    decks,
    loading,
    searchQuery,
    setSearchQuery,
    onAddDeck,
    onEditDeck,
    handleDeleteClick,
    fetchDecks,
  } = useWordDeckList(currentLangValue);

  useEffect(() => {
    fetchDecks();
  }, [currentLangValue]);

  const getLangIcon = (langCode) => {
    const target = LANG_OPTIONS.find((lang) => lang.value === langCode);
    return target ? target.icon : "";
  };

  if (loading) return <div className="v-loader" />;

  return (
    <>
      <div className="v-deck-list-page">
        <section className="v-deck-list-header">
          <p className="v-deck-welcome-msg">
            오늘도 암기 천재가 되어볼까요? 🚀
          </p>
          <SearchBar
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(typeof e === "string" ? e : e.target.value)
            }
            placeholder="단어장 제목을 검색하세요"
          />
        </section>

        <main className="v-deck-grid-container">
          {decks.length > 0 ? (
            <div className="v-home-grid">
              {decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  title={deck.name}
                  wordCount={deck.total || 0}
                  progress={deck.progress || 0}
                  icon={deck.icon?.icon || getLangIcon(deck.language)}
                  onClick={() =>
                    navigate(
                      generatePath(ROUTES.DECK_DETAIL, { deckId: deck.id }),
                    )
                  }
                  onEdit={() => onEditDeck(deck)}
                  onDelete={() => handleDeleteClick(deck)}
                />
              ))}
            </div>
          ) : (
            <div className="v-empty-container">
              <AddDeckCard searchQuery={searchQuery} onClick={onAddDeck} />
            </div>
          )}
        </main>
      </div>
      <Button
        variant="fab"
        icon={<Plus size={28} />}
        onClick={onAddDeck}
        aria-label="새 단어장 추가"
      />
    </>
  );
};

export default WordDeckList;
