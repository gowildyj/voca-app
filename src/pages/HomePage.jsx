// src/pages/HomePage.jsx
import React from "react";
import { ChevronRight } from "lucide-react";
import HeroCard from "@/components/cards/HeroCard";
import DeckCard from "@/components/cards/DeckCard";
import ScenarioCard from "@/components/cards/ScenarioCard";
import { ROUTES } from "@/routes/AppRoutes";
import { useHomePage } from "@/hooks/pages/useHomePage";
import "@/styles/pages/homepage.css";

const HomePage = ({ currentLangValue }) => {
  const {
    lastDeck,
    displayDecks,
    loading,
    handleNavigate,
    handleDeleteDeck,
    openModal,
  } = useHomePage(currentLangValue);

  if (loading) return <div className="v-loader" />;

  return (
    <div className="v-home-page">
      <main className="v-home-content">
        {/* 오늘의 학습 섹션: 마지막 학습 덱 연결 */}
        <section className="v-home-section">
          {lastDeck ? (
            <HeroCard
              title={`${lastDeck.deck_name} 이어하기`}
              subTitle={`남은 단어: ${lastDeck.total_count - lastDeck.known_count}개`}
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
              onClick={() => openModal("DECK_ADD")}
            />
          )}
        </section>

        {/* 나의 단어장 섹션: 2열 그리드 (최대 4개) */}
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
                title={deck.deck_name}
                wordCount={deck.total_count}
                progress={deck.progress}
                icon={deck.icon || "📁"}
                onClick={() =>
                  handleNavigate(ROUTES.DECK_DETAIL, { deckId: deck.id })
                }
                onEdit={() => openModal("DECK_EDIT", { deckData: deck })}
                onDelete={() => handleDeleteDeck(deck)}
              />
            ))}
          </div>
        </section>

        {/* 추천 시나리오 섹션 */}
        {/* <section className="v-home-section">
          <div className="v-section-header">
            <h3 className="v-section-title">추천 시나리오</h3>
            <button
              className="v-see-all-btn"
              onClick={() => handleNavigate(ROUTES.SCENARIO_LIST)}
            >
              전체보기 <ChevronRight size={14} />
            </button>
          </div>

          <div className="v-home-grid">
            {displayDecks.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                title={scenario.title}
                description={scenario.description}
                level={scenario.level}
                icon="☕"
                onClick={() =>
                  handleNavigate(ROUTES.SCENARIO_DETAIL, { id: 1 })
                }
              />
            ))}
          </div>
        </section> */}
      </main>
    </div>
  );
};

export default HomePage;
