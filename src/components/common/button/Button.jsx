// src/components/common/Button/Button.jsx
import React from "react";
import styles from "./Button.module.css";

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
  const classes = [
    styles.btn,
    styles[`btn-${variant}`],
    styles[`size-${size}`],
    fullWidth ? styles.fullWidth : null,
    active ? styles.active : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon && <span className={styles.iconWrapper}>{icon}</span>}
      {children && <span className={styles.text}>{children}</span>}
    </button>
  );
};

export default Button;
