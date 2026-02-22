import React from "react";
import { useNavigate } from "react-router-dom"; // 👈 경로 이동을 위해 추가
import { ChevronRight } from "lucide-react"; // 👈 화살표 아이콘 추가
import HeroCard from "@/components/cards/HeroCard";
import DeckCard from "@/components/cards/DeckCard";
import ScenarioCard from "@/components/cards/ScenarioCard";
import { ROUTES } from "@/routes/AppRoutes"; // 👈 경로 정의 파일 임포트
import "@/styles/pages/homepage.css";
import { useModal } from "@/contexts/ModalContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const decks = [
    { id: 1, title: "필수 스페인어", wordCount: 24, progress: 45, icon: "🇪🇸" },
    { id: 2, title: "여행 회화", wordCount: 18, progress: 10, icon: "✈️" },
    { id: 3, title: "비즈니스 영어", wordCount: 104, progress: 30, icon: "💼" },
    { id: 4, title: "기초 프랑스어", wordCount: 52, progress: 0, icon: "🇫🇷" },
  ];

  return (
    <div className="v-home-page">
      <main className="v-home-content">
        {/* 오늘의 학습 섹션 */}
        <section className="v-home-section">
          <HeroCard
            title="오늘의 학습 시작"
            subTitle="스페인어 단어 15개가 남아있어요"
            badge="DAILY GOAL"
            onClick={() => navigate(ROUTES.STUDY_SESSION)} // 👈 학습 페이지 이동 예시
          />
        </section>

        {/* 나의 단어장 섹션 */}
        <section className="v-home-section">
          <div className="v-section-header">
            <h3 className="v-section-title">나의 단어장</h3>
            {/* 🌟 전체보기 버튼 추가 */}
            <button
              className="v-see-all-btn"
              onClick={() => navigate(ROUTES.DECK_LIST)}
            >
              전체보기
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="v-home-grid">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                title={deck.title}
                wordCount={deck.wordCount}
                progress={deck.progress}
                icon={deck.icon}
                onClick={() =>
                  navigate(
                    generatePath(ROUTES.DECK_DETAIL, { deckId: deck.id }),
                  )
                }
                onEdit={() => openModal("DECK_EDIT", { deckData: deck })}
                onDelete={() => openModal("CONFIRM_DELETE", { id: deck.id })}
              />
            ))}
          </div>
        </section>

        {/* 추천 시나리오 섹션 */}
        <section className="v-home-section">
          <div className="v-section-header">
            <h3 className="v-section-title">추천 시나리오</h3>
            {/* 🌟 전체보기 버튼 추가 */}
            <button
              className="v-see-all-btn"
              onClick={() => navigate(ROUTES.SCENARIO_LIST)}
            >
              전체보기
              <ChevronRight size={14} />
            </button>
          </div>
          <ScenarioCard
            title="커피 주문하기"
            description="카페에서 점원과 대화하며 메뉴를 고르고 결제해보세요."
            level="초급"
            tags={["카페", "주문", "결제"]}
            icon="☕"
            onClick={() => navigate(`${ROUTES.SCENARIO_DETAIL}/1`)} // 👈 시나리오 시작 이동
          />
        </section>
      </main>
    </div>
  );
};

export default HomePage;
