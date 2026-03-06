// src/components/common/SortSelector/SortSelector.jsx
import React from "react";
import { RotateCcw, ChevronDown, ArrowUpDown } from "lucide-react";
import styles from "./SortSelector.module.css";

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
    <div className={styles.sortContainer}>
      {/* 랜덤 모드일 때만 나타나는 새로고침 버튼 */}
      {sortType === "shuffle" && (
        <button className={styles.shuffleBtn} onClick={onShuffle} type="button">
          <RotateCcw size={14} />
        </button>
      )}

      <div className={styles.selectBox}>
        <div className={styles.trigger}>
          <ArrowUpDown size={14} className={styles.icon} />
          <span className={styles.label}>{getSortLabel()}</span>
          <ChevronDown size={14} className={styles.chevron} />
        </div>

        {/* 실제 동작하는 투명한 셀렉트 박스 */}
        <select
          className={styles.realSelect}
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
