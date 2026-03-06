// src/components/common/FilterBar/FilterBar.jsx
import React from "react";
import Badge from "@/components/common/Badge/Badge";
import styles from "./FilterBar.module.css";

const FilterBar = ({
  items,
  activeItem,
  onSelect,
  isTag = false,
  className = "",
}) => {
  return (
    <nav className={`${styles.filterBar} ${className}`}>
      <div className={styles.scrollContainer}>
        {items.map((item) => {
          const isActive = activeItem === item;
          return (
            <div
              key={item}
              onClick={() => onSelect(item)}
              className={styles.badgeWrapper}
            >
              <Badge
                type={isTag ? "tag" : isActive ? "primary" : "outline"}
                className={isTag && isActive ? styles.activeTag : ""}
              >
                {item}
              </Badge>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default FilterBar;
