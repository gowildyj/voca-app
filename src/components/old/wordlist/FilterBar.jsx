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
      {/* 탭 스타일의 상단 필터 */}
      <div className="filter-row top-row">
        <div className="filter-tabs-container" role="tablist">
          {FILTERS.map((f) => {
            const count = filterCounts[f.id] ?? 0;
            const isActive = currentFilter === f.id;

            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`filter-tab-item ${isActive ? "active" : ""}`}
                role="tab"
                aria-selected={isActive}
              >
                <span className="tab-label">{f.short}</span>
                <span className="tab-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-row bottom-row">
        {/* 가리기 버튼들도 탭처럼 묶어주면 더 깔끔합니다 */}
        <div className="visibility-group segment-group">
          <button
            onClick={() => onToggleMode("word")}
            className={`segment-btn ${hideMode === "word" ? "active" : ""}`}
          >
            {hideMode === "word" ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>단어</span>
          </button>
          <button
            onClick={() => onToggleMode("meaning")}
            className={`segment-btn ${hideMode === "meaning" ? "active" : ""}`}
          >
            {hideMode === "meaning" ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>뜻</span>
          </button>
        </div>

        <div className="sort-group">
          {sortType === "shuffle" && (
            <button onClick={onShuffle} className="shuffle-refresh-icon">
              🔄
            </button>
          )}
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="sort-select-minimal"
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
