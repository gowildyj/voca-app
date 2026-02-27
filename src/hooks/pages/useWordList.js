import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useWords } from "@/hooks/useWords";
import { useModal } from "@/contexts/ModalContext";
import { seededShuffle } from "@/utils/seedShuffle";

/**
 * useWordList: 단어 목록 페이지의 데이터 로드, 필터링, 액션을 통합 관리하는 훅
 */
export const useWordList = (deckId) => {
  const { openModal, closeModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const observerTarget = useRef(null);

  // --- [1] 데이터 호출 (useWords) ---
  const {
    words,
    loading,
    fetchWordsByDeck,
    fetchDeckById,
    addWord,
    addWordsBulk,
    updateWordsBulk,
    updateWord,
    deleteWord,
    updateDeck,
    deleteDeck,
  } = useWords();

  // --- [2] 로컬 상태 관리 (필터, 정렬, 검색) ---
  const [currentDeck, setCurrentDeck] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hideMode, setHideMode] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [shuffleSeed, setShuffleSeed] = useState(() =>
    Math.floor(Math.random() * 1000),
  );

  // URL 파라미터 기반 상태
  const filter = searchParams.get("filter") || "all";
  const sortType = searchParams.get("sort") || "default";

  // --- [3] 초기 데이터 로드 및 정보 매칭 ---
  useEffect(() => {
    if (deckId) {
      fetchWordsByDeck(deckId);
      fetchDeckById(deckId).then((data) => {
        if (data) setCurrentDeck(data);
      });
    }
  }, [deckId, fetchWordsByDeck, fetchDeckById]);

  // --- [4] 검색어 디바운싱 ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setDisplayLimit(20);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- [5] 핵심 로직: 필터링 및 정렬 ---
  const filteredWords = useMemo(() => {
    let result = words.filter((w) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "none"
            ? !w.status || w.status === "none"
            : w.status === filter;

      const query = debouncedQuery.toLowerCase();
      const matchesSearch =
        w.word?.toLowerCase().includes(query) ||
        false ||
        w.meaning?.toLowerCase().includes(query) ||
        false;

      return matchesFilter && matchesSearch;
    });

    switch (sortType) {
      case "alpha":
        result.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case "latest":
        // created_at 필드가 서버 데이터에 포함되어야 정확히 작동합니다.
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "shuffle":
        result = seededShuffle(result, shuffleSeed);
        break;
      default:
        break;
    }
    return result;
  }, [words, filter, debouncedQuery, sortType, shuffleSeed]);

  // --- [6] 통계 데이터 계산 ---
  const filterCounts = useMemo(
    () => ({
      all: words.length,
      none: words.filter((w) => !w.status || w.status === "none").length,
      unknown: words.filter((w) => w.status === "unknown").length,
      know: words.filter((w) => w.status === "know").length,
    }),
    [words],
  );

  // --- [7] 핸들러 함수들 ---
  const updateParams = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        prev.set(key, value);
        return prev;
      });
      setDisplayLimit(20);
    },
    [setSearchParams],
  );

  const handleFilterChange = (newFilter) => updateParams("filter", newFilter);
  const handleSortChange = (newSort) => {
    updateParams("sort", newSort);
    if (newSort === "shuffle") setShuffleSeed(Math.floor(Math.random() * 1000));
  };
  const onToggleMode = useCallback(
    (mode) => setHideMode((prev) => (prev === mode ? null : mode)),
    [],
  );

  // --- [8] 인피니트 스크롤 (Intersection Observer) ---
  useEffect(() => {
    if (filteredWords.length <= displayLimit) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setDisplayLimit((prev) => prev + 20);
      },
      { threshold: 0.1, rootMargin: "150px" },
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => target && observer.unobserve(target);
  }, [filteredWords.length, displayLimit]);

  // --- [9] CRUD 액션 (모달 연결) ---
  const onAddWord = () =>
    openModal("WORD_ADD", {
      deckId,
      onSubmit: async (data) => {
        Array.isArray(data)
          ? await addWordsBulk(deckId, data)
          : await addWord(deckId, data);
        closeModal();
      },
    });

  const onEditWord = (word) =>
    openModal("WORD_EDIT", {
      initialData: word,
      onSubmit: async (formData) => {
        await updateWord(word.id, formData);
        closeModal();
      },
    });

  const onDeleteWord = (wordId) =>
    openModal("CONFIRM_DELETE", {
      title: "이 단어를 삭제할까요?",
      onConfirm: async () => {
        await deleteWord(wordId);
        closeModal();
      },
    });

  const onEditDeck = () => {
    if (!currentDeck) return;
    openModal("DECK_EDIT", {
      initialData: currentDeck,
      isEdit: true,
      onSubmit: async (formData) => {
        await updateDeck(deckId, {
          name: formData.title,
          description: formData.description,
          language: formData.language,
        });
        closeModal();
      },
    });
  };

  const onDeleteDeck = () =>
    openModal("CONFIRM_DELETE", {
      title: "이 단어장을 삭제할까요?",
      message: "포함된 모든 단어가 함께 삭제됩니다.",
      onConfirm: async () => {
        await deleteDeck(deckId);
        closeModal();
      },
    });

  const onBulkEdit = () =>
    openModal("WORD_EDIT_BULK", {
      words,
      onSubmit: async (updatedList) => {
        await updateWordsBulk(updatedList);
        closeModal();
      },
    });

  return {
    filter,
    sortType,
    searchQuery,
    filterCounts,
    filteredWords,
    displayWords: filteredWords.slice(0, displayLimit),
    currentDeck,
    loading,
    totalCount: words.length,
    setSearchQuery,
    handleFilterChange,
    handleSortChange,
    observerTarget,
    hideMode,
    onToggleMode,
    onAddWord,
    onEditWord,
    onDeleteWord,
    onEditDeck,
    onDeleteDeck,
    onBulkEdit,
  };
};
