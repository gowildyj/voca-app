import React from "react";
import "@/styles/components/common/badge.css";

/**
 * @param {string} children - 뱃지에 들어갈 텍스트
 * @param {string} type - 뱃지 타입 (tag, primary, ghost, outline)
 * @param {string} className - 추가적인 커스텀 클래스
 */
const Badge = ({ children, type = "tag", className = "" }) => {
  return (
    <span className={`v-badge ${type} ${className}`}>
      {type === "tag" && "#"}
      {children}
    </span>
  );
};

export default Badge;
