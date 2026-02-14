import React from "react";
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Shuffle } from "lucide-react";

const StudyHeader = ({
  currentIndex,
  totalCount,
  autoPlay,
  onToggleAutoPlay,
  onBack,
  onUndo,
  onShuffle,
  isFinished,
}) => (
  <header className="study-header">
    <button onClick={onBack} className="back-btn">
      <ArrowLeft size={24} />
    </button>

    <div className="study-progress-text">
      {currentIndex + 1} / {totalCount}
    </div>

    <div className="header-actions-right">
      <button
        type="button"
        onClick={onUndo}
        disabled={currentIndex === 0 || isFinished}
        className="autoplay-btn active"
        title="이전 단어"
      >
        <RotateCcw size={18} />
      </button>
      <button
        type="button"
        onClick={onShuffle}
        disabled={isFinished}
        className="autoplay-btn active"
        title="순서 섞기"
      >
        <Shuffle size={18} />
      </button>
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

export default StudyHeader;
