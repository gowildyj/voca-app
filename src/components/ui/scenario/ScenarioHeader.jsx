// import React from "react";
// import { ArrowLeft } from "lucide-react";

// const ScenarioHeader = ({ title, subtitle, onBack }) => (
//   <header className="list-header">
//     <div className="header-title-row">
//       <button className="back-btn" onClick={onBack}>
//         <ArrowLeft size={24} />
//       </button>
//       <h1 className="list-header-title">{title}</h1>
//     </div>
//     <h2 className="list-header-subtitle">{subtitle}</h2>
//   </header>
// );

// export default ScenarioHeader;

import React from "react";
import { X, Settings2 } from "lucide-react";
import "@/styles/components/ui/study/studyHeader.css";

const StudyHeader = ({ title, onClose, onSettings }) => {
  return (
    <header className="v-scenario-header-wrapper">
      <div className="v-header-nav">
        {/* 왼쪽: 닫기 버튼 */}
        <button className="v-icon-btn" onClick={onClose} aria-label="닫기">
          <X size={24} />
        </button>

        {/* 중앙: 진행 텍스트 (Absolute 정렬) */}
        <div className="v-progress-text">
          <span className="v-scenario-title">{title}</span>
        </div>

        {/* 오른쪽: 설정 버튼 */}
        <button className="v-icon-btn" onClick={onSettings} aria-label="설정">
          <Settings2 size={24} />
        </button>
      </div>
    </header>
  );
};

export default StudyHeader;
