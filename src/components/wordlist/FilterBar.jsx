import React, { memo } from "react";
import { Eye, EyeOff } from "lucide-react";

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
  hideMode,
  onToggleMode,
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-row top-row">
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

      <div className="filter-row bottom-row">
        <div className="visibility-group">
          <button
            onClick={() => onToggleMode("word")}
            className={`filter-btn ${hideMode === "word" ? "active" : ""}`}
            title="단어 가리기"
          >
            {hideMode === "word" ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>단어</span>
          </button>

          <button
            onClick={() => onToggleMode("meaning")}
            className={`filter-btn ${hideMode === "meaning" ? "active" : ""}`}
            title="뜻 가리기"
          >
            {hideMode === "meaning" ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>뜻</span>
          </button>
        </div>

        {/* 오른쪽: 정렬 및 셔플 */}
        <div className="sort-group">
          {sortType === "shuffle" && (
            <button
              onClick={onShuffle}
              className="shuffle-refresh-btn"
              title="다시 섞기"
            >
              🔄
            </button>
          )}

          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="sort-select"
            aria-label="정렬 방식 선택"
          >
            <option value="default">등록순</option>
            <option value="alpha">A-Z</option>
            <option value="shuffle">랜덤</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default memo(FilterBar);
