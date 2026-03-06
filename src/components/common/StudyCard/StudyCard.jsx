// src/components/common/StudyCard/StudyCard.jsx
import React from "react";
import { Star } from "lucide-react";
import Badge from "@/components/common/Badge/Badge";
import styles from "./StudyCard.module.css";

const StudyCard = ({
  title,
  totalCount = 0,
  progress = 0,
  status = { known: 0, unknown: 0, unlearned: 0 },
  tags = [],
  isFavorite = false,
  onClick, // 플레이 버튼 대신 카드 전체 클릭 핸들러 사용
}) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <h4 className={styles.title}>{title}</h4>
        {/* 별 버튼 클릭 시 카드 클릭 이벤트 전파 방지 필수 */}
        <div onClick={(e) => e.stopPropagation()}>
          <Star
            size={22}
            className={isFavorite ? styles.starActive : styles.starIcon}
            fill={isFavorite ? "var(--warning)" : "none"}
          />
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.statsRow}>
          <span>{totalCount}개의 단어 준비됨</span>
          <span className={styles.percentText}>{progress}% 학습됨</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className={styles.statusGroup}>
          <Badge type="outline">알아 {status.known}</Badge>
          <Badge type="danger">몰라 {status.unknown}</Badge>
          <Badge type="tag">미학습 {status.unlearned}</Badge>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <Badge key={tag} type="tag">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyCard;
