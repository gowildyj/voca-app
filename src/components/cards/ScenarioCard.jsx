import React from "react";
import { MessageCircle } from "lucide-react";
import "@/styles/components/cards/scenarioCard.css";

const ScenarioCard = ({
  title,
  description,
  level, // '초급', '중급', '고급' 등
  tags = [], // ['#카페', '#여행'] 등
  icon,
  onClick,
}) => {
  return (
    <div className="v-scenario-card clickable-bounce" onClick={onClick}>
      <div className="v-scenario-card-header">
        <div className="v-scenario-main-info">
          {/* 좌측 아이콘 영역 */}
          <div className="v-scenario-icon-wrapper">
            {icon ? (
              <span className="v-scenario-emoji">{icon}</span>
            ) : (
              <MessageCircle className="v-scenario-default-icon" size={24} />
            )}
          </div>

          {/* 중앙 텍스트 영역 */}
          <div className="v-scenario-text-content">
            <h4 className="v-scenario-title">{title}</h4>
            <p className="v-scenario-desc">{description}</p>
          </div>
        </div>

        {/* 우측 상단: 난이도 뱃지 (기존 수정/삭제 버튼 위치) */}
        <div className="v-scenario-badge-area">
          <span
            className={`v-level-badge ${level === "초급" ? "beginner" : level === "중급" ? "intermediate" : "advanced"}`}
          >
            {level}
          </span>
        </div>
      </div>

      {/* 하단: 태그 영역 (기존 프로그레스바 위치) */}
      <div className="v-scenario-card-footer">
        <div className="v-scenario-tags">
          {tags.map((tag, index) => (
            <span key={index} className="v-scenario-tag-item">
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScenarioCard;
