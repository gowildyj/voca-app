import React, { useState } from "react";
import { Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WordItem from "./WordItem";

const WordList = ({ words, onStartStudy, onDeleteWord }) => {
  // 1. 현재 선택된 필터 상태 (all, none, unknown, know)
  const [filter, setFilter] = useState("all");

  // 2. 필터링 로직
  const filteredWords = words.filter((word) => {
    if (filter === "all") return true;
    if (filter === "none") return !word.status || word.status === "none";
    return word.status === filter;
  });

  // 필터 버튼 데이터
  const filters = [
    { id: "all", label: "전체" },
    { id: "none", label: "미학습" },
    { id: "unknown", label: "모름" },
    { id: "know", label: "아는단어" },
  ];

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
        onClick={() => onStartStudy(filteredWords)}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
            {filter === "all"
              ? "오늘의 학습"
              : `"${filters.find((f) => f.id === filter).label}" 학습`}{" "}
            시작
          </h3>
          <p style={{ margin: "5px 0 0", opacity: 0.8, fontSize: "0.9rem" }}>
            {filteredWords.length}개의 단어가 기다리고 있어요
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

      {/* 3. 필터 탭 UI 추가 */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          overflowX: "auto",
          paddingBottom: "8px",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
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
              fontSize: "0.9rem",
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow:
                filter === f.id ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 4. 필터링된 목록 표시 */}
      <div className="list-container">
        <AnimatePresence mode="popLayout">
          {filteredWords.length > 0 ? (
            filteredWords.map((item, index) => (
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
