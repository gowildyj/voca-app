import React from "react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";

const StudyHeader = ({
  currentIndex,
  totalCount,
  autoPlay,
  onToggleAutoPlay,
  onBack,
}) => (
  <header className="study-header">
    <button onClick={onBack} className="back-btn">
      <ArrowLeft size={24} />
    </button>
    <div className="study-progress-text">
      {currentIndex + 1} / {totalCount}
    </div>
    <button
      type="button"
      onClick={onToggleAutoPlay}
      className={`autoplay-btn ${autoPlay ? "active" : ""}`}
      aria-label={autoPlay ? "자동 재생 켜짐" : "자동 재생 꺼짐"}
    >
      {autoPlay ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  </header>
);

export default StudyHeader;
