import React from "react";
// 사용하지 않는 아이콘 import 제거
import "@/styles/components/ui/study/actionButtons.css";

const ActionButtons = ({
  onKnow,
  onUnknown,
  counts = { know: 0, unknown: 0 },
}) => {
  return (
    <div className="controls-container bottom-actions">
      <div className="controls-eval-row">
        <button className="eval-btn unknown" onClick={onUnknown}>
          <span>몰라요</span>
          <span className="count-badge">{counts.unknown}</span>
        </button>

        <button className="eval-btn know" onClick={onKnow}>
          <span>알아요</span>
          <span className="count-badge">{counts.know}</span>
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
