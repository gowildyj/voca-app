// src/hooks/useFilter.js
import { useState, useMemo } from "react";

export const useFilter = (initialData, filterKey = "isFavorite") => {
  const [currentFilter, setCurrentFilter] = useState("all");

  const filteredData = useMemo(() => {
    if (currentFilter === "all") return initialData;
    if (currentFilter === "favorite") {
      return initialData.filter((item) => item[filterKey]);
    }
    return initialData;
  }, [initialData, currentFilter, filterKey]);

  const filterCounts = useMemo(
    () => ({
      all: initialData.length,
      favorite: initialData.filter((item) => item[filterKey]).length,
    }),
    [initialData, filterKey],
  );

  return {
    currentFilter,
    setCurrentFilter,
    filteredData,
    filterCounts,
  };
};
