import React from "react";

const StudyControls = ({
  onSwipeLeft,
  onSwipeRight,
  unknownCount,
  knownCount,
}) => {
  return (
    <div className="study-score-board">
      <div className="score-item unknown" onClick={onSwipeLeft}>
        <span className="label">몰라요</span>
        <span className="count">{unknownCount}</span>
      </div>
      <div className="score-item know" onClick={onSwipeRight}>
        <span className="label">알아요</span>
        <span className="count">{knownCount}</span>
      </div>
    </div>
  );
};

export default React.memo(StudyControls);
