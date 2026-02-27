// src/components/ui/study/StudyResult.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, List, ChevronRight } from "lucide-react";
import "@/styles/pages/studyResult.css";

const StudyResult = ({ total, counts, onRetryUnknown, deckId }) => {
  const navigate = useNavigate();

  // 정답률 계산
  const successRate = total > 0 ? Math.round((counts.know / total) * 100) : 0;

  return (
    <div className="v-result-container">
      <div className="v-result-header">
        <div className="v-result-icon">🎉</div>
        <h1 className="v-result-title">학습 완료!</h1>
        <p className="v-result-subtitle">
          오늘도 한 걸음 더 성장하셨네요, Stella님!
        </p>
      </div>

      {/* <div className="v-result-score-section">
        <div className="v-score-circle">
          <span className="v-score-number">{successRate}</span>
          <span className="v-score-unit">%</span>
        </div>
        <p className="v-score-label">정답률</p>
      </div> */}

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
        <button
          className="v-result-btn secondary"
          onClick={() => navigate(`/decks/${deckId}`)}
        >
          <List size={18} />
          단어 목록으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default StudyResult;
