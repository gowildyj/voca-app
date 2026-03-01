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
  const { state } = useLocation(); // 이전 페이지(단어장 목록)에서 넘겨준 state
  const { openModal, closeModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const observerTarget = useRef(null);

  // --- [1] Zustand Store: 상태와 액션 추출 ---
  const words = useWordStore((state) => state.words);
  const decks = useWordStore((state) => state.decks);
  const loading = useWordStore((state) => state.loading);

  // Actions
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

  // --- [2] 로컬 상태 (UI Control) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hideMode, setHideMode] = useState(null); // 'word' | 'meaning' | null
  const [displayLimit, setDisplayLimit] = useState(20);
  const [shuffleSeed, setShuffleSeed] = useState(() =>
    Math.floor(Math.random() * 1000),
  );

  // 현재 덱 정보 (Store에 없으면 location state의 정보 사용 -> 로딩 체감 감소)
  const currentDeck = useMemo(() => {
    return decks.find((d) => d.id === deckId) || state?.initialDeck || null;
  }, [decks, deckId, state?.initialDeck]);

  // URL 파라미터 파싱
  const filter = searchParams.get("filter") || "all";
  const sortType = searchParams.get("sort") || "default";

  // --- [3] 초기 데이터 로드 ---
  useEffect(() => {
    if (!deckId) return;

    const loadData = async () => {
      const deckData = await fetchDeckById(deckId);

      if (!deckData) {
        // console.warn("덱 정보를 찾을 수 없습니다.");
        navigate("/not-found", { replace: true });
        return;
      }

      // 덱이 있으면 단어 목록 가져오기
      fetchWordsByDeck(deckId);
    };

    loadData();
  }, [deckId, fetchWordsByDeck, fetchDeckById, navigate]);

  // --- [4] 검색어 디바운싱 (성능 최적화) ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setDisplayLimit(20); // 검색 시 스크롤 초기화
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- [5] 필터링 및 정렬 로직 (핵심) ---
  const filteredWords = useMemo(() => {
    // 1. 필터링 & 검색
    let result = words.filter((w) => {
      // 필터 조건
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "favorite"
            ? w.isFavorite
            : filter === "none"
              ? !w.status || w.status === "none"
              : w.status === filter;

      // 검색 조건 (단어, 뜻, 예문까지 검색 가능하게 확장 가능)
      const query = debouncedQuery.toLowerCase();
      const matchesSearch =
        w.word?.toLowerCase().includes(query) ||
        w.meaning?.toLowerCase().includes(query) ||
        w.example?.toLowerCase().includes(query); // 🌟 예문 검색 추가됨

      return matchesFilter && matchesSearch;
    });

    // 2. 정렬 (원본 배열 보호를 위해 복사 불필요 -> filter가 이미 새 배열 반환)
    switch (sortType) {
      case "alpha":
        result.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case "latest":
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "shuffle":
        // 시드 기반 셔플 (새로고침 전까지 순서 유지)
        result = seededShuffle(result, shuffleSeed);
        break;
      default:
        // 기본: 등록순 (created_at) 등 DB 정렬 유지
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

  // --- [8] 무한 스크롤 (Intersection Observer) ---
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

  // --- [9] CRUD 액션 (모달 연결) ---

  // 1. 단어 추가 (단건/다건 자동 분기)
  const onAddWord = useCallback(() => {
    openModal("WORD_ADD", {
      deckId,
      onSubmit: async (data) => {
        // data = { word, meaning, example } OR [{ word, meaning, example }, ...]
        if (Array.isArray(data)) {
          await addWordsBulk(deckId, data);
        } else {
          await addWord(deckId, data);
        }
        closeModal();
      },
    });
  }, [deckId, openModal, closeModal, addWord, addWordsBulk]);

  // 2. 단어 수정 (단건)
  const onEditWord = useCallback(
    (word) => {
      openModal("WORD_EDIT", {
        initialData: word, // word 객체 (example 포함)
        onSubmit: async (formData) => {
          // formData = { word, meaning, example }
          await updateWord(word.id, formData); // Store의 수정된 updateWord 호출
          closeModal();
        },
      });
    },
    [openModal, closeModal, updateWord],
  );

  // 3. 단어 일괄 수정 (WordEditBulkForm 연결)
  const onBulkEdit = useCallback(() => {
    openModal("WORD_EDIT_BULK", {
      words: filteredWords, // 현재 필터된 목록만 수정할지, 전체(words)를 할지 결정 (보통 전체)
      onSubmit: async (updatedList) => {
        // updatedList = [{ id, deck_id, word, meaning, example }, ...]
        await updateWordsBulk(updatedList);
        closeModal();
      },
    });
  }, [filteredWords, openModal, closeModal, updateWordsBulk]);

  // 4. 단어 삭제
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

  // 5. 덱 수정
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
          icon: formData.icon, // 아이콘 추가
        });
        closeModal();
      },
    });
  }, [currentDeck, deckId, openModal, closeModal, updateDeck]);

  // 6. 덱 삭제
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

  // 즐겨찾기 토글 (단어)
  const onToggleWordFavorite = useCallback(
    async (wordId, currentStatus) => {
      await updateWordFavorite(wordId, !currentStatus);
    },
    [updateWordFavorite],
  );

  // 즐겨찾기 토글 (덱)
  const onToggleDeckFavorite = useCallback(
    async (deckId, currentStatus) => {
      if (!deckId) return;
      await updateDeckFavorite(deckId, !currentStatus);
    },
    [updateDeckFavorite],
  );

  return {
    // 상태
    filter,
    sortType,
    searchQuery,
    filterCounts,
    filteredWords,
    displayWords: filteredWords.slice(0, displayLimit), // 무한 스크롤 적용된 목록
    currentDeck,
    loading,
    totalCount: words.length,
    hideMode,
    observerTarget,

    // 액션 핸들러
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
  };
};
