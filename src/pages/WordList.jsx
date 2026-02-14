import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Play, ArrowLeft, Plus } from "lucide-react";
import WordItem from "@/components/WordItem";
import EditWordModal from "@/components/EditWordModal";
import AddWordModal from "@/components/AddWordModal";
import SearchBar from "@/components/wordlist/SearchBar";
import FilterBar from "@/components/wordlist/FilterBar";
import { seededShuffle } from "@/utils/seedShuffle";

const WordList = ({
  decks = [],
  onStartStudy,
  updateWord,
  deleteWord,
  fetchWordsByDeck,
  onBack,
  addWord,
  addWordsBulk,
}) => {
  const [filter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [targetWord, setTargetWord] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(30);
  const [localWords, setLocalWords] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const observerTarget = useRef(null);
  const { deckName: urlDeckParam } = useParams();
  const currentDeckName = decodeURIComponent(urlDeckParam || "");

  const foundDeck = decks?.find((d) => d.name === currentDeckName);
  const currentDeckId = foundDeck?.id;
  const currentLangCode = foundDeck?.lang_code;

  useEffect(() => {
    const loadData = async () => {
      if (!currentDeckId || typeof fetchWordsByDeck !== "function") return;
      setListLoading(true);
      const data = await fetchWordsByDeck(currentDeckId);
      setLocalWords(data || []);
      setListLoading(false);
    };
    loadData();
  }, [currentDeckId, fetchWordsByDeck]);

  useEffect(() => {
    setDisplayLimit(30);
  }, [searchQuery, filter, sortType]);

  const validWords = useMemo(
    () => localWords.filter((w) => w.word?.trim() !== ""),
    [localWords],
  );

  const filterCounts = useMemo(
    () => ({
      all: validWords.length,
      none: validWords.filter((w) => !w.status || w.status === "none").length,
      unknown: validWords.filter((w) => w.status === "unknown").length,
      know: validWords.filter((w) => w.status === "know").length,
    }),
    [validWords],
  );

  const filteredWords = useMemo(() => {
    let result = validWords.filter((word) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "none"
            ? !word.status || word.status === "none"
            : word.status === filter;
      const matchesSearch =
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    if (sortType === "alpha")
      result.sort((a, b) => a.word.localeCompare(b.word));
    else if (sortType === "shuffle") result = seededShuffle(result, shuffleSeed);

    return result;
  }, [validWords, filter, searchQuery, sortType, shuffleSeed]);

  const handleAddWord = useCallback(
    async (newWord) => {
      await addWord(newWord);
      if (currentDeckId) {
        const data = await fetchWordsByDeck(currentDeckId);
        setLocalWords(data || []);
      }
    },
    [addWord, fetchWordsByDeck, currentDeckId],
  );

  const handleAddBulk = useCallback(
    async (wordsArray) => {
      const result = await addWordsBulk(wordsArray);
      if (result?.success && currentDeckId) {
        const data = await fetchWordsByDeck(currentDeckId);
        setLocalWords(data || []);
      }
      return result;
    },
    [addWordsBulk, fetchWordsByDeck, currentDeckId],
  );

  const handleUpdateWord = useCallback(
    async (id, updatedData) => {
      const result = await updateWord(id, updatedData);
      if (result?.success && currentDeckId) {
        const data = await fetchWordsByDeck(currentDeckId);
        setLocalWords(data || []);
      }
      return result;
    },
    [updateWord, fetchWordsByDeck, currentDeckId],
  );

  const handleDeleteWord = useCallback(
    async (id) => {
      await deleteWord(id);
      if (currentDeckId) {
        const data = await fetchWordsByDeck(currentDeckId);
        setLocalWords(data || []);
      }
    },
    [deleteWord, fetchWordsByDeck, currentDeckId],
  );

  const handleOpenEdit = useCallback((word) => {
    setTargetWord(word);
    setIsEditOpen(true);
  }, []);

  const finalDisplayList = useMemo(() => {
    if (filteredWords.length === 0) {
      return [
        {
          id: "guide-card",
          word: searchQuery
            ? `"${searchQuery}" 검색 결과 없음`
            : "첫 단어를 추가해보세요!",
          meaning: searchQuery
            ? "검색어를 확인해보세요."
            : "우측 하단의 + 버튼 클릭 🚀",
          status: "none",
          isGuide: true,
        },
      ];
    }
    return filteredWords.slice(0, displayLimit);
  }, [filteredWords, displayLimit, searchQuery]);

  useEffect(() => {
    if (listLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && filteredWords.length > displayLimit) {
          setDisplayLimit((prev) => prev + 30);
        }
      },
      { threshold: 1.0 },
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [filteredWords.length, displayLimit, listLoading]);

  return (
    <div className="word-list-page">
      <header className="list-header">
        <button onClick={onBack} className="back-btn" aria-label="뒤로">
          <ArrowLeft size={24} />
        </button>
        <h1 className="list-header-title">{currentDeckName}</h1>
      </header>

      <SearchBar query={searchQuery} setQuery={setSearchQuery} />

      <div
        className="study-start-card"
        onClick={() =>
          filteredWords.length > 0 &&
          onStartStudy(filteredWords, currentDeckName)
        }
        style={{ opacity: filteredWords.length > 0 ? 1 : 0.5 }}
      >
        <div className="study-card-info">
          <h3>학습 시작</h3>
          <p>{filteredWords.length}개의 단어 준비됨</p>
        </div>
        <Play fill="white" size={24} />
      </div>

      <FilterBar
        currentFilter={filter}
        setFilter={setFilter}
        sortType={sortType}
        setSortType={setSortType}
        onShuffle={() => {
          setShuffleSeed(Math.random());
          setDisplayLimit(30);
        }}
        filterCounts={filterCounts}
      />

      <div
        className={`list-container ${listLoading ? "list-container--loading" : ""}`}
      >
        {listLoading ? (
          <div className="list-loading">
            <span>불러오는 중...</span>
          </div>
        ) : (
          <>
            {finalDisplayList.map((item) => (
              <WordItem
                key={item.id}
                item={item}
                langCode={currentLangCode}
                onEdit={handleOpenEdit}
                onDelete={item.isGuide ? null : handleDeleteWord}
              />
            ))}
            <div ref={observerTarget} className="scroll-trigger" />
          </>
        )}
      </div>

      <motion.button
        onClick={() => setIsAddModalOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="floating-plus-btn"
      >
        <Plus size={32} strokeWidth={2.5} />
      </motion.button>

      <AddWordModal
        isOpen={isAddModalOpen}
        mode="word"
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddWord}
        onAddBulk={handleAddBulk}
        defaultDeckId={currentDeckId}
        defaultDeckName={currentDeckName}
      />

      <EditWordModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        item={targetWord}
        onUpdate={handleUpdateWord}
      />
    </div>
  );
};

export default WordList;
