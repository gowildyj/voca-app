import React, { memo } from "react";

const FILTERS = [
  { id: "all", label: "전체", short: "전체" },
  { id: "none", label: "미학습", short: "미학습" },
  { id: "unknown", label: "모름", short: "몰라" },
  { id: "know", label: "아는단어", short: "알아" },
];

const FilterBar = ({
  currentFilter,
  setFilter,
  sortType,
  setSortType,
  onShuffle,
  filterCounts = {},
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-bar-filters" role="tablist">
        {FILTERS.map((f) => {
          const count = filterCounts[f.id] ?? 0;
          const isActive = currentFilter === f.id;

          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`filter-btn ${isActive ? "active" : ""}`}
              role="tab"
              aria-selected={isActive}
            >
              {f.short} <span className="count-num">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="filter-bar-sort">
        {sortType === "shuffle" && (
          <button
            onClick={onShuffle}
            className="shuffle-refresh-btn"
            title="다시 섞기"
          >
            🔄 섞기
          </button>
        )}

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="sort-select"
          aria-label="정렬 방식 선택"
        >
          <option value="default">등록순</option>
          <option value="alpha">알파벳순</option>
          <option value="shuffle">무작위</option>
        </select>
      </div>
    </div>
  );
};

export default memo(FilterBar);
