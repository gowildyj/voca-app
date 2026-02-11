import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ query, setQuery }) => (
  <div className="search-container">
    <div className="search-bar">
      <Search size={18} opacity={0.4} />
      <input
        type="text"
        className="search-input"
        placeholder="단어나 뜻 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <X size={18} className="cursor-pointer" onClick={() => setQuery("")} />
      )}
    </div>
  </div>
);

export default SearchBar;
