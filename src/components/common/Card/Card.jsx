// src/components/common/Card/Card.jsx
import React from "react";
import styles from "./Card.module.css";

const Card = ({ children }) => {
  return <div className={styles["c-card"]}>{children}</div>;
};

export default Card;
