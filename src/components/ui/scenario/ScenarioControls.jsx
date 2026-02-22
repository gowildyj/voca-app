import React from "react";
import { Play, Square, Eye, EyeOff } from "lucide-react";

const ScenarioControls = ({
  isPlaying,
  onFullPlay,
  showWord,
  toggleWord,
  showMeaning,
  toggleMeaning,
}) => (
  <div className="top-study-controls">
    <button
      className={`study-tool-btn ${isPlaying ? "playing" : ""}`}
      onClick={onFullPlay}
    >
      {isPlaying ? (
        <Square size={18} fill="currentColor" />
      ) : (
        <Play size={18} fill="currentColor" />
      )}
      <span>전체 재생</span>
    </button>

    <div className="control-divider" />

    <button
      className={`study-tool-btn ${!showWord ? "active" : ""}`}
      onClick={toggleWord}
      disabled={isPlaying}
    >
      {showWord ? <Eye size={18} /> : <EyeOff size={18} />}
      <span>단어 가리기</span>
    </button>

    <div className="control-divider" />

    <button
      className={`study-tool-btn ${!showMeaning ? "active" : ""}`}
      onClick={toggleMeaning}
      disabled={isPlaying}
    >
      {showMeaning ? <Eye size={18} /> : <EyeOff size={18} />}
      <span>뜻 가리기</span>
    </button>
  </div>
);

export default ScenarioControls;
