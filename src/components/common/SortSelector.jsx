import React from "react";
import { RotateCcw, ChevronDown, ArrowUpDown } from "lucide-react";
import "@/styles/components/common/sortSelector.css";

const SortSelector = ({ sortType, setSortType, onShuffle }) => {
  const getSortLabel = () => {
    switch (sortType) {
      case "alpha":
        return "A-Z";
      case "shuffle":
        return "랜덤";
      default:
        return "등록순";
    }
  };

  return (
    <div className="v-sort-container">
      {sortType === "shuffle" && (
        <button className="v-shuffle-btn" onClick={onShuffle} type="button">
          <RotateCcw size={14} />
        </button>
      )}

      <div className="v-sort-select-box">
        <div className="v-select-trigger">
          <ArrowUpDown size={14} className="v-sort-icon" />
          <span className="v-selected-label">{getSortLabel()}</span>
          <ChevronDown size={14} className="v-chevron" />
        </div>

        <select
          className="v-real-select"
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="default">등록순</option>
          <option value="alpha">A-Z</option>
          <option value="shuffle">랜덤</option>
        </select>
      </div>
    </div>
  );
};

export default SortSelector;
