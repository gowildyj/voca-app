import React from "react";
import "@/styles/components/common/buttons.css";

/**
 * 공통 버튼 컴포넌트
 * @param {string} variant - primary, secondary, ghost, danger, icon, fab
 * @param {string} size - sm, base(default), lg
 * @param {boolean} fullWidth - 너비 100% 여부
 * @param {boolean} active - 아이콘 버튼 등의 활성화 상태
 * @param {React.ReactNode} icon - 버튼에 포함될 아이콘
 * @param {string} className - 커스텀 클래스 추가
 */
const Button = ({
  children,
  variant = "primary",
  size = "base",
  fullWidth = false,
  active = false,
  icon,
  className = "",
  disabled = false,
  onClick,
  ...props
}) => {
  // 변형 및 크기에 따른 클래스 조합
  const baseClass =
    variant === "fab" || variant === "icon" ? `btn-${variant}` : "btn";
  const variantClass =
    variant !== "fab" && variant !== "icon" ? `btn-${variant}` : "";
  const sizeClass = size !== "base" ? `btn-${size}` : "";
  const fullClass = fullWidth ? "btn-full" : "";
  const activeClass = active ? "active" : "";

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${fullClass} ${activeClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {/* 아이콘이 있을 경우 텍스트와 함께 렌더링 */}
      {icon && <span className="btn-icon-wrapper">{icon}</span>}

      {/* FAB나 Icon 전용 버튼이 아닌 경우에만 children(텍스트) 렌더링 가능 */}
      {children && <span className="btn-text">{children}</span>}
    </button>
  );
};

export default Button;
