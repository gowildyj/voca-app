import React from "react";
import { HiOutlinePlus } from "react-icons/hi2";

/**
 * [AddDeckCard]
 * 리스트의 마지막에 위치하여 새로운 항목을 추가하는 트리거 역할을 합니다.
 * @param {string} label - 표시할 문구 (기본값: 새 단어장)
 * @param {function} onClick - 클릭 시 실행할 함수 (예: 모달 오픈)
 */
const AddDeckCard = ({ label = "새 단어장", onClick }) => {
  return (
    <div className="deck-card-add-trigger clickable-bounce" onClick={onClick}>
      <div className="add-card-icon-wrapper">
        <HiOutlinePlus size={24} />
      </div>
      <span className="add-card-text">{label}</span>
    </div>
  );
};

export default AddDeckCard;
