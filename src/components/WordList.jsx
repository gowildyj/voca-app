import React, { useState, useMemo } from "react";
import { Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WordItem from "./WordItem";

const WordList = ({ words, onStartStudy, onDeleteWord }) => {
  const [filter, setFilter] = useState("all");
  const [sortType, setSortType] = useState("default");
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // 1. 필터 버튼 데이터
  const filters = [
    { id: "all", label: "전체" },
    { id: "none", label: "미학습" },
    { id: "unknown", label: "모름" },
    { id: "know", label: "아는단어" },
  ];

  // 2. 필터링 로직 (useMemo)
  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      if (filter === "all") return true;
      if (filter === "none") return !word.status || word.status === "none";
      return word.status === filter;
    });
  }, [words, filter]);

  // 3. 정렬 및 셔플 로직 (useMemo로 통합)
  // useMemo 외부의 불필요한 getSortedWords 함수는 제거했습니다.
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
    return newList; // 'default'
  }, [filteredWords, sortType, shuffleSeed]);

  const handleSortChange = (e) => {
    const nextSort = e.target.value;
    setSortType(nextSort);
    if (nextSort === "shuffle") setShuffleSeed(Math.random());
  };

  return (
    <div className="word-list-page">
      <header>
        <span className="header-label">MY VOCABULARY</span>
        <h1 style={{ fontSize: "2rem", margin: "8px 0", fontWeight: "800" }}>
          단어장
        </h1>
      </header>

      {/* 학습 시작 카드 */}
      <motion.div
        className="study-start-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => onStartStudy(finalWords)}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
            {filter === "all"
              ? "오늘의 학습"
              : `"${filters.find((f) => f.id === filter).label}" 학습`}{" "}
            시작
          </h3>
          <p style={{ margin: "5px 0 0", opacity: 0.8, fontSize: "0.9rem" }}>
            {finalWords.length}개의 단어가 기다리고 있어요
          </p>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.2)",
            padding: "12px",
            borderRadius: "50%",
            display: "flex",
          }}
        >
          <Play fill="white" size={24} />
        </div>
      </motion.div>

      {/* 필터 탭 UI */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          overflowX: "auto",
          paddingBottom: "8px",
        }}
      >
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "10px 18px",
              borderRadius: "20px",
              border: "none",
              backgroundColor:
                filter === f.id ? "var(--primary)" : "var(--card)",
              color: filter === f.id ? "white" : "var(--text)",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 정렬 옵션 UI */}
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

      {/* 필터링 및 정렬된 목록 표시 */}
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
              해당하는 단어가 없습니다.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WordList;
