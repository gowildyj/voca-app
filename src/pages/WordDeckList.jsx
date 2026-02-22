import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import "@/styles/pages/wordDeckList.css";

import FilterBar from "@/components/common/FilterBar";
import SearchBar from "@/components/common/SearchBar";
import Button from "@/components/common/Button";
import DeckCard from "@/components/cards/DeckCard";

import { ROUTES, generatePath } from "@/routes/AppRoutes";
import { useModal } from "@/contexts/ModalContext";

const WordDeckList = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [activeTab, setActiveTab] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const decks = [
    { id: 1, title: "필수 스페인어", wordCount: 24, progress: 45, icon: "🇪🇸" },
    { id: 2, title: "여행 회화", wordCount: 18, progress: 10, icon: "✈️" },
    { id: 3, title: "비즈니스 영어", wordCount: 104, progress: 30, icon: "💼" },
    { id: 4, title: "기초 프랑스어", wordCount: 52, progress: 0, icon: "🇫🇷" },
  ];

  const categories = ["전체", "최근 학습", "중요 ⭐️", "완료"];

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
        <div className="v-home-grid">
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              title={deck.title}
              wordCount={deck.wordCount}
              progress={deck.progress}
              icon={deck.icon}
              onClick={() =>
                navigate(generatePath(ROUTES.DECK_DETAIL, { deckId: deck.id }))
              }
              onEdit={() => openModal("DECK_EDIT", { deckData: deck })}
              onDelete={() => openModal("CONFIRM_DELETE", { id: deck.id })}
            />
          ))}
        </div>
      </main>

      {/* 플로팅 버튼 수정 */}
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
