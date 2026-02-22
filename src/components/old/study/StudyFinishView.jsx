import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { RotateCcw, LayoutList, Trophy } from "lucide-react";

const StudyFinishView = React.memo(
  ({ totalCount = 0, unknownCount = 0, onReview, onBack }) => {
    // 1. 통계 데이터 계산 (자바의 DTO 생성 로직처럼 깔끔하게 정리)
    const stats = useMemo(() => {
      const total = Math.max(0, Number(totalCount) || 0);
      const unknown = Math.max(0, Number(unknownCount) || 0);
      const known = Math.max(0, total - unknown);
      const rate = total > 0 ? Math.round((known / total) * 100) : 0;

      return { total, unknown, known, rate };
    }, [totalCount, unknownCount]);

    // 2. 애니메이션 설정 (자바의 설정 파일처럼 분리)
    const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          staggerChildren: 0.1, // 자식 요소들이 순차적으로 등장
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, x: -10 },
      visible: { opacity: 1, x: 0 },
    };

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="finish-container"
      >
        <div className="finish-header">
          <Trophy size={48} color="#FFD700" className="trophy-icon" />
          <h2 className="finish-title">학습을 완료했습니다!</h2>
        </div>

        <div className="result-card">
          <motion.div variants={itemVariants} className="result-row">
            <span>전체 학습 단어</span>
            <strong>{stats.total.toLocaleString()}</strong>
          </motion.div>

          {/* 진행률 바 시각화 (CSS 유지하며 인라인 스타일로 기능 추가) */}
          <div className="finish-progress-wrapper">
            <div className="finish-progress-bar">
              <motion.div
                className="finish-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${stats.rate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="finish-rate-text">정답률 {stats.rate}%</p>
          </div>

          <motion.div
            variants={itemVariants}
            className="result-row result-row--danger"
          >
            <span>다시 볼 단어</span>
            <strong>{stats.unknown.toLocaleString()}</strong>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="result-row result-row--success"
          >
            <span>완벽히 아는 단어</span>
            <strong>{stats.known.toLocaleString()}</strong>
          </motion.div>
        </div>

        <div className="btn-group">
          {stats.unknown > 0 && (
            <button onClick={onReview} className="btn-secondary" type="button">
              <RotateCcw size={18} />
              <span>틀린 단어만 복습</span>
            </button>
          )}

          <button onClick={onBack} className="btn-primary" type="button">
            <span>목록으로 돌아가기</span>
          </button>
        </div>
      </motion.div>
    );
  },
);

StudyFinishView.displayName = "StudyFinishView";

export default StudyFinishView;
