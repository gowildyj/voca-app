import React, { memo } from "react";
import { Eye, EyeOff, RotateCcw, ChevronDown } from "lucide-react";
import "@/styles/components/common/complexFilterBar.css";

const ComplexFilterBar = ({
  filters = [],
  currentFilter,
  setFilter,
  sortType,
  setSortType,
  onShuffle,
  filterCounts = {},
  hideMode, // 'word' | 'meaning' | null
  onToggleMode,
}) => {
  return (
    <div className="v-complex-filter-bar">
      {/* 1. 상단 탭 영역 */}
      <div className="filter-row top-row">
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

      {/* 2. 하단 컨트롤 영역 (가리기 + 정렬) */}
      <div className="filter-row bottom-row">
        {/* 가리기 세그먼트 그룹 */}
        <div className="visibility-group segment-group">
          <button
            className={`segment-btn ${hideMode === "word" ? "active" : ""}`}
            onClick={() => onToggleMode("word")}
          >
            {hideMode === "word" ? (
              <EyeOff size={14} strokeWidth={2.5} />
            ) : (
              <Eye size={14} strokeWidth={2.5} />
            )}
            <span>단어</span>
          </button>

          <button
            className={`segment-btn ${hideMode === "meaning" ? "active" : ""}`}
            onClick={() => onToggleMode("meaning")}
          >
            {hideMode === "meaning" ? (
              <EyeOff size={14} strokeWidth={2.5} />
            ) : (
              <Eye size={14} strokeWidth={2.5} />
            )}
            <span>뜻</span>
          </button>
        </div>

        {/* 정렬 그룹 */}
        <div className="sort-group">
          {sortType === "shuffle" && onShuffle && (
            <button className="shuffle-refresh-btn" onClick={onShuffle}>
              <RotateCcw size={14} />
            </button>
          )}

          <div className="sort-wrapper">
            <select
              className="sort-select-minimal"
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="default">등록순</option>
              <option value="alpha">A-Z</option>
              <option value="shuffle">랜덤</option>
            </select>
            <ChevronDown size={14} className="sort-chevron" strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ComplexFilterBar);
