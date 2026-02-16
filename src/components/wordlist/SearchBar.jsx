import React, { memo, useRef } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ query, setQuery }) => {
  const inputRef = useRef(null);

  const handleClear = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <Search size={18} opacity={0.4} />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="단어나 뜻 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="modal-close-btn"
            aria-label="검색어 지우기"
          >
            <X size={18} opacity={0.6} />
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(SearchBar);
