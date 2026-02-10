import React from "react";

const IconButton = ({
  icon: Icon,
  onClick,
  color = "var(--text)",
  size = 20,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`icon-button ${className}`}
      style={{ color: color }}
    >
      <Icon size={size} />
    </button>
  );
};

export default IconButton;
