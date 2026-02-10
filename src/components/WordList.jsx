import React, { useState, useMemo } from "react";
import { Play, Search, X } from "lucide-react"; // Search, X 아이콘 추가
import { motion, AnimatePresence } from "framer-motion";
import WordItem from "./WordItem";

const WordList = ({ words, onStartStudy, onDeleteWord }) => {
  const [filter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("default");
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // ✅ 1. 검색어 상태 추가
  const [searchQuery, setSearchQuery] = useState("");

  const filters = [
    { id: "all", label: "전체" },
    { id: "none", label: "미학습" },
    { id: "unknown", label: "모름" },
    { id: "know", label: "아는단어" },
  ];

  // ✅ 2. 필터링 + 검색 로직 통합 (useMemo)
  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      // (1) 탭 필터링
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "none"
            ? !word.status || word.status === "none"
            : word.status === filter;

      // (2) 검색어 필터링 (단어 또는 뜻에 검색어가 포함되는지 확인)
      const matchesSearch =
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.meaning.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [words, filter, searchQuery]);

  // 3. 정렬 로직 (이전과 동일)
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

  return (
    <div className="word-list-page">
      <header>
        <span className="header-label">MY VOCABULARY</span>
        <h1 style={{ fontSize: "2rem", margin: "8px 0", fontWeight: "800" }}>
          단어장
        </h1>
      </header>

      {/* ✅ 3. 검색창 UI 추가 */}
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

      {/* 학습 시작 카드 (finalWords 기준) */}
      <motion.div
        className="study-start-card"
        onClick={() => onStartStudy(finalWords)}
        style={{ cursor: finalWords.length > 0 ? "pointer" : "not-allowed" }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
            {searchQuery ? `'${searchQuery}' 결과 학습` : "학습 시작"}
          </h3>
          <p style={{ margin: "5px 0 0", opacity: 0.8, fontSize: "0.9rem" }}>
            {finalWords.length}개의 단어가 기다리고 있어요
          </p>
        </div>
        <Play fill="white" size={24} />
      </motion.div>

      {/* 필터 탭 & 정렬 옵션 (기존 코드 유지) */}
      {/* ... */}

      {/* 4. 최종 목록 */}
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
              검색 결과가 없습니다.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WordList;
