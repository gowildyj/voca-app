import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, FilePenLine, PencilLine, Trash2 } from "lucide-react";
import "@/styles/pages/wordList.css";

import HeroCard from "@/components/cards/HeroCard";
import ComplexFilterBar from "@/components/common/ComplexFilterBar";
import SearchBar from "@/components/common/SearchBar";
import WordCard from "@/components/cards/WordCard";
import Button from "@/components/common/Button";
import { useWordListPage } from "@/hooks/pages/useWordListPage";

const WordList = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const {
    currentDeck,
    displayWords,
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
    openModal,
    handleDeleteDeck,
  } = useWordListPage(deckId);

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
          <h1 className="v-deck-title">{currentDeck?.deck_name || "단어장"}</h1>{" "}
          <div className="v-intro-actions">
            <button
              className="v-icon-action-btn"
              onClick={() => openModal("WORD_EDIT_BULK", { id: deckId })}
            >
              <FilePenLine size={16} />
            </button>
            <button
              className="v-icon-action-btn"
              onClick={() => openModal("DECK_EDIT", { deckData: currentDeck })}
            >
              <PencilLine size={16} />
            </button>
            <button
              className="v-icon-action-btn danger"
              onClick={handleDeleteDeck}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="v-intro-content">
          <p className="v-deck-desc">{currentDeck?.lang_code} 학습 중 ✈️</p>
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

      {/* 2. 복합 필터 바 (고정 영역) */}
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

      {/* 3. 단어 카드 리스트 */}
      <main className="v-word-card-stack">
        {displayWords.map((item) => (
          <WordCard
            key={item.id}
            item={item}
            hideMode={hideMode}
            onPlay={(w) => console.log("Playing:", w)}
            onEdit={() => openModal("WORD_EDIT", { initialData: item })}
            onDelete={() => openModal("CONFIRM_DELETE", { id: item.id })}
          />
        ))}
        <div ref={observerTarget} style={{ height: "20px" }} />
      </main>

      {/* 4. 플로팅 추가 버튼 (FAB) */}
      {/* <Button
        variant="fab"
        icon={<Plus size={28} />}
        onClick={() => openModal("WORD_ADD", { deckId })}
        aria-label="새 단어 추가"
      /> */}
    </div>
  );
};

export default WordList;
