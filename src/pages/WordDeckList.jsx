// src/pages/WordDeckList.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import "@/styles/pages/wordDeckList.css";

// 공통 컴포넌트
import SearchBar from "@/components/common/SearchBar";
import Button from "@/components/common/Button";
import DeckCard from "@/components/cards/DeckCard";
import AddDeckCard from "@/components/cards/AddDeckCard";
import DeckSkeleton from "@/components/skeletons/DeckSkeleton";
import FilterTabs from "@/components/common/FilterTabs";

// 라우트 및 커스텀 훅
import { ROUTES, generatePath } from "@/routes/AppRoutes";
import { useWordDeckList } from "@/hooks/pages/useWordDeckList";
import { LANG_OPTIONS } from "@/constants/languages";

const WordDeckList = ({ currentLangValue }) => {
  const navigate = useNavigate();

  // 필터 상태 관리 ('all' | 'favorite')
  const [currentFilter, setCurrentFilter] = useState("all");

  const {
    decks, // 전체 덱 리스트
    loading,
    searchQuery,
    setSearchQuery,
    onAddDeck,
    onEditDeck,
    handleDeleteClick,
    fetchDecks,
    onToggleDeckFavorite,
  } = useWordDeckList(currentLangValue);

  useEffect(() => {
    fetchDecks(currentLangValue);
  }, [currentLangValue, fetchDecks]);

  // 필터 탭 설정
  const filterOptions = [
    { id: "all", label: "전체" },
    { id: "favorite", label: "즐겨찾기" },
  ];

  // 필터링된 덱 리스트 계산 (useMemo로 최적화)
  const filteredDecks = useMemo(() => {
    if (currentFilter === "favorite") {
      return decks.filter((deck) => deck.isFavorite);
    }
    return decks;
  }, [decks, currentFilter]);

  // 각 탭에 표시할 개수 계산
  const filterCounts = useMemo(() => {
    return {
      all: decks.length,
      favorite: decks.filter((d) => d.isFavorite).length,
    };
  }, [decks]);

  const getLangIcon = (langCode) => {
    const target = LANG_OPTIONS.find((lang) => lang.value === langCode);
    return target ? target.icon : "";
  };

  return (
    <>
      <div className="v-deck-list-page">
        <section className="v-deck-list-header">
          <p className="v-deck-welcome-msg">
            오늘도 언어 천재가 되어볼까요? 🚀
          </p>
          <SearchBar
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(typeof e === "string" ? e : e.target.value)
            }
            placeholder="단어장 제목을 검색하세요"
          />

          <div className="v-filter-wrapper">
            <FilterTabs
              filters={filterOptions}
              currentFilter={currentFilter}
              setFilter={setCurrentFilter}
              filterCounts={filterCounts}
            />
          </div>
        </section>

        <main className="v-deck-grid-container">
          {loading ? (
            <div className="v-home-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <DeckSkeleton key={i} />
              ))}
            </div>
          ) : filteredDecks.length > 0 ? (
            <div className="v-home-grid">
              {filteredDecks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  title={deck.name}
                  wordCount={deck.total || 0}
                  progress={deck.progress || 0}
                  isFavorite={deck.isFavorite}
                  icon={deck.icon?.icon || getLangIcon(deck.language)}
                  onClick={() =>
                    navigate(
                      generatePath(ROUTES.DECK_DETAIL, { deckId: deck.id }),
                      { state: { initialDeck: deck } },
                    )
                  }
                  onEdit={() => onEditDeck(deck)}
                  onDelete={() => handleDeleteClick(deck)}
                  onToggleDeckFavorite={() =>
                    onToggleDeckFavorite(deck.id, deck.isFavorite)
                  }
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
