import React, { useState, useMemo } from "react";
import { Play, Search, X, ArrowLeft, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WordItem from "./WordItem";

const WordList = ({ words, onStartStudy, onDeleteWord, onBack, deckName }) => {
  const [filter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("default");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filters = [
    { id: "all", label: "전체" },
    { id: "none", label: "미학습" },
    { id: "unknown", label: "모름" },
    { id: "know", label: "아는단어" },
  ];

  // 1. 현재 덱의 진짜 데이터만 필터링 (DB 원본 보존)
  const deckWords = useMemo(() => {
    return words.filter((w) => w.deck === deckName && w.word.trim() !== "");
  }, [words, deckName]);

  // 2. 검색 및 필터링 로직
  const filteredWords = useMemo(() => {
    // 덱에 단어가 아예 없을 때는 가이드 카드를 보여주기 위해 필터를 무시하고 가상의 배열 반환
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
    // 만약 검색어가 없는데 목록이 비어있다? -> 사용자가 처음 만든 빈 덱임
    if (deckWords.length === 0 && !searchQuery) {
      return [
        {
          id: "guide-card",
          word: "첫 단어를 추가해보세요!",
          meaning: "우측 하단의 + 버튼을 눌러 시작하기 🚀",
          status: "none",
          isGuide: true, // 가이드임을 표시
        },
      ];
    }

    // 정렬 로직 적용
    const newList = [...filteredWords];
    if (sortType === "alpha") {
      newList.sort((a, b) => a.word.localeCompare(b.word));
    } else if (sortType === "shuffle") {
      for (let i = newList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newList[i], newList[j]] = [newList[j], newList[i]];
      }
    }
    return newList;
  }, [filteredWords, deckWords, sortType, shuffleSeed, searchQuery]);

  const handleSortChange = (e) => {
    const nextSort = e.target.value;
    setSortType(nextSort);
    if (nextSort === "shuffle") setShuffleSeed(Math.random());
  };

  return (
    <div className="word-list-page">
      <header style={headerStyle}>
        <button onClick={onBack} style={backBtnStyle}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <span className="header-label">{deckName || "MY VOCABULARY"}</span>
          <h1 style={{ fontSize: "1.8rem", margin: "0", fontWeight: "800" }}>
            단어장
          </h1>
        </div>
      </header>

      {/* 검색창 UI (레이아웃 유지) */}
      <div style={searchContainerStyle}>
        <div style={searchBarStyle}>
          <Search size={18} opacity={0.4} />
          <input
            type="text"
            placeholder="단어나 뜻을 검색해보세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInputStyle}
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

      {/* 학습 시작 카드 (단어가 있을 때만 활성화된 느낌으로) */}
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

      {/* 필터 탭 UI (레이아웃 유지) */}
      <div style={filterScrollStyle}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              ...filterBtnBase,
              backgroundColor:
                filter === f.id ? "var(--primary)" : "var(--card)",
              color: filter === f.id ? "white" : "var(--text)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 정렬 옵션 */}
      <div style={sortContainerStyle}>
        {sortType === "shuffle" && (
          <button
            onClick={() => setShuffleSeed(Math.random())}
            style={shuffleResetStyle}
          >
            새로 섞기 🔄
          </button>
        )}
        <select
          value={sortType}
          onChange={handleSortChange}
          style={selectStyle}
        >
          <option value="default">등록순</option>
          <option value="alpha">알파벳순</option>
          <option value="shuffle">무작위 셔플</option>
        </select>
      </div>

      {/* 목록 출력 영역 */}
      <div className="list-container">
        <AnimatePresence mode="popLayout">
          {finalDisplayList.length > 0 ? (
            finalDisplayList.map((item, index) => (
              <WordItem
                key={item.id}
                item={item}
                index={index}
                // 가이드 카드일 때는 삭제 기능을 막음
                onDelete={item.isGuide ? null : onDeleteWord}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={noResultStyle}
            >
              결과가 없습니다.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// 스타일 객체들
const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "20px 0",
};
const backBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--text)",
  padding: "4px",
};
const searchContainerStyle = { position: "relative", marginBottom: "20px" };
const searchBarStyle = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "var(--card)",
  padding: "12px 16px",
  borderRadius: "16px",
  gap: "10px",
};
const searchInputStyle = {
  flex: 1,
  border: "none",
  background: "transparent",
  color: "var(--text)",
  outline: "none",
  fontSize: "0.95rem",
};
const filterScrollStyle = {
  display: "flex",
  gap: "8px",
  marginBottom: "16px",
  overflowX: "auto",
  paddingBottom: "4px",
};
const filterBtnBase = {
  padding: "8px 16px",
  borderRadius: "20px",
  border: "none",
  fontWeight: "600",
  fontSize: "0.85rem",
  whiteSpace: "nowrap",
  cursor: "pointer",
};
const sortContainerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "10px",
  marginBottom: "15px",
};
const shuffleResetStyle = {
  border: "none",
  background: "none",
  color: "var(--primary)",
  fontSize: "0.75rem",
  cursor: "pointer",
  fontWeight: "bold",
};
const selectStyle = {
  padding: "5px 10px",
  borderRadius: "8px",
  border: "1px solid var(--card)",
  backgroundColor: "transparent",
  color: "var(--text)",
  fontSize: "0.8rem",
  fontWeight: "600",
};
const noResultStyle = { textAlign: "center", padding: "40px", opacity: 0.5 };

export default WordList;
