import React, { useCallback } from "react";

// PropTypes 대신 자바스크립트 기본값(=)을 활용해 예외를 방지합니다.
const IconButton = React.memo(
  ({
    icon: Icon,
    onClick,
    color = "currentColor",
    size = 20,
    className = "",
    label = "button", // 설명 추가
    disabled = false,
  }) => {
    const handleClick = useCallback(
      (e) => {
        if (!disabled && onClick) {
          onClick(e);
        }
      },
      [onClick, disabled],
    );

    return (
      <button
        type="button" // form 전송 방지
        onClick={handleClick}
        disabled={disabled}
        className={`icon-button ${className}`}
        style={{ color, cursor: disabled ? "not-allowed" : "pointer" }}
        aria-label={label}
      >
        <Icon size={size} />
      </button>
    );
  },
);

export default IconButton;
