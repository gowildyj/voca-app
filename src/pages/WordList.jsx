import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, FilePenLine, PencilLine, Trash2 } from "lucide-react";
import "@/styles/pages/wordList.css";

import Button from "@/components/common/Button";
import HeroCard from "@/components/cards/HeroCard";
import SearchBar from "@/components/common/SearchBar";
import FilterTabs from "@/components/common/FilterTabs";
import VisibilityToggle from "@/components/common/VisibilityToggle";
import SortSelector from "@/components/common/SortSelector";
import WordCard from "@/components/cards/WordCard";
import AddWordCard from "@/components/cards/AddWordCard";
import { playText } from "@/utils/ttsUtils";
import { useWordList } from "@/hooks/pages/useWordList";

const WordList = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();

  // useWordList 사용
  const {
    currentDeck,
    displayWords,
    filteredWords,
    loading,
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
    onAddWord,
    onEditWord,
    onDeleteWord,
    onEditDeck,
    onDeleteDeck,
    onBulkEdit,
  } = useWordList(deckId);

  // 로딩 중이면서 아직 덱 정보가 없을 때만 로더 표시
  if (loading && !currentDeck) return <div className="v-loader" />;

  const filterOptions = [
    { id: "all", label: "전체" },
    { id: "favorite", label: "중요" },
    { id: "none", label: "미학습" },
    { id: "unknown", label: "몰라" },
    { id: "know", label: "알아" },
  ];

  return (
    <div className="v-word-list-page">
      {/* 1. 헤더 영역 (단어장 정보 및 관리 버튼) */}
      <header className="v-word-list-intro">
        <div className="v-intro-top">
          <h1 className="v-deck-title">
            {currentDeck?.name || currentDeck?.deck_name || "단어장"}
          </h1>
          <div className="v-intro-actions">
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
              `${currentDeck?.language || currentDeck?.lang_code || "언어"} 학습 중 ✈️`}
          </p>
        </div>
      </header>

      {/* 2. 학습 시작 배너 */}
      <section className="v-word-list-header">
        <HeroCard
          variant="banner"
          title="학습 시작"
          subTitle={`${filteredWords?.length || 0}개의 단어 준비됨`}
          onClick={() =>
            navigate(`/study/${deckId}`, {
              state: { filteredIds: filteredWords.map((w) => w.id) },
            })
          }
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

      {/* 4. 필터 탭 (전체/미학습/몰라/알아) */}
      <section className="v-word-list-controls">
        <FilterTabs
          filters={filterOptions}
          currentFilter={currentFilter}
          setFilter={handleFilterChange}
          filterCounts={filterCounts}
        />
      </section>

      {/* 5. 하단 컨트롤러 (가리기 모드, 정렬) */}
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

      {/* 6. 단어 카드 목록 (무한 스크롤 적용) */}
      <main className="v-word-card-stack">
        {displayWords.length > 0 ? (
          displayWords.map((item) => (
            <WordCard
              key={item.id}
              item={item}
              hideMode={hideMode}
              // 단어장의 언어 설정에 맞춰 TTS 실행
              onPlay={(word) => playText(word, currentDeck?.language)}
              onEdit={() => onEditWord(item)}
              onDelete={() => onDeleteWord(item.id)} // id를 넘기도록 일치화
            />
          ))
        ) : (
          <AddWordCard searchQuery={searchQuery} onClick={onAddWord} />
        )}

        {/* 무한 스크롤용 관찰 대상 */}
        <div ref={observerTarget} style={{ height: "40px" }} />
      </main>

      {/* 7. 플로팅 액션 버튼 (단어 추가) */}
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
