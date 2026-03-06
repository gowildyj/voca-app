// src/components/ui/StudyControls/StudyControls.jsx
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
import styles from "./StudyControls.module.css";

const StudyControls = ({
  onUndo,
  isAutoPlay,
  toggleAutoPlay,
  onShuffle,
  isAutoAudio,
  toggleAutoAudio,
  viewMode,
  toggleViewMode,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.toolsRow}>
        {/* 이전 카드 되돌리기 */}
        <button
          className={styles.toolBtn}
          onClick={onUndo}
          aria-label="이전 카드"
          type="button"
        >
          <RotateCcw size={20} />
        </button>

        {/* 셔플 모드 */}
        <button
          className={styles.toolBtn}
          onClick={onShuffle}
          aria-label="셔플 모드"
          type="button"
        >
          <Shuffle size={20} />
        </button>

        {/* 자동 재생 (AutoPlay) */}
        <button
          className={`${styles.toolBtn} ${isAutoPlay ? styles.active : ""}`}
          onClick={toggleAutoPlay}
          aria-label="자동 재생"
          type="button"
        >
          {isAutoPlay ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" className={styles.playIcon} />
          )}
        </button>

        {/* Audio 자동 재생 토글 */}
        <button
          className={`${styles.toolBtn} ${isAutoAudio ? styles.active : ""}`}
          onClick={toggleAutoAudio}
          aria-label="Audio 자동 재생"
          type="button"
        >
          {isAutoAudio ? (
            <Volume2 size={20} />
          ) : (
            <VolumeX size={20} className={styles.dimmedIcon} />
          )}
        </button>

        {/* 앞면/뒷면 순서 변경 */}
        <button
          className={`${styles.toolBtn} ${viewMode === "backFirst" ? styles.active : ""}`}
          onClick={toggleViewMode}
          aria-label="앞면/뒷면 순서 변경"
          type="button"
        >
          <div className={styles.viewModeWrapper}>
            <ArrowLeftRight size={18} />
            <span className={styles.modeText}>
              {viewMode === "frontFirst" ? "앞" : "뒤"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default StudyControls;
