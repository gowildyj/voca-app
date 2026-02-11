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
      onClick={onToggleAutoPlay}
      className="autoplay-btn"
      style={{
        backgroundColor: autoPlay ? "rgba(108, 92, 231, 0.1)" : "var(--card)",
        color: autoPlay ? "var(--primary)" : "#999",
      }}
    >
      {autoPlay ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  </header>
);

export default StudyHeader;
