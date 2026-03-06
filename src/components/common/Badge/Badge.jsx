// src/components/common/Badge/Badge.jsx
import React from "react";
import styles from "./Badge.module.css";

const Badge = ({ children, type = "tag", emoji, className = "" }) => {
  const classes = [styles.badge, styles[type], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {/* tag 타입일 때만 # 자동 생성 */}
      {(type === "tag" || type === "tag-ghost") && (
        <span className={styles.hash}># </span>
      )}

      <span className={styles.content}>{children}</span>

      {/* 이모지가 있을 때만 렌더링 */}
      {emoji && <span className={styles.emoji}>{emoji}</span>}
    </span>
  );
};

export default Badge;
