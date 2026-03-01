import React from "react";
import { X, Settings2 } from "lucide-react";
import "@/styles/components/ui/study/studyHeader.css";

const StudyHeader = ({ current, total, onClose, onSettings }) => {
  // total이 0이면 결과 화면으로 간주
  const isResultMode = total === 0;

  // 진행률 계산
  const progress = isResultMode ? 100 : ((current - 1) / total) * 100;

  // 텍스트 표시 로직
  const progressText = isResultMode ? "학습 결과" : `${current} / ${total}`;

  return (
    <header className="v-study-header-wrapper">
      <div className="v-header-nav">
        {/* 왼쪽: 닫기 버튼 */}
        <button className="v-icon-btn" onClick={onClose} aria-label="닫기">
          <X size={24} />
        </button>

        {/* 중앙: 진행 텍스트 */}
        <div className="v-progress-text">{progressText}</div>

        {/* 오른쪽: 설정 버튼 (onSettings가 있을 때만 렌더링) */}
        {/* <div className="v-header-right">
          {onSettings ? (
            <button
              className="v-icon-btn"
              onClick={onSettings}
              aria-label="설정"
            >
              <Settings2 size={24} />
            </button>
          ) : (
            // 버튼이 없을 때 레이아웃 균형을 위한 투명 공간 (선택 사항)
            <div style={{ width: 40, height: 40 }} />
          )}
        </div> */}
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
