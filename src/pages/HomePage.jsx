// src/pages/HomePage.jsx
import React, { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import HeroCard from "@/components/cards/HeroCard";
import DeckCard from "@/components/cards/DeckCard";
import { ROUTES } from "@/routes/AppRoutes";
import { useHomePage } from "@/hooks/pages/useHomePage";
import "@/styles/pages/homePage.css";

import { LANG_OPTIONS } from "@/constants/languages";

const HomePage = ({ currentLangValue }) => {
  const {
    lastDeck,
    displayDecks,
    loading,
    handleNavigate,
    onAddDeck,
    onEditDeck,
    handleDeleteDeck,
    fetchDecks,
  } = useHomePage(currentLangValue);

  // 언어 아이콘 헬퍼 (WordDeckList와 동일)
  const getLangIcon = (langCode) => {
    const target = LANG_OPTIONS.find((lang) => lang.value === langCode);
    return target ? target.icon : "📁";
  };

  useEffect(() => {
    fetchDecks();
  }, [currentLangValue]);

  if (loading) return <div className="v-loader" />;

  return (
    <div className="v-home-page">
      <main className="v-home-content">
        {/* Hero Section */}
        <section className="v-home-section">
          {lastDeck ? (
            <HeroCard
              title={lastDeck.name}
              subTitle={`${lastDeck.total}개 단어`}
              badge="CONTINUE"
              onClick={() =>
                handleNavigate(ROUTES.STUDY_SESSION, { deckId: lastDeck.id })
              }
            />
          ) : (
            <HeroCard
              title="오늘의 학습 시작"
              subTitle="새로운 단어장을 만들어보세요!"
              badge="GET STARTED"
              onClick={onAddDeck}
            />
          )}
        </section>

        {/* My Decks Section */}
        <section className="v-home-section">
          <div className="v-section-header">
            <h3 className="v-section-title">나의 단어장</h3>
            <button
              className="v-see-all-btn"
              onClick={() => handleNavigate(ROUTES.DECK_LIST)}
            >
              전체보기 <ChevronRight size={14} />
            </button>
          </div>
          <div className="v-home-grid">
            {displayDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                title={deck.name}
                wordCount={deck.total || 0}
                progress={deck.progress || 0}
                icon={getLangIcon(deck.language)}
                onClick={() =>
                  handleNavigate(ROUTES.DECK_DETAIL, { deckId: deck.id })
                }
                onEdit={() => onEditDeck(deck)}
                onDelete={() => handleDeleteDeck(deck)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
