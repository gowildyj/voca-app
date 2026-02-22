import React from "react";
import { MessageCircle, ChevronRight } from "lucide-react";
import "@/styles/components/ui/scenario/scenarioCard.css";

const ScenarioCard = ({ data, onClick }) => {
  return (
    <div className="scenario-card-container" onClick={onClick}>
      {/* 1. 카드 상단: 태그와 아이콘 */}
      <div className="card-header-row">
        <div className="category-badge">#{data.category}</div>
        <div className="icon-wrapper">
          <MessageCircle size={20} className="bubble-icon" />
        </div>
      </div>

      {/* 2. 카드 본문: 제목과 설명 */}
      <div className="card-content">
        <div className="level-label">{data.level}</div>
        <h3 className="scenario-title">{data.title}</h3>
        <p className="scenario-desc">{data.description}</p>
      </div>

      {/* 3. 하단 액션: 학습 시작 버튼 느낌 */}
      <div className="card-footer">
        <span className="start-text">학습 시작</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
};

export default ScenarioCard;
