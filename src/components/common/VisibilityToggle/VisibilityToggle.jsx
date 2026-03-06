// src/components/common/VisibilityToggle/VisibilityToggle.jsx
import React from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./VisibilityToggle.module.css";

const VisibilityToggle = ({ hideMode, onToggleMode }) => {
  const modes = [
    { id: "word", label: "단어" },
    { id: "meaning", label: "뜻" },
  ];

  return (
    <div className={styles.segmentGroup}>
      {modes.map((mode) => {
        const isActive = hideMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            className={`${styles.segmentBtn} ${isActive ? styles.active : ""}`}
            onClick={() => onToggleMode(isActive ? null : mode.id)}
          >
            {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className={styles.label}>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default VisibilityToggle;
