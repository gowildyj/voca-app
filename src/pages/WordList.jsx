import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Play, ArrowLeft, Plus } from "lucide-react";
import WordItem from "@/components/WordItem";
import EditWordModal from "@/components/EditWordModal";
import AddWordModal from "@/components/AddWordModal";
import SearchBar from "@/components/wordlist/SearchBar"; // ✅ [분리] 검색바 추출
import FilterBar from "@/components/wordlist/FilterBar"; // ✅ [분리] 필터/정렬바 추출

const WordList = ({
  decks = [],
  onStartStudy,
  onUpdateWord,
  onDeleteWord,
  fetchWordsByDeck,
  onBack,
  onAddWord,
  onAddBulk,
}) => {
  const [filter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [targetWord, setTargetWord] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(50);
  const [localWords, setLocalWords] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const observerTarget = useRef(null);
  const { deckName: urlDeckParam } = useParams();
  const currentDeckName = decodeURIComponent(urlDeckParam || "");

  const foundDeck = decks?.find((d) => d.name === currentDeckName);
  const currentLangCode = foundDeck?.lang_code;

  useEffect(() => {
    const loadData = async () => {
      if (!currentDeckName || typeof fetchWordsByDeck !== "function") return;
      setListLoading(true);
      const data = await fetchWordsByDeck(currentDeckName);
      setLocalWords(data || []);
      setListLoading(false);
    };
    loadData();
  }, [currentDeckName, fetchWordsByDeck]);

  useEffect(() => {
    setDisplayLimit(50);
  }, [searchQuery, filter, sortType]);

  // ✅ [로직 최적화] 정렬 및 필터 가독성 개선
  const filteredWords = useMemo(() => {
    let result = [...localWords].filter((w) => w.word?.trim() !== "");

    // 필터링 로직
    result = result.filter((word) => {
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

    // 정렬 로직
    if (sortType === "alpha")
      result.sort((a, b) => a.word.localeCompare(b.word));
    else if (sortType === "shuffle") result.sort(() => Math.random() - 0.5);

    return result;
  }, [localWords, filter, searchQuery, sortType, shuffleSeed]);

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

  if (listLoading)
    return <div className="loading-screen">단어를 불러오는 중...</div>;

  return (
    <div className="word-list-page">
      <header className="list-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={24} />
        </button>
        <div>
          <span className="header-label">{currentDeckName}</span>
          <h1 className="list-title">단어장</h1>
        </div>
      </header>

      {/* ✅ [분리 적용] 검색바 */}
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

      {/* ✅ [분리 적용] 필터 및 정렬바 */}
      <FilterBar
        currentFilter={filter}
        setFilter={setFilter}
        sortType={sortType}
        setSortType={setSortType}
        onShuffle={() => {
          setShuffleSeed(Math.random());
          setDisplayLimit(50);
        }}
      />

      <div className="list-container">
        {finalDisplayList.map((item, index) => (
          <WordItem
            key={item.id}
            item={item}
            index={index}
            langCode={currentLangCode}
            onEdit={(word) => {
              setTargetWord(word);
              setIsEditOpen(true);
            }}
            onDelete={item.isGuide ? null : onDeleteWord}
          />
        ))}
        <div ref={observerTarget} className="scroll-trigger"></div>
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
        onAdd={onAddWord} // 부모(App)로부터 받은 함수
        onAddBulk={onAddBulk}
        defaultDeck={currentDeckName}
      />

      <EditWordModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        item={targetWord}
        onUpdate={onUpdateWord}
      />
    </div>
  );
};

export default WordList;
