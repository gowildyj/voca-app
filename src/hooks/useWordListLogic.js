import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { seededShuffle } from "@/utils/seedShuffle";

/**
 * WordList 페이지의 복잡한 상태와 필터링 로직을 담당하는 훅
 * @param {Array} localWords - WordsContext에서 가져온 원본 단어 배열
 */
export const useWordListLogic = (localWords = []) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // --- [1] 상태 관리 (URL 쿼리 스트링과 동기화) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [shuffleSeed, setShuffleSeed] = useState(() =>
    Math.floor(Math.random() * 1000),
  );
  const [displayLimit, setDisplayLimit] = useState(30); // 한 번에 보여줄 단어 수 (인피니트 스크롤)

  // URL 파라미터에서 초기값 가져오기 (확장성: 공유 가능한 링크)
  const filter = searchParams.get("filter") || "all";
  const sortType = searchParams.get("sort") || "default";

  const observerTarget = useRef(null);

  // --- [2] 필터링 및 정렬 로직 (성능: useMemo 필수) ---
  const filteredWords = useMemo(() => {
    // 유효성 검사: 단어 텍스트가 있는 것만 필터링
    const validWords = localWords.filter((w) => w.word?.trim());

    let result = validWords.filter((word) => {
      // 1. 학습 상태 필터링 (전체 / 미학습 / 모름 / 알음)
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "none"
            ? !word.status || word.status === "none"
            : word.status === filter;

      // 2. 검색어 필터링 (영어 단어 또는 한글 뜻)
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        word.word.toLowerCase().includes(query) ||
        word.meaning.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });

    // 3. 정렬 로직
    if (sortType === "alpha") {
      result.sort((a, b) => a.word.localeCompare(b.word));
    } else if (sortType === "shuffle") {
      result = seededShuffle(result, shuffleSeed);
    } else if (sortType === "latest") {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [localWords, filter, searchQuery, sortType, shuffleSeed]);

  // --- [3] 통계 계산 (상단 탭 카운트 표시용) ---
  const filterCounts = useMemo(() => {
    return {
      all: localWords.length,
      none: localWords.filter((w) => !w.status || w.status === "none").length,
      unknown: localWords.filter((w) => w.status === "unknown").length,
      know: localWords.filter((w) => w.status === "know").length,
    };
  }, [localWords]);

  // --- [4] 이벤트 핸들러 (확장성: URL 업데이트 포함) ---
  const handleFilterChange = useCallback(
    (newFilter) => {
      setSearchParams((prev) => {
        prev.set("filter", newFilter);
        return prev;
      });
      setDisplayLimit(30); // 필터 변경 시 스크롤 한도 리셋
    },
    [setSearchParams],
  );

  const handleSortChange = useCallback(
    (newSort) => {
      setSearchParams((prev) => {
        prev.set("sort", newSort);
        return prev;
      });
      if (newSort === "shuffle") {
        setShuffleSeed(Math.floor(Math.random() * 1000));
      }
    },
    [setSearchParams],
  );

  // --- [5] 인피니트 스크롤 로직 (성능: Intersection Observer) ---
  useEffect(() => {
    // 필터링된 결과가 현재 표시 한도보다 적으면 감시할 필요 없음
    if (filteredWords.length <= displayLimit) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit((prev) => prev + 30); // 30개씩 추가 로드
        }
      },
      { threshold: 0.1, rootMargin: "100px" }, // 하단에 도달하기 전 미리 로드
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [filteredWords.length, displayLimit]);

  return {
    // 상태값
    filter,
    sortType,
    searchQuery,
    displayLimit,
    filterCounts,
    // 결과값 (실제 화면에 렌더링할 단어들)
    displayWords: filteredWords.slice(0, displayLimit),
    totalFilteredCount: filteredWords.length,
    // 제어 함수
    setSearchQuery,
    handleFilterChange,
    handleSortChange,
    // Refs
    observerTarget,
  };
};
