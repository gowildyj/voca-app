import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Play, Search, X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WordItem from "@WordItem";
import EditWordModal from "@EditWordModal";

const WordList = ({
  words = [], // 기본값 설정으로 에러 방지
  decks = [], // ✅ Props로 확실히 받음
  onStartStudy,
  onUpdateWord,
  onDeleteWord,
  onBack,
}) => {
  const [filter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("default");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [targetWord, setTargetWord] = useState(null);

  // ✅ 1. URL 파라미터에서 추출 (변수명 겹치지 않게 주의)
  const { deckName: urlDeckParam } = useParams();
  const currentDeckName = decodeURIComponent(urlDeckParam || "");

  // ✅ 2. decks 배열이 들어왔을 때만 find 실행
  const foundDeck = decks?.find((d) => d.name === currentDeckName);
  const currentLangCode = foundDeck?.lang_code;

  const handleEditClick = (word) => {
    setTargetWord(word);
    setIsEditOpen(true);
  };

  const filters = [
    { id: "all", label: "전체" },
    { id: "none", label: "미학습" },
    { id: "unknown", label: "모름" },
    { id: "know", label: "아는단어" },
  ];

  // 1. 현재 덱의 데이터 필터링
  const deckWords = useMemo(() => {
    return words.filter(
      (w) => w.deck === currentDeckName && w.word?.trim() !== "",
    );
  }, [words, currentDeckName]);

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

  // 3. 최종 출력 리스트 구성
  const finalDisplayList = useMemo(() => {
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
          <span className="header-label">{currentDeckName}</span>
          <h1 style={{ fontSize: "1.8rem", margin: "0", fontWeight: "800" }}>
            단어장
          </h1>
        </div>
      </header>

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

      <motion.div
        className="study-start-card"
        onClick={() =>
          deckWords.length > 0 &&
          onStartStudy(finalDisplayList, currentDeckName)
        }
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

      <div className="sort-container">
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

      <div className="list-container">
        <AnimatePresence mode="popLayout">
          {finalDisplayList.length > 0 ? (
            finalDisplayList.map((item, index) => (
              <WordItem
                key={item.id}
                item={item}
                index={index}
                langCode={currentLangCode} // ✅ 내부 변수명으로 변경
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
        onUpdate={onUpdateWord}
      />
    </div>
  );
};

export default WordList;
