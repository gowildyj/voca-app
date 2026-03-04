// src/components/common/Card/CardSection.jsx
import React from "react";
import styles from "./Card.module.css";

const CardSection = ({ title, description, children, isLast = false }) => {
  return (
    <section
      className={`${styles["c-card-section"]} ${isLast ? styles["is-last"] : ""}`}
    >
      <h2 className={styles["c-card-title"]}>{title}</h2>
      {description && <p className={styles["c-card-desc"]}>{description}</p>}
      <div className={styles["c-card-content"]}>{children}</div>
    </section>
  );
};

export { CardSection };
