import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Edit3,
  Trash2,
  Volume2,
  Sparkles,
} from "lucide-react";
import IconButton from "./common/IconButton";
import { speak } from "../utils/tts";

const WordItem = ({ item, index, onEdit, onDelete, langCode }) => {
  if (!item) return null;

  const isGuide = item.isGuide || false;

  return (
    <motion.div
      className={`word-item-card ${isGuide ? "guide-mode" : ""}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="word-item-icon">
        {isGuide ? (
          <Sparkles size={20} className="guide-icon" />
        ) : (
          <BookOpen size={20} />
        )}
      </div>

      <div className="word-item-content">
        <div className="word-text-wrapper">
          <span className="word-text">{item.word}</span>

          {!isGuide && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(item.word, langCode); // ✅ DB의 langCode 사용
              }}
              className="speaker-btn"
            >
              <Volume2 size={18} />
            </button>
          )}
        </div>
        <div className="word-meaning">{item.meaning}</div>
      </div>

      {/* 수정 버튼 추가 */}
      {!isGuide && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
            onEdit(item);
          }}
          className="deck-action-btn"
        >
          <Edit3 size={18} />
        </button>
      )}

      {!isGuide && onDelete && (
        <IconButton
          icon={Trash2}
          color="#ef4444"
          size={18}
          onClick={() => onDelete(item.id)}
          className="delete-btn"
        />
      )}

      {!isGuide && <ChevronRight size={18} className="chevron-icon" />}
    </motion.div>
  );
};

export default WordItem;
