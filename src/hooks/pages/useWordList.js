import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useLocation } from "react-router-dom"; // useLocation 추가
import { useWordStore } from "@/store/useWordStore"; // Zustand Store
import { useModal } from "@/contexts/ModalContext";
import { seededShuffle } from "@/utils/seedShuffle";

/**
 * useWordList: 단어 목록 페이지의 데이터 로드, 필터링, 액션을 통합 관리하는 훅
 */
export const useWordList = (deckId) => {
  const { state } = useLocation(); // 이전 페이지에서 넘겨준 state 받기
  const { openModal, closeModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const observerTarget = useRef(null);

  // --- [1] Zustand Store에서 상태와 액션 추출 ---
  const words = useWordStore((state) => state.words);
  const decks = useWordStore((state) => state.decks);
  const loading = useWordStore((state) => state.loading);
  const fetchWordsByDeck = useWordStore((state) => state.fetchWordsByDeck);
  const fetchDeckById = useWordStore((state) => state.fetchDeckById);
  const addWord = useWordStore((state) => state.addWord);
  const addWordsBulk = useWordStore((state) => state.addWordsBulk);
  const updateWordsBulk = useWordStore((state) => state.updateWordsBulk);
  const updateWord = useWordStore((state) => state.updateWord);
  const deleteWord = useWordStore((state) => state.deleteWord);
  const updateDeck = useWordStore((state) => state.updateDeck);
  const deleteDeck = useWordStore((state) => state.deleteDeck);
  const updateWordFavorite = useWordStore((state) => state.updateWordFavorite);
  const updateDeckFavorite = useWordStore((state) => state.updateDeckFavorite);

  // --- [2] 로컬 상태 관리 ---
  // 초기값을 state?.initialDeck으로 설정하여 로딩 없이 즉시 렌더링
  // const [currentDeck, setCurrentDeck] = useState(state?.initialDeck || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hideMode, setHideMode] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [shuffleSeed, setShuffleSeed] = useState(() =>
    Math.floor(Math.random() * 1000),
  );

  const currentDeck = useMemo(() => {
    return decks.find((d) => d.id === deckId) || state?.initialDeck || null;
  }, [decks, deckId, state?.initialDeck]);

  // URL 파라미터 기반 상태
  const filter = searchParams.get("filter") || "all";
  const sortType = searchParams.get("sort") || "default";

  // --- [3] 초기 데이터 로드 및 정보 매칭 ---

  useEffect(() => {
    if (deckId) {
      // 단어 목록 가져오기
      fetchWordsByDeck(deckId);
      fetchDeckById(deckId);
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
    // 원본 보호를 위해 복사본 사용
    let result = [...words].filter((w) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "favorite"
            ? w.isFavorite
            : filter === "none"
              ? !w.status || w.status === "none"
              : w.status === filter;

      const query = debouncedQuery.toLowerCase();
      const matchesSearch =
        w.word?.toLowerCase().includes(query) ||
        w.meaning?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });

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
        break;
    }
    return result;
  }, [words, filter, debouncedQuery, sortType, shuffleSeed]);

  // --- [6] 통계 데이터 계산 ---
  const filterCounts = useMemo(
    () => ({
      all: words.length,
      favorite: words.filter((w) => w.isFavorite).length,
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

  const handleFilterChange = useCallback(
    (newFilter) => updateParams("filter", newFilter),
    [updateParams],
  );

  const handleSortChange = useCallback(
    (newSort) => {
      updateParams("sort", newSort);
      if (newSort === "shuffle")
        setShuffleSeed(Math.floor(Math.random() * 1000));
    },
    [updateParams],
  );

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

  // --- [9] CRUD 액션 (모달 연결 + useCallback 최적화) ---
  const onAddWord = useCallback(() => {
    openModal("WORD_ADD", {
      deckId,
      onSubmit: async (data) => {
        Array.isArray(data)
          ? await addWordsBulk(deckId, data)
          : await addWord(deckId, data);
        closeModal();
      },
    });
  }, [deckId, openModal, closeModal, addWord, addWordsBulk]);

  const onEditWord = useCallback(
    (word) => {
      openModal("WORD_EDIT", {
        initialData: word,
        onSubmit: async (formData) => {
          await updateWord(word.id, formData);
          closeModal();
        },
      });
    },
    [openModal, closeModal, updateWord],
  );

  const onDeleteWord = useCallback(
    (wordId) => {
      openModal("CONFIRM_DELETE", {
        title: "이 단어를 삭제할까요?",
        onConfirm: async () => {
          await deleteWord(wordId);
          closeModal();
        },
      });
    },
    [openModal, closeModal, deleteWord],
  );

  const onEditDeck = useCallback(() => {
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
  }, [currentDeck, deckId, openModal, closeModal, updateDeck]);

  const onDeleteDeck = useCallback(() => {
    openModal("CONFIRM_DELETE", {
      title: "이 단어장을 삭제할까요?",
      message: "포함된 모든 단어가 함께 삭제됩니다.",
      onConfirm: async () => {
        await deleteDeck(deckId);
        closeModal();
      },
    });
  }, [deckId, openModal, closeModal, deleteDeck]);

  const onBulkEdit = useCallback(() => {
    openModal("WORD_EDIT_BULK", {
      words,
      onSubmit: async (updatedList) => {
        await updateWordsBulk(updatedList);
        closeModal();
      },
    });
  }, [words, openModal, closeModal, updateWordsBulk]);

  const onToggleWordFavorite = useCallback(
    async (wordId, currentStatus) => {
      await updateWordFavorite(wordId, !currentStatus);
    },
    [updateWordFavorite],
  );

  const onToggleDeckFavorite = useCallback(
    async (deckId, currentStatus) => {
      if (!deckId) return;
      await updateDeckFavorite(deckId, !currentStatus);
    },
    [updateDeckFavorite],
  );

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
    onToggleWordFavorite,
    onToggleDeckFavorite,
  };
};
