// src/components/common/FilterTabs.jsx

import React from "react";
import "@/styles/components/common/filterTabs.css";

const FilterTabs = ({ filters, currentFilter, setFilter, filterCounts }) => {
  return (
    <div className="filter-tabs-row">
      <div className="filter-tabs-container" role="tablist">
        {filters.map((f) => {
          const isActive = currentFilter === f.id;
          return (
            <button
              key={f.id}
              className={`filter-tab-item ${isActive ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              <span className="tab-label">{f.label}</span>
              <span className="tab-count">{filterCounts[f.id] || 0}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterTabs;
