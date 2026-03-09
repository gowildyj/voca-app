import React from "react";
import { useParams } from "react-router-dom";
import { Plus, FilePenLine, PencilLine, Trash2, Star } from "lucide-react";
import "@/styles/pages/wordList.css";

import { toast } from "react-hot-toast";
import Button from "@/components/common/Button";
import HeroCard from "@/components/cards/HeroCard";
import SearchBar from "@/components/common/SearchBar";
import FilterTabs from "@/components/common/FilterTabs";
import VisibilityToggle from "@/components/common/VisibilityToggle";
import SortSelector from "@/components/common/SortSelector";
import WordCard from "@/components/cards/WordCard";
import AddWordCard from "@/components/cards/AddWordCard";
import StudyPage from "@/pages/StudyPage";

import { playText } from "@/utils/ttsUtils";
import { useWordList } from "@/hooks/pages/useWordList";

const filterOptions = [
  { id: "all", label: "전체" },
  { id: "favorite", label: "중요" },
  { id: "none", label: "미학습" },
  { id: "unknown", label: "몰라" },
  { id: "know", label: "알아" },
];

const WordList = () => {
  const { deckId } = useParams();
  const [isStudyOpen, setIsStudyOpen] = React.useState(false);

  const {
    currentDeck,
    displayWords,
    filteredWords,
    loading,

    filter,
    sortType,
    searchQuery,
    hideMode,
    filterCounts,

    setSearchQuery,
    handleFilterChange,
    handleSortChange,
    onToggleMode,

    onAddWord,
    onEditWord,
    onDeleteWord,
    onEditDeck,
    onDeleteDeck,
    onBulkEdit,
    onToggleWordFavorite,
    onToggleDeckFavorite,

    observerTarget,
  } = useWordList(deckId);

  return (
    <div className="v-word-list-page">
      {/* 1. 헤더 영역 */}
      <header className="v-word-list-intro">
        <div className="v-intro-top">
          <h1 className="v-deck-title">
            {currentDeck?.name || currentDeck?.deck_name || ""}
          </h1>
          <div className="v-intro-actions">
            <button
              className={`v-icon-action-btn favorite ${
                currentDeck?.isFavorite ? "active" : ""
              }`}
              onClick={() =>
                currentDeck &&
                onToggleDeckFavorite(currentDeck.id, currentDeck.isFavorite)
              }
              title="즐겨찾기 등록"
            >
              <Star
                size={16}
                fill={currentDeck?.isFavorite ? "currentColor" : "none"}
              />
            </button>

            <button
              className="v-icon-action-btn"
              onClick={onBulkEdit}
              title="일괄 편집"
            >
              <FilePenLine size={16} />
            </button>

            <button
              className="v-icon-action-btn"
              onClick={onEditDeck}
              title="단어장 수정"
            >
              <PencilLine size={16} />
            </button>

            <button
              className="v-icon-action-btn danger"
              onClick={onDeleteDeck}
              title="단어장 삭제"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="v-intro-content">
          <p className="v-deck-desc">
            {currentDeck?.description ||
              (currentDeck ? `${currentDeck.language} 학습 중 ✈️` : "")}
          </p>
        </div>
      </header>

      {/* 2. 학습 시작 배너 */}
      <section className="v-word-list-header">
        <HeroCard
          variant="banner"
          title="학습 시작"
          subTitle={`${filteredWords?.length || 0}개의 단어 준비됨`}
          onClick={() => {
            if (!filteredWords || filteredWords.length === 0) {
              toast.error("학습할 단어가 없어요!");
              return;
            }
            setIsStudyOpen(true);
          }}
        />
      </section>

      {/* 3. 검색바 */}
      <section className="v-word-list-controls">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="단어나 뜻을 검색해 보세요"
        />
      </section>

      {/* 4. 필터 탭 */}
      <section className="v-word-list-controls">
        <FilterTabs
          filters={filterOptions}
          currentFilter={filter}
          setFilter={handleFilterChange}
          filterCounts={filterCounts}
        />
      </section>

      {/* 5. 하단 컨트롤러 */}
      <section className="v-word-list-controls">
        <div className="bottom-control-bar">
          <VisibilityToggle hideMode={hideMode} onToggleMode={onToggleMode} />
          <SortSelector
            sortType={sortType}
            setSortType={handleSortChange}
            onShuffle={() => handleSortChange("shuffle")}
          />
        </div>
      </section>

      {/* 6. 단어 카드 목록 */}
      <main className="v-word-card-stack">
        {displayWords && displayWords.length > 0 ? (
          displayWords.map((item, index) => (
            <WordCard
              key={item.id}
              item={item}
              index={item.displayOrder}
              hideMode={hideMode}
              onPlay={async (word) => {
                await playText(word, currentDeck?.language);
              }}
              onToggleWordFavorite={() =>
                onToggleWordFavorite(item.id, item.isFavorite)
              }
              onEdit={() => onEditWord(item)}
              onDelete={() => onDeleteWord(item.id)}
            />
          ))
        ) : (
          <AddWordCard searchQuery={searchQuery} onClick={onAddWord} />
        )}

        <div ref={observerTarget} style={{ height: "40px", width: "100%" }} />
      </main>

      {/* 7. 플로팅 액션 버튼 */}
      <Button
        variant="fab"
        icon={<Plus size={28} />}
        onClick={onAddWord}
        aria-label="새 단어 추가"
      />

      <StudyPage
        isOpen={isStudyOpen}
        onClose={() => setIsStudyOpen(false)}
        deckId={deckId}
        initialWords={filteredWords}
        initialDeck={currentDeck}
      />
    </div>
  );
};

export default WordList;
