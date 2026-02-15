import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { RotateCcw, LayoutList } from "lucide-react";

const StudyFinishView = React.memo(
  ({ totalCount = 0, unknownCount = 0, onReview, onBack }) => {
    // 데이터 안전 계산
    const stats = useMemo(() => {
      const total = Number(totalCount) || 0;
      const unknown = Number(unknownCount) || 0;
      const known = Math.max(0, total - unknown);
      return { total, unknown, known };
    }, [totalCount, unknownCount]);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="finish-container"
      >
        <h2 className="finish-title">학습 완료! 🎉</h2>

        <div className="result-card">
          <p className="result-row">
            전체 단어: <strong>{stats.total}</strong>
          </p>
          <p className="result-row result-row--danger">
            모르는 단어: <strong>{stats.unknown}</strong>
          </p>
          <p
            className="result-row"
            style={{ opacity: 0.7, fontSize: "0.9rem" }}
          >
            아는 단어: {stats.known}
          </p>
        </div>

        <div className="btn-group">
          {stats.unknown > 0 && (
            <button onClick={onReview} className="btn-secondary">
              <RotateCcw size={18} />
              <span>모르는 단어만 복습하기</span>
            </button>
          )}

          <button onClick={onBack} className="btn-primary">
            {/* <LayoutList size={18} style={{ marginRight: "8px" }} /> */}
            <span>목록으로 돌아가기</span>
          </button>
        </div>
      </motion.div>
    );
  },
);

StudyFinishView.displayName = "StudyFinishView";

export default StudyFinishView;
