import React from "react";
import { MessageCircle, ChevronRight } from "lucide-react";
import "@/styles/components/cards/scenarioCard.css";

/**
 * [ScenarioCard] 시나리오 학습 목록 아이템
 * @param {object} data - { category, level, title, description }
 * @param {function} onClick - 클릭 핸들러
 */
const ScenarioCard = ({ data, onClick }) => {
  return (
    <div
      className="v-scenario-card-container clickable-bounce"
      onClick={onClick}
    >
      {/* 1. 상단: 태그와 아이콘 */}
      <div className="v-card-header-row">
        <div className="v-category-badge">#{data.category}</div>
        <div className="v-icon-wrapper">
          <MessageCircle size={20} className="v-bubble-icon" />
        </div>
      </div>

      {/* 2. 본문: 제목과 설명 */}
      <div className="v-card-content">
        <div className="v-level-label">{data.level}</div>
        <h3 className="v-scenario-title">{data.title}</h3>
        <p className="v-scenario-desc">{data.description}</p>
      </div>

      {/* 3. 하단: 학습 시작 액션 */}
      <div className="v-card-footer">
        <span className="v-start-text">학습 시작</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
};

export default ScenarioCard;
