import React, { memo, useRef } from "react";
import { Search, X } from "lucide-react";
import "@/styles/components/common/searchBar.css";

/**
 * @param {string} value - 검색어 상태값
 * @param {function} onChange - 값 변경 핸들러
 * @param {string} placeholder - 플레이스홀더 텍스트
 */
const SearchBar = ({
  value,
  onChange,
  placeholder = "검색어를 입력하세요",
  className = "",
}) => {
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange(""); // 부모의 상태를 빈 값으로
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`v-search-container ${className}`}>
      <div className="v-search-bar">
        <Search size={20} strokeWidth={2.5} />
        <input
          ref={inputRef}
          type="text"
          className="v-search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="v-search-clear-btn"
            aria-label="검색어 지우기"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(SearchBar);
