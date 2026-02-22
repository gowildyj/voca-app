import React from "react";
import { FilePenLine, PenLine, Trash2 } from "lucide-react";
import "@/styles/components/ui/word/wordListHeader.css";

/**
 * [WordListHeader] 단어 리스트 페이지 전용 헤더
 * @param {string} title - 단어장 제목
 * @param {string} description - 단어장 설명
 * @param {function} onBulkEdit - 일괄 수정 핸들러
 * @param {function} onEditDeck - 단어장 정보 수정 핸들러
 * @param {function} onDeleteDeck - 단어장 삭제 핸들러
 */
const WordListHeader = ({
  title,
  description,
  onBulkEdit,
  onEditDeck,
  onDeleteDeck,
}) => {
  return (
    <div className="v-word-list-header">
      {/* 1. 상단 영역: 제목과 관리 버튼들 */}
      <div className="v-list-header-top">
        <h1 className="v-list-header-title">{title}</h1>

        <div className="v-list-header-actions">
          <button
            className="v-deck-action-btn"
            onClick={onBulkEdit}
            title="일괄 수정"
          >
            <FilePenLine size={20} />
          </button>
          <button
            className="v-deck-action-btn"
            onClick={onEditDeck}
            title="단어장 수정"
          >
            <PenLine size={20} />
          </button>
          <button
            className="v-deck-action-btn delete"
            onClick={onDeleteDeck}
            title="단어장 삭제"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* 2. 하단 영역: 설명 문구 */}
      {description && <p className="v-list-header-desc">{description}</p>}
    </div>
  );
};

export default WordListHeader;
