import React from "react";
import {
  RotateCcw,
  Play,
  Pause,
  Shuffle,
  Volume2,
  VolumeX,
  ArrowLeftRight,
} from "lucide-react";
import "@/styles/components/ui/study/studyControls.css";

const StudyControls = ({
  onUndo,
  isAutoPlay,
  toggleAutoPlay,
  onShuffle,
  isAutoAudio, // true면 카드 나올 때 자동 읽기
  toggleAutoAudio, // Audio 토글 함수
  viewMode, // "frontFirst" | "backFirst"
  toggleViewMode, // 뷰 모드 토글 함수
}) => {
  return (
    <div className="controls-container top-controls">
      <div className="controls-tools-row">
        {/* 이전 카드 되돌리기 */}
        <button className="tool-btn" onClick={onUndo} aria-label="이전 카드">
          <RotateCcw size={22} />
        </button>

        {/* 셔플 모드 */}
        <button className="tool-btn" onClick={onShuffle} aria-label="셔플 모드">
          <Shuffle size={22} />
        </button>

        {/* 자동 재생 (AutoPlay) */}
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

        {/* <div
          className="divider-vertical"
          style={{ width: 1, height: 20, background: "#eee", margin: "0 8px" }}
        ></div> */}

        {/* Audio 자동 재생 토글 */}
        <button
          className={`tool-btn ${isAutoAudio ? "active" : ""}`}
          onClick={toggleAutoAudio}
          aria-label="Audio 자동 재생"
        >
          {isAutoAudio ? (
            <Volume2 size={22} />
          ) : (
            <VolumeX size={22} style={{ opacity: 0.5 }} />
          )}
        </button>

        {/* 앞면/뒷면 순서 변경 */}
        <button
          className={`tool-btn ${viewMode === "backFirst" ? "active" : ""}`}
          onClick={toggleViewMode}
          aria-label="앞면/뒷면 순서 변경"
        >
          <ArrowLeftRight size={22} />
          <span style={{ fontSize: 10, marginLeft: 2 }}>
            {viewMode === "frontFirst" ? "앞" : "뒤"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default StudyControls;
