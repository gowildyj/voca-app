import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useWordStore } from "@/store/useWordStore";
import { useModal } from "@/contexts/ModalContext";
import { seededShuffle } from "@/utils/seedShuffle";

/**
 * useWordList: 단어 목록 페이지의 데이터 로드, 필터링, 액션을 통합 관리하는 훅
 */
export const useWordList = (deckId) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { openModal, closeModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const observerTarget = useRef(null);

  // --- [1] Zustand Store: 상태와 액션 추출 ---
  const words = useWordStore((state) => state.words);
  const decks = useWordStore((state) => state.decks);
  const loading = useWordStore((state) => state.loading);

  const fetchWordsByDeck = useWordStore((state) => state.fetchWordsByDeck);
  const fetchDeckById = useWordStore((state) => state.fetchDeckById);
  const addWord = useWordStore((state) => state.addWord);
  const addWordsBulk = useWordStore((state) => state.addWordsBulk);
  const updateWordsBulk = useWordStore((state) => state.updateWordsBulk);
  const updateWordOrderBulk = useWordStore(
    (state) => state.updateWordOrderBulk,
  );
  const updateWord = useWordStore((state) => state.updateWord);
  const deleteWord = useWordStore((state) => state.deleteWord);
  const updateDeck = useWordStore((state) => state.updateDeck);
  const deleteDeck = useWordStore((state) => state.deleteDeck);
  const updateWordFavorite = useWordStore((state) => state.updateWordFavorite);
  const updateDeckFavorite = useWordStore((state) => state.updateDeckFavorite);
  const deleteAllWordsByDeck = useWordStore(
    (state) => state.deleteAllWordsByDeck,
  );
  const resetAllWordStatus = useWordStore((state) => state.resetAllWordStatus);

  // --- [2] 로컬 상태 (UI Control) ---
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

  const filter = searchParams.get("filter") || "all";
  const sortType = searchParams.get("sort") || "default";

  // --- [3] 초기 데이터 로드 ---
  useEffect(() => {
    if (!deckId) return;
    const loadData = async () => {
      const deckData = await fetchDeckById(deckId);
      if (!deckData) {
        navigate("/not-found", { replace: true });
        return;
      }
      fetchWordsByDeck(deckId);
    };
    loadData();
  }, [deckId, fetchWordsByDeck, fetchDeckById, navigate]);

  // --- [4] 검색어 디바운싱 ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setDisplayLimit(20);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- [5] 필터링 및 정렬 로직 (핵심 수정됨 🌟) ---
  const filteredWords = useMemo(() => {
    // 1. 필터링 & 검색
    let result = words.filter((w) => {
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
        w.meaning?.toLowerCase().includes(query) ||
        w.example?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });

    // 2. 정렬 로직
    switch (sortType) {
      case "alpha":
        result.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case "latest":
        result.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        );
        break;
      case "shuffle":
        result = seededShuffle(result, shuffleSeed);
        break;
      case "default":
      default:
        // 🌟 사용자 지정 순서(displayOrder)로 정렬 (등록순의 실제 로직)
        result.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        break;
    }
    return result;
  }, [words, filter, debouncedQuery, sortType, shuffleSeed]);

  // 현재 화면에 실제로 렌더링되는 단어 목록 (무한스크롤 적용)
  const displayWords = useMemo(() => {
    return filteredWords.slice(0, displayLimit);
  }, [filteredWords, displayLimit]);

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

  // --- [7] UI 핸들러 ---
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

  const onToggleMode = useCallback((mode) => {
    setHideMode((prev) => (prev === mode ? null : mode));
  }, []);

  // --- [8] 무한 스크롤 ---
  useEffect(() => {
    if (filteredWords.length <= displayLimit) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit((prev) => prev + 20);
        }
      },
      { threshold: 0.1, rootMargin: "150px" },
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => target && observer.unobserve(target);
  }, [filteredWords.length, displayLimit]);

  // --- [9] CRUD 액션 ---

  const onAddWord = useCallback(() => {
    openModal("WORD_ADD", {
      deckId,
      onSubmit: async (data) => {
        if (Array.isArray(data)) {
          await addWordsBulk(deckId, data);
        } else {
          await addWord(deckId, data);
        }
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

  const onBulkEdit = useCallback(() => {
    const baseWords = [...words]
      .filter((w) => w.deckId === deckId)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

    openModal("WORD_EDIT_BULK", {
      words: baseWords,
      deckId: deckId,
      onSubmit: async (updatedList) => {
        await updateWordsBulk(updatedList);
        closeModal();
      },
    });
  }, [words, deckId, openModal, closeModal, updateWordsBulk]);

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
          icon: formData.icon,
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

  const onResetStatus = useCallback(() => {
    openModal("CONFIRM_DELETE", {
      title: "학습 상태 초기화",
      message: "모든 단어의 '알아/몰라' 기록을 지우고 미학습 상태로 돌릴까요?",
      onConfirm: async () => {
        await resetAllWordStatus(deckId);
        closeModal();
      },
    });
  }, [deckId, openModal, closeModal, resetAllWordStatus]);

  const onDeleteAll = useCallback(() => {
    openModal("CONFIRM_DELETE", {
      title: "단어 전체 삭제",
      message:
        "이 단어장의 모든 단어가 영구적으로 삭제됩니다. 정말 삭제할까요?",
      onConfirm: async () => {
        await deleteAllWordsByDeck(deckId);
        closeModal();
      },
    });
  }, [deckId, openModal, closeModal, deleteAllWordsByDeck]);

  const saveReorderedWords = useCallback(
    async (orderedList) => {
      const payload = orderedList.map((word, index) => ({
        id: word.id,
        display_order: index,
      }));

      await updateWordOrderBulk(payload);
    },
    [updateWordOrderBulk],
  );

  return {
    words,
    filter,
    sortType,
    searchQuery,
    filterCounts,
    filteredWords,
    displayWords,
    currentDeck,
    loading,
    totalCount: words.length,
    hideMode,
    observerTarget,
    setSearchQuery,
    handleFilterChange,
    handleSortChange,
    onToggleMode,
    onAddWord,
    onEditWord,
    onDeleteWord,
    onEditDeck,
    onDeleteDeck,
    onBulkEdit,
    onToggleWordFavorite,
    onToggleDeckFavorite,
    onResetStatus,
    onDeleteAll,
    saveReorderedWords,
  };
};
