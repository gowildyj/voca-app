// src/components/common/SearchBar/SearchBar.jsx

import React, { memo, useRef } from "react";
import { Search, X } from "lucide-react";
import styles from "./SearchBar.module.css";

/**
 * @param {string} value - 검색어 상태값
 * @param {function} onChange - 값 변경 핸들러 (e.target.value가 아닌 값 자체를 전달)
 * @param {string} placeholder - 플레이스홀더 텍스트
 */
const SearchBar = ({
  value,
  onChange,
  placeholder = "Search",
  className = "",
}) => {
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearBtn}
            aria-label="delete search text"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(SearchBar);
