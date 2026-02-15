import React, { useCallback } from "react";
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
    // 이전 단어 버튼 활성화 조건
    const canUndo = currentIndex > 0 && !isFinished;

    return (
      <header className="study-header">
        <button onClick={onBack} className="back-btn" aria-label="뒤로 가기">
          <ArrowLeft size={24} />
        </button>

        <div className="study-progress-text">
          {currentIndex + 1} / {totalCount}
        </div>

        <div className="header-actions-right">
          {/* 이전 단어 */}
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`autoplay-btn ${canUndo ? "active" : ""}`}
            title="이전 단어"
          >
            <RotateCcw size={18} />
          </button>

          {/* 순서 섞기 */}
          <button
            type="button"
            onClick={onShuffle}
            disabled={isFinished}
            className={`autoplay-btn ${!isFinished ? "active" : ""}`}
            title="순서 섞기"
          >
            <Shuffle size={18} />
          </button>

          {/* 자동 재생 토글 */}
          <button
            type="button"
            onClick={onToggleAutoPlay}
            className={`autoplay-btn ${autoPlay ? "active" : ""}`}
            aria-label={autoPlay ? "자동 재생 켜짐" : "자동 재생 꺼짐"}
          >
            {autoPlay ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </header>
    );
  },
);

StudyHeader.displayName = "StudyHeader";

export default StudyHeader;
