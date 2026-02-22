import React, { memo } from "react";
import { Eye, EyeOff, RotateCcw, ChevronDown } from "lucide-react";
import "@/styles/components/ui/word/filterBar.css";

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "new", label: "미학습" },
  { id: "review", label: "몰라" },
  { id: "mastered", label: "알아" },
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
      {/* 1. 상단 탭 (필터) */}
      <div className="filter-row top-row">
        <div className="filter-tabs-container" role="tablist">
          {FILTERS.map((f) => {
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

      {/* 2. 하단 컨트롤 (가리기 + 정렬) */}
      <div className="filter-row bottom-row">
        {/* 가리기 버튼 그룹 */}
        <div className="visibility-group segment-group">
          <button
            className={`segment-btn ${hideMode === "word" ? "active" : ""}`}
            onClick={() => onToggleMode("word")}
          >
            {/* 상태에 따라 아이콘 변경: 숨김(EyeOff) vs 보임(Eye) */}
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
          {/* 셔플 버튼 (선택사항) */}
          {sortType === "shuffle" && onShuffle && (
            <button
              className="shuffle-refresh-btn"
              onClick={onShuffle}
              aria-label="순서 섞기"
            >
              <RotateCcw size={14} />
            </button>
          )}

          {/* 커스텀 정렬 셀렉트 박스 */}
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
            {/* 정렬 삼각형 아이콘 */}
            <ChevronDown size={14} className="sort-chevron" strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(FilterBar);
