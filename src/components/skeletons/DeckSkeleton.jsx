import React from "react";
import "@/styles/components/skeletons/deckSkeleton.css";

const DeckSkeleton = () => {
  return (
    <div className="deck-card skeleton-card">
      {/* 1. 헤더 영역 (아이콘 + 텍스트) */}
      <div className="deck-card-header">
        <div className="deck-card-main-info">
          {/* 아이콘 자리 */}
          <div className="deck-card-icon-wrapper skeleton-box icon-box" />

          {/* 텍스트 자리 */}
          <div className="deck-text-content">
            <div className="skeleton-box title-line" />
            <div className="skeleton-box info-line" />
          </div>
        </div>

        {/* 액션 버튼 자리 (3개) */}
        <div className="deck-actions">
          <div className="skeleton-box action-circle" />
          <div className="skeleton-box action-circle" />
          <div className="skeleton-box action-circle" />
        </div>
      </div>

      {/* 2. 푸터 영역 (진행바 + 퍼센트) */}
      <div className="deck-card-footer">
        <div className="progress-container skeleton-box progress-bar-bg" />
        <div className="skeleton-box percent-text" />
      </div>
    </div>
  );
};

export default DeckSkeleton;
