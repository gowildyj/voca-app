import React, { useState, useMemo } from "react";
import { Play, Search, X, ArrowLeft } from "lucide-react"; // ArrowLeft 추가
import { motion, AnimatePresence } from "framer-motion";
import WordItem from "./WordItem";

// ✅ props에 onBack 추가
const WordList = ({ words, onStartStudy, onDeleteWord, onBack }) => {
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

  // 필터링 + 검색 로직
  const filteredWords = useMemo(() => {
    return words.filter((word) => {
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
  }, [words, filter, searchQuery]);

  // 정렬 로직
  const finalWords = useMemo(() => {
    const newList = [...filteredWords];
    if (sortType === "alpha") {
      return newList.sort((a, b) => a.word.localeCompare(b.word));
    } else if (sortType === "shuffle") {
      for (let i = newList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newList[i], newList[j]] = [newList[j], newList[i]];
      }
      return newList;
    }
    return newList;
  }, [filteredWords, sortType, shuffleSeed]);

  // ✅ 정렬 핸들러 추가 (셔플 시 시드 변경)
  const handleSortChange = (e) => {
    const nextSort = e.target.value;
    setSortType(nextSort);
    if (nextSort === "shuffle") setShuffleSeed(Math.random());
  };

  return (
    <div className="word-list-page">
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "20px 0",
        }}
      >
        {/* ✅ 대시보드로 돌아가는 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text)",
            padding: "4px",
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <span className="header-label">MY VOCABULARY</span>
          <h1 style={{ fontSize: "1.8rem", margin: "0", fontWeight: "800" }}>
            단어장
          </h1>
        </div>
      </header>

      {/* 검색창 UI */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "var(--card)",
            padding: "12px 16px",
            borderRadius: "16px",
            gap: "10px",
          }}
        >
          <Search size={18} opacity={0.4} />
          <input
            type="text"
            placeholder="단어나 뜻을 검색해보세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              color: "var(--text)",
              outline: "none",
              fontSize: "0.95rem",
            }}
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
        onClick={() => onStartStudy(finalWords)}
        style={{
          cursor: finalWords.length > 0 ? "pointer" : "not-allowed",
          marginBottom: "24px",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
            {searchQuery ? `'${searchQuery}' 결과 학습` : "학습 시작"}
          </h3>
          <p style={{ margin: "5px 0 0", opacity: 0.8, fontSize: "0.85rem" }}>
            {finalWords.length}개의 단어가 기다리고 있어요
          </p>
        </div>
        <Play fill="white" size={24} />
      </motion.div>

      {/* 필터 탭 UI */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              backgroundColor:
                filter === f.id ? "var(--primary)" : "var(--card)",
              color: filter === f.id ? "white" : "var(--text)",
              fontWeight: "600",
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ✅ 정렬 옵션 UI (누락되었던 부분) */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "10px",
          marginBottom: "15px",
        }}
      >
        {sortType === "shuffle" && (
          <button
            onClick={() => setShuffleSeed(Math.random())}
            style={{
              border: "none",
              background: "none",
              color: "var(--primary)",
              fontSize: "0.75rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            새로 섞기 🔄
          </button>
        )}
        <select
          value={sortType}
          onChange={handleSortChange}
          style={{
            padding: "5px 10px",
            borderRadius: "8px",
            border: "1px solid var(--card)",
            backgroundColor: "transparent",
            color: "var(--text)",
            fontSize: "0.8rem",
            fontWeight: "600",
          }}
        >
          <option value="default">등록순</option>
          <option value="alpha">알파벳순</option>
          <option value="shuffle">무작위 셔플</option>
        </select>
      </div>

      {/* 최종 목록 */}
      <div className="list-container">
        <AnimatePresence mode="popLayout">
          {finalWords.length > 0 ? (
            finalWords.map((item, index) => (
              <WordItem
                key={item.id}
                item={item}
                index={index}
                onDelete={onDeleteWord}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "40px", opacity: 0.5 }}
            >
              결과가 없습니다.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WordList;
