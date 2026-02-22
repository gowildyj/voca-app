import React from "react";
import "@/styles/components/common/spinner.css";

/**
 * @param {string} size - sm, base, lg
 * @param {boolean} white - true일 경우 흰색 스타일 적용 (버튼 내부 등)
 * @param {string} className - 추가 커스텀 클래스
 */
const Spinner = ({ size = "base", white = false, className = "" }) => {
  return (
    <div className={`v-spinner-container ${className}`}>
      <div className={`v-spinner ${size} ${white ? "white" : ""}`} />
    </div>
  );
};

export default Spinner;
