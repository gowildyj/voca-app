import React from "react";

const FilterBar = ({
  currentFilter,
  setFilter,
  sortType,
  setSortType,
  onShuffle,
}) => {
  const filters = [
    { id: "all", label: "전체" },
    { id: "none", label: "미학습" },
    { id: "unknown", label: "모름" },
    { id: "know", label: "아는단어" },
  ];

  return (
    <>
      <div className="filter-scroll-container">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`filter-btn ${currentFilter === f.id ? "active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="sort-container">
        {sortType === "shuffle" && (
          <button onClick={onShuffle} className="shuffle-refresh-btn">
            랜덤 섞기 🔄
          </button>
        )}
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="sort-select"
        >
          <option value="default">등록순</option>
          <option value="alpha">알파벳순</option>
          <option value="shuffle">무작위 셔플</option>
        </select>
      </div>
    </>
  );
};

export default FilterBar;
