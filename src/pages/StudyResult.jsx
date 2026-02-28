import React from "react";
import { RotateCcw, List } from "lucide-react";
import StudyHeader from "@/components/ui/study/StudyHeader";
import "@/styles/pages/studyResult.css";

const StudyResult = ({ total, counts, onRetryUnknown, onClose }) => {
  return (
    // 전체 페이지 레이아웃 (StudySession과 동일한 구조)
    <div
      className="v-result-page"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
      }}
    >
      {/* 1. 상단 헤더 (설정 버튼 없이 렌더링) */}
      <div
        className="study-header-area"
        style={{ height: "60px", flexShrink: 0 }}
      >
        <StudyHeader
          current={0} // 0을 넘겨서 "학습 결과" 텍스트 표시
          total={0}
          onClose={onClose}
          // onSettings를 넘기지 않으므로 설정 버튼 숨겨짐
        />
      </div>

      {/* 2. 스크롤 가능한 컨텐츠 영역 */}
      <div
        className="v-result-scroll-content"
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div className="v-result-container v-fade-in">
          <div className="v-result-header">
            <div className="v-result-icon">🎉</div>
            <h1 className="v-result-title">학습 완료!</h1>
            <p className="v-result-subtitle">
              오늘도 한 걸음 더 성장하셨네요! 🚀
            </p>
          </div>

          <div className="v-result-stats-grid">
            <div className="v-stat-item know">
              <span className="v-stat-count">{counts.know}</span>
              <span className="v-stat-label">알아요</span>
            </div>
            <div className="v-stat-item unknown">
              <span className="v-stat-count">{counts.unknown}</span>
              <span className="v-stat-label">몰라요</span>
            </div>
          </div>

          <div className="v-result-actions">
            {counts.unknown > 0 && (
              <button className="v-result-btn primary" onClick={onRetryUnknown}>
                <RotateCcw size={18} />
                틀린 단어 다시 풀기 ({counts.unknown}개)
              </button>
            )}

            <button className="v-result-btn secondary" onClick={onClose}>
              <List size={18} />
              학습 종료 (목록으로)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyResult;
