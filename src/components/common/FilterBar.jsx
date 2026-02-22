import React from "react";
import Button from "./Button";
import "@/styles/components/common/filterBar.css";

/**
 * @param {Array} items - 필터 목록 (예: ["전체", "여행", "식당"])
 * @param {string} activeItem - 현재 선택된 항목
 * @param {function} onSelect - 항목 선택 시 실행될 함수
 */
const FilterBar = ({ items, activeItem, onSelect, className = "" }) => {
  return (
    <nav className={`filter-bar ${className}`}>
      <div className="filter-scroll-container">
        {items.map((item) => (
          <Button
            key={item}
            variant="secondary"
            size="sm"
            active={activeItem === item}
            onClick={() => onSelect(item)}
            className={activeItem === item ? "active-filter" : ""}
          >
            {item}
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default FilterBar;
