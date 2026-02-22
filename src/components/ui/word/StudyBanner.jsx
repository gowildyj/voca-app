import React from "react";
import { Play } from "lucide-react";
import "@/styles/components/ui/word/studyBanner.css";

/**
 * [StudyBanner]
 * 단어 목록 상단에 위치한 '학습 시작' 배너 (HeroCard의 경량화 버전)
 * @param {string} title - 메인 타이틀 (기본값: "학습 시작")
 * @param {number} count - 학습할 단어 수
 * @param {function} onClick - 클릭 핸들러
 */
const StudyBanner = ({ title = "학습 시작", count = 0, onClick }) => {
  return (
    <div
      className="study-banner clickable-bounce"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="study-banner-content">
        <div className="study-text-group">
          <h2 className="study-title">{title}</h2>
          <p className="study-subtitle">{count}개의 단어 준비됨</p>
        </div>

        <div className="study-icon-wrapper">
          <Play size={24} fill="white" className="study-play-icon" />
        </div>
      </div>
    </div>
  );
};

export default StudyBanner;
