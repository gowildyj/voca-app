// src/components/WordItem.jsx
import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Trash2 } from "lucide-react";
import IconButton from "./common/IconButton";

const WordItem = ({ item, index, onDelete }) => {
  return (
    <motion.div
      className="word-item-card" // 이 클래스명이 CSS와 일치해야 합니다.
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="word-item-icon">
        <BookOpen size={20} />
      </div>

      <div className="word-item-content">
        <div className="word-text">{item.word}</div>
        <div className="word-meaning">{item.meaning}</div>
      </div>

      <IconButton
        icon={Trash2}
        color="#ef4444"
        size={18}
        onClick={() => onDelete(item.id)}
        className="delete-btn"
      />

      <ChevronRight size={18} className="chevron-icon" />
    </motion.div>
  );
};

export default WordItem;
