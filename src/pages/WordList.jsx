import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, FilePenLine, PencilLine, Trash2 } from "lucide-react";
import "@/styles/pages/wordList.css";

import HeroCard from "@/components/cards/HeroCard";
import ComplexFilterBar from "@/components/common/ComplexFilterBar";
import SearchBar from "@/components/common/SearchBar";
import WordCard from "@/components/cards/WordCard";
import Button from "@/components/common/Button";
import { playText } from "@/utils/ttsUtils";
import { useWordListPage } from "@/hooks/pages/useWordListPage";

const WordList = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();

  // 🌟 Hook에서 필요한 데이터와 핸들러를 모두 꺼냅니다.
  const {
    currentDeck,
    displayWords,
    loading,
    // 필터 관련
    filter: currentFilter,
    sortType,
    searchQuery,
    hideMode,
    onToggleMode,
    filterCounts,
    observerTarget,
    setSearchQuery,
    handleFilterChange,
    handleSortChange,
    // 핸들러들 (openModal 대신 이것들을 씁니다!)
    onAddWord,
    onEditWord,
    onDeleteWord,
    onEditDeck,
    onDeleteDeck,
    onBulkEdit,
  } = useWordListPage(deckId);

  // console.log("currentDeck", currentDeck);
  // console.log("displayWords", displayWords);

  if (loading && !currentDeck) return <div className="v-loader" />;

  const filterOptions = [
    { id: "all", label: "전체" },
    { id: "none", label: "미학습" },
    { id: "unknown", label: "몰라" },
    { id: "know", label: "알아" },
  ];

  return (
    <div className="v-word-list-page">
      <header className="v-word-list-intro">
        <div className="v-intro-top">
          {/* 데이터 이름 정규화 (name 우선) */}
          <h1 className="v-deck-title">
            {currentDeck?.name || currentDeck?.deck_name || "단어장"}
          </h1>
          <div className="v-intro-actions">
            {/* 🌟 1. 일괄 편집 */}
            <button className="v-icon-action-btn" onClick={onBulkEdit}>
              <FilePenLine size={16} />
            </button>
            {/* 🌟 2. 덱 정보 수정 */}
            <button className="v-icon-action-btn" onClick={onEditDeck}>
              <PencilLine size={16} />
            </button>
            {/* 🌟 3. 덱 삭제 */}
            <button className="v-icon-action-btn danger" onClick={onDeleteDeck}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="v-intro-content">
          <p className="v-deck-desc">
            {currentDeck?.description ||
              `${currentDeck?.language || currentDeck?.lang_code || "언어"} 학습 중 ✈️`}
          </p>
        </div>
      </header>

      <section className="v-word-list-header">
        <HeroCard
          variant="banner"
          title="학습 시작"
          subTitle={`${displayWords.length}개의 단어 준비됨`}
          onClick={() =>
            navigate(`/study/${deckId}`, {
              state: { filteredIds: displayWords.map((w) => w.id) },
            })
          }
        />
      </section>

      <section className="v-word-list-controls">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="단어나 뜻을 검색해 보세요"
        />
      </section>

      {/* 복합 필터 바 */}
      <section className="v-word-list-controls">
        <ComplexFilterBar
          filters={filterOptions}
          currentFilter={currentFilter}
          setFilter={handleFilterChange}
          sortType={sortType}
          setSortType={handleSortChange}
          filterCounts={filterCounts}
          hideMode={hideMode}
          onToggleMode={onToggleMode}
          onShuffle={() => alert("순서 셔플!")}
        />
      </section>

      {/* 단어 카드 리스트 */}
      <main className="v-word-card-stack">
        {displayWords.map((item) => (
          <WordCard
            key={item.id}
            item={item}
            hideMode={hideMode}
            onPlay={(word) => playText(word, currentDeck?.language)}
            onEdit={() => onEditWord(item)}
            onDelete={() => onDeleteWord(item)}
          />
        ))}
        {/* 무한 스크롤용 옵저버 */}
        <div ref={observerTarget} style={{ height: "20px" }} />
      </main>

      {/* 🌟 5. 플로팅 추가 버튼 (FAB) - 단어 추가 */}
      <Button
        variant="fab"
        icon={<Plus size={28} />}
        onClick={onAddWord}
        aria-label="새 단어 추가"
      />
    </div>
  );
};

export default WordList;
