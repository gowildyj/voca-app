import React from "react";
import { RotateCcw, Play, Pause, Shuffle } from "lucide-react";
import "@/styles/components/ui/study/studyControls.css";

const StudyControls = ({ onUndo, isAutoPlay, toggleAutoPlay, onShuffle }) => {
  return (
    <div className="controls-container top-controls">
      {/* 1열: 보조 도구 (되돌리기, 자동재생, 셔플) */}
      <div className="controls-tools-row">
        <button className="tool-btn" onClick={onUndo} aria-label="이전 카드">
          <RotateCcw size={22} />
        </button>

        <button
          className={`tool-btn ${isAutoPlay ? "active" : ""}`}
          onClick={toggleAutoPlay}
          aria-label="자동 재생"
        >
          {isAutoPlay ? (
            <Pause size={22} fill="currentColor" />
          ) : (
            <Play size={22} fill="currentColor" style={{ marginLeft: "2px" }} />
          )}
        </button>

        <button className="tool-btn" onClick={onShuffle} aria-label="셔플 모드">
          <Shuffle size={22} />
        </button>
      </div>
    </div>
  );
};

export default StudyControls;
