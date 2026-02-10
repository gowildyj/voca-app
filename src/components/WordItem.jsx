import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Trash2,
  Volume2,
  Sparkles,
} from "lucide-react";
import IconButton from "./common/IconButton";
import { speak } from "../utils/tts";

const WordItem = ({ item, index, onDelete }) => {
  // ✅ 가이드 카드 여부 확인
  const isGuide = item.isGuide;

  return (
    <motion.div
      className={`word-item-card ${isGuide ? "guide-mode" : ""}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      style={isGuide ? guideCardStyle : {}}
    >
      <div className="word-item-icon">
        {/* 가이드일 때는 반짝이 아이콘으로 변경 */}
        {isGuide ? (
          <Sparkles size={20} color="var(--accent)" />
        ) : (
          <BookOpen size={20} />
        )}
      </div>

      <div className="word-item-content">
        <div
          className="word-text"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          {item.word}

          {/* ✅ 가이드가 아닐 때만 스피커 아이콘 표시 */}
          {!isGuide && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(item.word, item.deck);
              }}
              style={speakerBtnStyle}
            >
              <Volume2 size={18} />
            </button>
          )}
        </div>
        <div className="word-meaning">{item.meaning}</div>
      </div>

      {/* ✅ 가이드가 아닐 때만 삭제 버튼 표시 (onDelete가 함수인지 체크) */}
      {!isGuide && onDelete && (
        <IconButton
          icon={Trash2}
          color="#ef4444"
          size={18}
          onClick={() => onDelete(item.id)}
          className="delete-btn"
        />
      )}

      {/* 가이드일 때는 화살표 대신 힌트 텍스트나 아이콘 유지 */}
      {!isGuide && <ChevronRight size={18} className="chevron-icon" />}
    </motion.div>
  );
};

// --- 인라인 스타일 (필요시 CSS 파일로 이동 가능) ---

const guideCardStyle = {
  border: "2px dashed var(--accent)",
  backgroundColor: "transparent",
  boxShadow: "none",
  opacity: 0.8,
  cursor: "default",
};

const speakerBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--primary)",
  opacity: 0.6,
  display: "flex",
  alignItems: "center",
  padding: "4px",
  borderRadius: "50%",
};

export default WordItem;
