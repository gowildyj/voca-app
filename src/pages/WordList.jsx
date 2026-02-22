import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronLeft,
  ListChecks,
  PencilLine,
  FilePenLine,
  Trash2,
} from "lucide-react";
import "@/styles/pages/wordList.css";

import HeroCard from "@/components/cards/HeroCard";
import ComplexFilterBar from "@/components/common/ComplexFilterBar";
import SearchBar from "@/components/common/SearchBar";
import WordCard from "@/components/cards/WordCard";
import Button from "@/components/common/Button";
import { useModal } from "@/contexts/ModalContext";

const WordList = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();

  // 필터 및 표시 상태 관리
  const [currentFilter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("default");
  const [hideMode, setHideMode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const testFilters = [
    { id: "all", label: "전체" },
    { id: "new", label: "미학습" },
    { id: "review", label: "몰라" },
    { id: "mastered", label: "알아" },
  ];

  // 샘플 데이터 (스크린샷 기반)
  const words = [
    {
      id: 1,
      word: "¡Ayuda! (아유다!)",
      meaning: "도와주세요!",
      isFavorite: false,
    },
    { id: 2, word: "¡Salud! (쌀루드!)", meaning: "건배!", isFavorite: true },
    {
      id: 3,
      word: "¿Cómo está? (꼬모 에스따?)",
      meaning: "어떻게 지내세요?",
      isFavorite: false,
    },
    {
      id: 4,
      word: "Esta es 한 문장이 아주 길어질 때 테스트를 위한 데이터입니다.",
      meaning: "이것은 긴 문장 테스트입니다.",
      isFavorite: false,
    },
  ];

  const handleToggleMode = (mode) => {
    setHideMode((prev) => (prev === mode ? null : mode));
  };

  return (
    <div className="v-word-list-page">
      <header className="v-word-list-intro">
        <div className="v-intro-top">
          <h1 className="v-deck-title">에스빠뇰</h1>
          <div className="v-intro-actions">
            <button
              className="v-icon-action-btn"
              onClick={() => openModal("WORD_EDIT_BULK", { id: deckId })}
            >
              <FilePenLine size={16} />
            </button>
            <button
              className="v-icon-action-btn"
              onClick={() => openModal("DECK_EDIT", { id: deckId })}
            >
              <PencilLine size={16} />
            </button>
            <button
              className="v-icon-action-btn danger"
              onClick={() =>
                openModal("CONFIRM_DELETE", { type: "deck", id: deckId })
              }
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="v-intro-content">
          <p className="v-deck-desc">기초 스페인어 여행 회화 정복하기 ✈️</p>
        </div>
      </header>

      <section className="v-word-list-header">
        <HeroCard
          variant="banner"
          title="학습 시작"
          subTitle={`${words.length}개의 단어 준비됨`}
          onClick={() => navigate(`/study/${deckId}`)}
        />
      </section>

      <section className="v-word-list-controls">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="단어나 뜻을 검색해 보세요"
        />
      </section>

      {/* 2. 복합 필터 바 (고정 영역) */}
      <section className="v-word-list-controls">
        <ComplexFilterBar
          filters={testFilters}
          currentFilter={currentFilter}
          setFilter={setFilter}
          sortType={sortType}
          setSortType={setSortType}
          hideMode={hideMode}
          onToggleMode={handleToggleMode}
          filterCounts={{ all: 104, new: 60, review: 13, mastered: 31 }}
          onShuffle={() => alert("순서 셔플!")}
        />
      </section>

      {/* 3. 단어 카드 리스트 */}
      <main className="v-word-card-stack">
        {words.map((item) => (
          <WordCard
            key={item.id}
            item={item}
            hideMode={hideMode}
            onPlay={(w) => console.log("Playing:", w)}
            onEdit={() => openModal("WORD_EDIT", { initialData: item })}
            onDelete={() => openModal("CONFIRM_DELETE", { id: item.id })}
          />
        ))}
      </main>

      {/* 4. 플로팅 추가 버튼 (FAB) */}
      <Button
        variant="fab"
        icon={<Plus size={28} />}
        onClick={() => openModal("WORD_ADD", { deckId })}
        aria-label="새 단어 추가"
      />
    </div>
  );
};

export default WordList;
