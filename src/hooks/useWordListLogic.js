import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { seededShuffle } from "@/utils/seedShuffle";

/**
 * WordList 페이지의 비즈니스 로직을 담당하는 커스텀 훅
 * 프로덕션 레벨: 검색 최적화(Debounce), URL 동기화 강화, 메모리 최적화
 */
export const useWordListLogic = (localWords = []) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const observerTarget = useRef(null);

  // --- [1] 상태 관리 ---
  // 실시간 입력값과 실제 필터링에 사용할 쿼리를 분리 (성능 최적화)
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [hideMode, setHideMode] = useState(null);

  const [shuffleSeed, setShuffleSeed] = useState(() =>
    Math.floor(Math.random() * 1000),
  );
  const [displayLimit, setDisplayLimit] = useState(30);

  // URL 파라미터 추출
  const filter = searchParams.get("filter") || "all";
  const sortType = searchParams.get("sort") || "default";

  const onToggleMode = useCallback((mode) => {
    setHideMode((prev) => (prev === mode ? null : mode));
  }, []);

  // --- [2] 검색어 디바운싱 로직 ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setDisplayLimit(30); // 검색 시 스크롤 위치 리셋 효과
    }, 300); // 0.3초 대기

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- [3] 필터링 및 정렬 (핵심 로직) ---
  const filteredWords = useMemo(() => {
    // 1. 유효성 검사 및 초기 필터링
    let result = localWords.filter((w) => {
      const wordText = w.word?.trim() || "";
      const meaningText = w.meaning?.trim() || "";

      // 학습 상태 필터링
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "none"
            ? !w.status || w.status === "none"
            : w.status === filter;

      // 검색어 필터링 (Debounced Query 사용)
      const query = debouncedQuery.toLowerCase();
      const matchesSearch =
        wordText.toLowerCase().includes(query) ||
        meaningText.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });

    // 2. 정렬 로직 적용
    switch (sortType) {
      case "alpha":
        result.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case "latest":
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "shuffle":
        result = seededShuffle(result, shuffleSeed);
        break;
      default:
        // 기본 정렬: 생성일 순 (오름차순 등)
        break;
    }

    return result;
  }, [localWords, filter, debouncedQuery, sortType, shuffleSeed]);

  // --- [4] 통계 데이터 계산 ---
  const filterCounts = useMemo(() => {
    return {
      all: localWords.length,
      none: localWords.filter((w) => !w.status || w.status === "none").length,
      unknown: localWords.filter((w) => w.status === "unknown").length,
      know: localWords.filter((w) => w.status === "know").length,
    };
  }, [localWords]);

  // --- [5] 핸들러 함수 (useCallback으로 최적화) ---
  const updateParams = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        prev.set(key, value);
        return prev;
      });
      setDisplayLimit(30);
    },
    [setSearchParams],
  );

  const handleFilterChange = (newFilter) => updateParams("filter", newFilter);

  const handleSortChange = (newSort) => {
    updateParams("sort", newSort);
    if (newSort === "shuffle") {
      setShuffleSeed(Math.floor(Math.random() * 1000));
    }
  };

  // --- [6] 인피니트 스크롤 (Intersection Observer) ---
  useEffect(() => {
    if (filteredWords.length <= displayLimit) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit((prev) => prev + 30);
        }
      },
      { threshold: 0.1, rootMargin: "150px" },
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [filteredWords.length, displayLimit]);

  return {
    filter,
    sortType,
    searchQuery,
    filterCounts,
    displayWords: filteredWords.slice(0, displayLimit),
    totalCount: filteredWords.length,
    setSearchQuery,
    handleFilterChange,
    handleSortChange,
    observerTarget,
    hideMode,
    onToggleMode,
  };
};
