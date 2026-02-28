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

const filterOptions = [
  { id: "all", label: "전체" },
  { id: "favorite", label: "중요" },
  { id: "none", label: "미학습" },
  { id: "unknown", label: "몰라" },
  { id: "know", label: "알아" },
];

const WordList = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const {
    currentDeck, // 현재 단어장 정보
    displayWords, // 화면에 보여줄 단어들 (무한 스크롤 적용됨)
    filteredWords, // 학습하기 버튼에 넘겨줄 전체 필터링 목록
    loading,

    // 상태 및 필터
    filter, // 현재 필터 상태
    sortType, // 현재 정렬 상태
    searchQuery, // 검색어
    hideMode, // 가리기 모드 (단어/뜻)
    filterCounts, // 각 필터별 개수 통계

    // 핸들러 함수들
    setSearchQuery,
    handleFilterChange,
    handleSortChange,
    onToggleMode,

    // CRUD 액션
    onAddWord,
    onEditWord,
    onDeleteWord,
    onEditDeck,
    onDeleteDeck,
    onBulkEdit,

    // UI 요소
    observerTarget, // 무한 스크롤 감지용 ref
  } = useWordList(deckId);

  return (
    <div className="v-word-list-page">
      {/* 1. 헤더 영역 */}
      <header className="v-word-list-intro">
        <div className="v-intro-top">
          <h1 className="v-deck-title">
            {/* 데이터가 없으면 로딩 중 표시가 아니라, 스켈레톤이나 빈 문자열 처리 */}
            {currentDeck?.name || currentDeck?.deck_name || ""}
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
              (currentDeck ? `${currentDeck.language} 학습 중 ✈️` : "")}
          </p>
        </div>
      </header>

      {/* 2. 학습 시작 배너 */}
      <section className="v-word-list-header">
        <HeroCard
          variant="banner"
          title="학습 시작"
          // 현재 필터링된 단어 개수
          subTitle={`${filteredWords?.length || 0}개의 단어 준비됨`}
          onClick={() =>
            // 학습 페이지로 이동할 때 현재 필터링된 단어들의 ID 목록을 전달
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

      {/* 4. 필터 탭 */}
      <section className="v-word-list-controls">
        <FilterTabs
          filters={filterOptions}
          currentFilter={filter} // 훅에서 받은 'filter' 변수 사용
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
        {displayWords.length > 0 ? (
          displayWords.map((item) => (
            <WordCard
              key={item.id}
              item={item}
              hideMode={hideMode}
              // 단어장의 언어 설정에 맞춰 TTS 실행 (currentDeck 정보 활용)
              onPlay={(word) => playText(word, currentDeck?.language)}
              onEdit={() => onEditWord(item)}
              onDelete={() => onDeleteWord(item.id)}
            />
          ))
        ) : (
          // 단어가 없을 때 보여줄 카드 (검색 결과 없음 or 초기 상태)
          <AddWordCard searchQuery={searchQuery} onClick={onAddWord} />
        )}

        {/* 무한 스크롤 트리거 요소 */}
        <div ref={observerTarget} style={{ height: "40px", width: "100%" }} />
      </main>

      {/* 7. 플로팅 액션 버튼 */}
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
