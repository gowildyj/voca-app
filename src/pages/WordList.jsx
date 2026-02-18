import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowLeft, Plus, Edit3, Trash2 } from "lucide-react";

import { useWordsContext } from "@/hooks/useWordsContext";
import { useModal } from "@/contexts/ModalContext";
import { useWordListLogic } from "@/hooks/useWordListLogic";

import WordItem from "@/components/wordlist/WordItem";
import SearchBar from "@/components/wordlist/SearchBar";
import FilterBar from "@/components/wordlist/FilterBar";

const WordList = () => {
  const navigate = useNavigate();
  const { deckName: urlDeckParam } = useParams();
  const { openModal } = useModal();

  const {
    decks,
    fetchWordsByDeck,
    deleteWord,
    addWord,
    addWordsBulk,
    updateWord,
    updateDeck,
    deleteDeck,
    resetDeckProgress,
  } = useWordsContext();

  const [localWords, setLocalWords] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const [hideMode, setHideMode] = useState("none");

  const currentDeckName = useMemo(
    () => decodeURIComponent(urlDeckParam || ""),
    [urlDeckParam],
  );
  const foundDeck = useMemo(
    () => decks?.find((d) => d.deck_name === currentDeckName),
    [decks, currentDeckName],
  );
  const currentDeckId = foundDeck?.id;
  const currentLangCode = foundDeck?.lang_code;

  const logic = useWordListLogic(localWords);

  const handleRefreshList = useCallback(
    async (showLoading = true) => {
      if (!currentDeckId) return;
      if (showLoading) setListLoading(true);
      try {
        const data = await fetchWordsByDeck(currentDeckId);
        setLocalWords(data || []);
      } finally {
        setListLoading(false);
      }
    },
    [currentDeckId, fetchWordsByDeck],
  );

  useEffect(() => {
    handleRefreshList(true);
  }, [handleRefreshList]);

  const performAction = useCallback(
    async (action, ...args) => {
      try {
        await action(...args);
        await handleRefreshList(false);
      } catch (error) {
        console.error("작업 실패:", error);
        alert("처리에 실패했습니다.");
      }
    },
    [handleRefreshList],
  );

  const handleAddWord = () => {
    openModal("ADD_WORD", {
      defaultDeckId: currentDeckId,
      defaultDeckName: currentDeckName,
      onAdd: async (newWord) => await performAction(addWord, newWord),
      onAddBulk: async (words) => await performAction(addWordsBulk, words),
    });
  };

  const handleEditWord = (item) => {
    openModal("EDIT_WORD", {
      item,
      onUpdate: async (id, data) => await performAction(updateWord, id, data),
    });
  };

  const handleStartStudy = () => {
    if (logic.filteredWords.length === 0) return;
    const params = new URLSearchParams();

    if (logic.filter !== "all") params.append("filter", logic.filter);
    if (logic.sortType !== "default") params.append("sort", logic.sortType);

    const queryString = params.toString();
    const suffix = queryString ? `?${queryString}` : "";

    navigate(`/list/${encodeURIComponent(currentDeckName)}${suffix}`, {
      replace: true,
    });
    setTimeout(() => {
      navigate(`/study/${encodeURIComponent(currentDeckName)}${suffix}`);
    }, 0);
  };

  const handleResetProgress = async (deckId) => {
    const success = await resetDeckProgress(deckId);
    if (success) {
      setLocalWords((prev) => prev.map((w) => ({ ...w, status: "none" })));
      logic.setFilter("all");
    }
  };

  const EmptyGuide = ({ searchQuery }) => (
    <div className="word-item-card guide-mode">
      <div className="word-item-content">
        <div className="word-text">
          {searchQuery
            ? `"${searchQuery}" 검색 결과가 없어요.`
            : "첫 단어를 추가해보세요."}
        </div>
        <div className="word-meaning">
          {searchQuery
            ? "다른 검색어를 입력하거나 추가해보세요! 🚀"
            : "우측 하단의 + 버튼 클릭! 🚀"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="word-list-page">
      <header className="list-header">
        <div className="header-left">
          <button
            onClick={() => navigate("/", { replace: true })}
            className="back-btn"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="list-header-title">{currentDeckName}</h1>
        </div>
        <div className="header-right">
          <button
            onClick={() =>
              openModal("EDIT_DECK", {
                deckId: currentDeckId,
                oldName: currentDeckName,
                oldLangCode: currentLangCode,
                onRename: updateDeck,
                onResetProgress: handleResetProgress,
              })
            }
            className="deck-action-btn"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(`"${currentDeckName}" 덱을 삭제하시겠습니까?`)
              ) {
                deleteDeck(currentDeckId, currentDeckName);
                navigate("/");
              }
            }}
            className="deck-action-btn"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <SearchBar query={logic.searchQuery} setQuery={logic.setSearchQuery} />

      <div
        className="study-start-card"
        onClick={handleStartStudy}
        style={{
          opacity: logic.filteredWords.length > 0 ? 1 : 0.5,
          cursor: "pointer",
        }}
      >
        <div className="study-card-info">
          <h3>학습 시작</h3>
          <p>{logic.filteredWords.length}개의 단어 준비됨</p>
        </div>
        <Play fill="white" size={24} />
      </div>

      <FilterBar
        currentFilter={logic.filter}
        setFilter={logic.setFilter}
        sortType={logic.sortType}
        setSortType={logic.setSortType}
        filterCounts={logic.filterCounts}
        onShuffle={() => {
          logic.setShuffleSeed(Math.random());
          logic.setDisplayLimit(30);
        }}
        hideMode={hideMode}
        onToggleMode={(mode) => {
          setHideMode((prev) => (prev === mode ? "none" : mode));
        }}
      />

      <div className="list-container">
        {listLoading ? (
          <div className="list-loading">불러오는 중...</div>
        ) : (
          <div className="word-items-wrapper">
            <AnimatePresence>
              {logic.filteredWords.slice(0, logic.displayLimit).map((item) => (
                <WordItem
                  key={item.id}
                  item={item}
                  langCode={currentLangCode}
                  onEdit={() => handleEditWord(item)}
                  onDelete={async (id) => await performAction(deleteWord, id)}
                  hideMode={hideMode}
                />
              ))}
            </AnimatePresence>
            {!listLoading && logic.filteredWords.length === 0 && (
              <EmptyGuide searchQuery={logic.searchQuery} />
            )}
            <div ref={logic.observerTarget} style={{ height: "20px" }} />
          </div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleAddWord}
        className="floating-plus-btn"
      >
        <Plus size={32} />
      </motion.button>
    </div>
  );
};

export default WordList;
