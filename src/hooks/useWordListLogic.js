import { useState, useMemo, useEffect, useRef } from "react";
import { seededShuffle } from "@/utils/seedShuffle";
import { useSearchParams } from "react-router-dom";

export const useWordListLogic = (localWords) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [displayLimit, setDisplayLimit] = useState(30);
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get("filter") || "all");
  const [sortType, setSortType] = useState(
    searchParams.get("sort") || "default",
  );

  const observerTarget = useRef(null);

  const filteredWords = useMemo(() => {
    const valid = localWords.filter((w) => w.word?.trim());

    let result = valid.filter((word) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "none"
            ? !word.status || word.status === "none"
            : word.status === filter;
      const matchesSearch =
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    if (sortType === "alpha")
      result.sort((a, b) => a.word.localeCompare(b.word));
    else if (sortType === "shuffle")
      result = seededShuffle(result, shuffleSeed);

    return result;
  }, [localWords, filter, searchQuery, sortType, shuffleSeed]);

  const filterCounts = useMemo(() => {
    if (localWords.length === 0)
      return { all: 0, none: 0, unknown: 0, know: 0 };

    return {
      all: localWords.length,
      none: localWords.filter((w) => !w.status || w.status === "none").length,
      unknown: localWords.filter((w) => w.status === "unknown").length,
      know: localWords.filter((w) => w.status === "know").length,
    };
  }, [localWords]);

  useEffect(() => {
    if (filteredWords.length <= displayLimit) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit((prev) => prev + 30);
        }
      },
      { threshold: 0.1 },
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [filteredWords.length, displayLimit]);

  return {
    filter,
    setFilter,
    sortType,
    setSortType,
    searchQuery,
    setSearchQuery,
    shuffleSeed,
    setShuffleSeed,
    displayLimit,
    setDisplayLimit,
    filteredWords,
    filterCounts,
    observerTarget,
  };
};
