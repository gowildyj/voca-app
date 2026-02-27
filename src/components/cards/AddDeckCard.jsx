import React from "react";
import { HiOutlinePlus } from "react-icons/hi2";

/**
 * [AddDeckCard] 가로형 레이아웃 + 메인/서브 텍스트 분리
 */
const AddDeckCard = ({ searchQuery, onClick }) => {
  // 검색어 유무에 따른 동적 문구 설정
  const mainText = searchQuery
    ? `'${searchQuery}' 결과가 없습니다.`
    : "새 단어장 만들기";

  const subText = searchQuery
    ? "이 이름으로 새 단어장을 만들까요?"
    : "나만의 단어장을 추가해 보세요. 🚀";

  return (
    <div className="deck-card-add-trigger clickable-bounce" onClick={onClick}>
      <div className="add-card-icon-section">
        <div className="add-card-icon-wrapper">
          <HiOutlinePlus size={24} />
        </div>
      </div>

      <div className="add-card-body-section">
        <span className="add-card-text-main">{mainText}</span>
        <span className="add-card-text-sub">{subText}</span>
      </div>
    </div>
  );
};

export default AddDeckCard;
