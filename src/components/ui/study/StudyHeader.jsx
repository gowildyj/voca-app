import React from "react";
import { X, Settings2 } from "lucide-react";
import "@/styles/components/ui/study/studyHeader.css";

const StudyHeader = ({ current, total, onClose, onSettings }) => {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <header className="v-study-header-wrapper">
      <div className="v-header-nav">
        {/* 왼쪽: 닫기 버튼 */}
        <button className="v-icon-btn" onClick={onClose} aria-label="닫기">
          <X size={24} />
        </button>

        {/* 중앙: 진행 텍스트 (Absolute 정렬) */}
        <div className="v-progress-text">
          <span className="v-current">{current}</span>
          <span className="v-divider">/</span>
          <span className="v-total">{total}</span>
        </div>

        {/* 오른쪽: 설정 버튼 */}
        <button className="v-icon-btn" onClick={onSettings} aria-label="설정">
          <Settings2 size={24} />
        </button>
      </div>

      {/* 하단: 진행바 */}
      <div className="v-progress-bar-bg">
        <div
          className="v-progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
};

export default StudyHeader;
