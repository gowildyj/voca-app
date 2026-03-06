// src/components/common/FilterTabs/FilterTabs.jsx
import React from "react";
import styles from "./FilterTabs.module.css";

const FilterTabs = ({
  filters,
  currentFilter,
  setFilter,
  filterCounts = {},
}) => {
  return (
    <div className={styles.tabsRow}>
      <div className={styles.tabsContainer} role="tablist">
        {filters.map((f) => {
          const isActive = currentFilter === f.id;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={isActive}
              className={`${styles.tabItem} ${isActive ? styles.active : ""}`}
              onClick={() => setFilter(f.id)}
            >
              <span className={styles.label}>{f.label}</span>
              {filterCounts[f.id] !== undefined && (
                <span className={styles.count}>{filterCounts[f.id]}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterTabs;
