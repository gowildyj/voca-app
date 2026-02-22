import React from "react";
import { Play } from "lucide-react";
import "@/styles/components/cards/heroCard.css";

/**
 * [HeroCard] 메인 학습 유도 카드
 * @param {string} title - 메인 제목
 * @param {string} subTitle - 보조 설명
 * @param {string} badge - 상단 강조 뱃지 (예: DAILY, NEW)
 * @param {string} variant - 'hero' (홈 화면용) | 'banner' (리스트 상단용)
 * @param {function} onClick - 클릭 핸들러
 */
const HeroCard = ({ title, subTitle, badge, variant = "hero", onClick }) => {
  return (
    <div
      className={`v-hero-card-wrapper ${variant} clickable-bounce`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="v-hero-card-content">
        <div className="v-hero-text-group">
          {/* 뱃지는 데이터가 있고, hero 타입일 때만 표시 */}
          {badge && variant === "hero" && (
            <span className="v-hero-badge">{badge}</span>
          )}
          <h2 className="v-hero-title">{title}</h2>
          <p className="v-hero-subtitle">{subTitle}</p>
        </div>

        <div className="v-hero-icon-wrapper">
          <Play
            size={variant === "hero" ? 28 : 22}
            fill="white"
            className="v-play-icon"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroCard;
