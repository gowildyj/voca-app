// src/components/common/FilterBar/FilterBar.jsx
import React from "react";
import Badge from "@/components/common/Badge/Badge";
import styles from "./FilterBar.module.css";

const FilterBar = ({
  items,
  activeItem,
  onSelect,
  isTag = false,
  isScroll = false,
  className = "",
}) => {
  return (
    <nav className={`${styles.filterBar} ${className}`}>
      {/* isScroll 값에 따라 다른 컨테이너 스타일 적용 */}
      <div className={isScroll ? styles.scrollContainer : styles.wrapContainer}>
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
