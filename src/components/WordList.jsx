import React, { useState, useMemo } from "react";
import { Play, Search, X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WordItem from "./WordItem";
import EditWordModal from "./EditWordModal";

const WordList = ({
  words,
  onStartStudy,
  onUpdateWord,
  onDeleteWord,
  onBack,
  deckName,
  langCode,
}) => {
  const [filter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("default");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [targetWord, setTargetWord] = useState(null);

  const handleEditClick = (word) => {
    setTargetWord(word); // 수정할 단어 데이터 저장
    setIsEditOpen(true); // 모달 열기
  };

  const filters = [
    { id: "all", label: "전체" },
    { id: "none", label: "미학습" },
    { id: "unknown", label: "모름" },
    { id: "know", label: "아는단어" },
  ];

  // 1. 현재 덱의 진짜 데이터만 필터링
  const deckWords = useMemo(() => {
    return words.filter((w) => w.deck === deckName && w.word?.trim() !== "");
  }, [words, deckName]);

  // 2. 검색 및 필터링 로직
  const filteredWords = useMemo(() => {
    if (deckWords.length === 0) return [];

    return deckWords.filter((word) => {
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
  }, [deckWords, filter, searchQuery]);

  // 3. 최종 출력 리스트 구성 (비어있을 때 가이드 카드 삽입)
  const finalDisplayList = useMemo(() => {
    // 덱이 완전히 비어있는 경우 가이드 표시
    if (deckWords.length === 0 && !searchQuery) {
      return [
        {
          id: "guide-card",
          word: "첫 단어를 추가해보세요!",
          meaning: "우측 하단의 + 버튼을 눌러 시작하기 🚀",
          status: "none",
          isGuide: true,
        },
      ];
    }

    let newList = [...filteredWords];

    // 정렬 로직
    if (sortType === "alpha") {
      newList.sort((a, b) => a.word.localeCompare(b.word));
    } else if (sortType === "shuffle") {
      newList.sort(() => Math.random() - 0.5);
    }
    return newList;
  }, [filteredWords, deckWords, sortType, shuffleSeed, searchQuery]);

  return (
    <div className="word-list-page">
      <header className="list-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft size={24} />
        </button>
        <div>
          <span className="header-label">{deckName || "MY VOCABULARY"}</span>
          <h1 style={{ fontSize: "1.8rem", margin: "0", fontWeight: "800" }}>
            단어장
          </h1>
        </div>
      </header>

      {/* 검색 영역 */}
      <div className="search-container">
        <div className="search-bar">
          <Search size={18} opacity={0.4} />
          <input
            type="text"
            className="search-input"
            placeholder="단어나 뜻을 검색해보세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <X
              size={18}
              style={{ cursor: "pointer", opacity: 0.5 }}
              onClick={() => setSearchQuery("")}
            />
          )}
        </div>
      </div>

      {/* 학습 시작 카드 */}
      <motion.div
        className="study-start-card"
        onClick={() => deckWords.length > 0 && onStartStudy(finalDisplayList)}
        style={{
          cursor: deckWords.length > 0 ? "pointer" : "default",
          opacity: deckWords.length > 0 ? 1 : 0.5,
          marginBottom: "24px",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>학습 시작</h3>
          <p style={{ margin: "5px 0 0", opacity: 0.8, fontSize: "0.85rem" }}>
            {deckWords.length}개의 단어가 준비되어 있습니다
          </p>
        </div>
        <Play fill="white" size={24} />
      </motion.div>

      {/* 필터 탭 */}
      <div className="filter-scroll-container">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`filter-btn ${filter === f.id ? "active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 정렬 옵션 */}
      <div className="sort-container">
        {sortType === "shuffle" && (
          <button
            onClick={() => setShuffleSeed(Math.random())}
            className="shuffle-reset-btn"
          >
            새로 섞기 🔄
          </button>
        )}
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="sort-select"
        >
          <option value="default">등록순</option>
          <option value="alpha">알파벳순</option>
          <option value="shuffle">무작위 셔플</option>
        </select>
      </div>

      {/* 목록 출력 */}
      <div className="list-container">
        <AnimatePresence mode="popLayout">
          {finalDisplayList.length > 0 ? (
            finalDisplayList.map((item, index) => (
              <WordItem
                key={item.id}
                item={item}
                index={index}
                langCode={langCode}
                onEdit={handleEditClick}
                onDelete={item.isGuide ? null : onDeleteWord}
              />
            ))
          ) : (
            <div className="no-result">결과가 없습니다.</div>
          )}
        </AnimatePresence>
      </div>
      <EditWordModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        item={targetWord}
        onUpdate={onUpdateWord} // useWords에서 만든 updateWord 함수
      />
    </div>
  );
};

export default WordList;
