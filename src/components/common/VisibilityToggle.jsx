import React from "react";
import { Eye, EyeOff } from "lucide-react";
import "@/styles/components/common/visibilityToggle.css";

const VisibilityToggle = ({ hideMode, onToggleMode }) => (
  <div className="visibility-group segment-group">
    {["word", "meaning"].map((mode) => (
      <button
        key={mode}
        className={`segment-btn ${hideMode === mode ? "active" : ""}`}
        onClick={() => onToggleMode(mode)}
      >
        {hideMode === mode ? <EyeOff size={14} /> : <Eye size={14} />}
        <span>{mode === "word" ? "단어" : "뜻"}</span>
      </button>
    ))}
  </div>
);

export default VisibilityToggle;
