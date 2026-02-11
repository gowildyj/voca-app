import React from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

const StudyFinishView = ({ totalCount, unknownCount, onReview, onBack }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="finish-container"
  >
    <h2 className="finish-title">학습 완료! 🎉</h2>
    <div className="result-card">
      <p className="result-row">
        전체 단어: <strong>{totalCount}</strong>
      </p>
      <p
        className="result-row"
        style={{ color: "#ef4444", fontWeight: "bold" }}
      >
        모르는 단어: {unknownCount}
      </p>
    </div>
    <div className="btn-group">
      {unknownCount > 0 && (
        <button onClick={onReview} className="btn-secondary">
          <RotateCcw size={18} /> 모르는 단어만 복습하기
        </button>
      )}
      <button onClick={onBack} className="btn-primary">
        목록으로 돌아가기
      </button>
    </div>
  </motion.div>
);

export default StudyFinishView;
