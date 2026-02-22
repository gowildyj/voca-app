import React, { useMemo } from "react";
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Shuffle } from "lucide-react";

const StudyHeader = React.memo(
  ({
    currentIndex = 0,
    totalCount = 0,
    autoPlay = true,
    onToggleAutoPlay,
    onBack,
    onUndo,
    onShuffle,
    isFinished = false,
  }) => {
    const progressPercentage = useMemo(() => {
      if (totalCount <= 0) return 0;
      return Math.min(100, ((currentIndex + 1) / totalCount) * 100);
    }, [currentIndex, totalCount]);

    const canUndo = currentIndex > 0 && !isFinished;

    return (
      <header className="study-header">
        {/* 진행률 바 */}
        <div className="study-progress-bar-container">
          <div
            className="study-progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <button onClick={onBack} className="back-btn" aria-label="뒤로 가기">
          <ArrowLeft size={24} />
        </button>

        <div className="study-progress-text">
          {currentIndex + 1} / {totalCount}
        </div>

        <div className="header-actions-right">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`autoplay-btn ${canUndo ? "active" : ""}`}
            title="이전 단어"
          >
            <RotateCcw size={18} />
          </button>

          <button
            type="button"
            onClick={onShuffle}
            disabled={isFinished}
            className={`autoplay-btn ${!isFinished ? "active" : ""}`}
            title="순서 섞기"
          >
            <Shuffle size={18} />
          </button>

          <button
            type="button"
            onClick={onToggleAutoPlay}
            className={`autoplay-btn ${autoPlay ? "active" : ""}`}
          >
            {autoPlay ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>
    );
  },
);

StudyHeader.displayName = "StudyHeader";
export default StudyHeader;
