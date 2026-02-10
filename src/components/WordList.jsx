import React from "react";
import wordData from "../data/words.json";
import { Play, BookOpen, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const WordList = ({ onStartStudy }) => {
  return (
    <div className="word-list-page">
      <header style={{ padding: "40px 0 20px" }}>
        <span
          style={{
            color: "var(--primary)",
            fontWeight: "700",
            fontSize: "0.9rem",
            letterSpacing: "1px",
          }}
        >
          MY VOCABULARY
        </span>
        <h1 style={{ fontSize: "2rem", margin: "8px 0", fontWeight: "800" }}>
          단어장
        </h1>
      </header>

      {/* 학습 시작 플로팅 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
          padding: "24px",
          borderRadius: "24px",
          color: "white",
          marginBottom: "30px",
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={onStartStudy}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
            오늘의 학습을 시작할까요?
          </h3>
          <p style={{ margin: "5px 0 0", opacity: 0.8, fontSize: "0.9rem" }}>
            {wordData.length}개의 단어가 기다리고 있어요
          </p>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.2)",
            padding: "12px",
            borderRadius: "50%",
          }}
        >
          <Play fill="white" size={24} />
        </div>
      </motion.div>

      <div className="list-container">
        {wordData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              backgroundColor: "var(--card)",
              marginBottom: "12px",
              padding: "18px 20px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                backgroundColor: "var(--bg)",
                padding: "10px",
                borderRadius: "12px",
                color: "var(--primary)",
              }}
            >
              <BookOpen size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                {item.word}
              </div>
              <div
                style={{ fontSize: "0.9rem", opacity: 0.6, marginTop: "2px" }}
              >
                {item.meaning}
              </div>
            </div>
            <ChevronRight size={18} opacity={0.3} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WordList;
