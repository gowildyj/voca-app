import React from "react";
import { HiOutlinePlus } from "react-icons/hi2";
import "@/styles/components/cards/wordCard.css"; // 기존 단어 카드 스타일 활용

/**
 * AddWordCard: 단어 목록 페이지에서 새로운 단어 추가를 유도하는 카드
 * @param {string} searchQuery - 사용자가 입력한 검색어
 * @param {function} onClick - 클릭 시 실행할 추가 함수
 */
const AddWordCard = ({ searchQuery, onClick }) => {
  // 검색어 존재 여부에 따른 문구 설정
  const mainText = searchQuery
    ? `'${searchQuery}' 검색 결과가 없습니다.`
    : "아직 등록된 단어가 없어요!";

  const subText = searchQuery
    ? "이 단어를 새로 추가해볼까요?"
    : "첫 번째 단어를 추가해보세요. 🚀";

  return (
    <div className="v-word-card guide-mode clickable-bounce" onClick={onClick}>
      <div className="v-word-icon-section">
        <div className="add-card-icon-wrapper">
          <HiOutlinePlus size={22} />
        </div>
      </div>

      <div
        className="v-word-body"
        style={{ textAlign: "center", alignItems: "center" }}
      >
        <span className="v-word-main" style={{ whiteSpace: "pre-wrap" }}>
          {mainText}
        </span>
        <span className="v-word-sub" style={{ marginTop: "4px" }}>
          {subText}
        </span>
      </div>

      <div className="v-word-actions" style={{ visibility: "hidden" }}>
        <div style={{ width: "40px" }} />
      </div>
    </div>
  );
};

export default AddWordCard;
