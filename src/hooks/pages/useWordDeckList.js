import { useState, useMemo, useCallback } from "react";
import { useWordStore } from "@/store/useWordStore";
import { useModal } from "@/contexts/ModalContext";

/**
 * WordDeckList 페이지의 비즈니스 로직 훅
 * 역할: 데이터 로드, 검색 필터링, 모달(추가/수정/삭제) 핸들링
 */
export const useWordDeckList = (currentLangValue) => {
  const { openModal, closeModal } = useModal();

  // --- [1] Zustand Store에서 상태와 액션 가져오기 ---
  // 컴포넌트 리렌더링 최적화를 위해 필요한 것만 선택해서 가져옵니다.
  const decks = useWordStore((state) => state.decks);
  const loading = useWordStore((state) => state.loading);
  const fetchDecks = useWordStore((state) => state.fetchDecks);
  const clearDecks = useWordStore((state) => state.clearDecks);
  const addDeck = useWordStore((state) => state.addDeck);
  const updateDeck = useWordStore((state) => state.updateDeck);
  const deleteDeck = useWordStore((state) => state.deleteDeck);
  const updateDeckFavorite = useWordStore((state) => state.updateDeckFavorite);

  // --- [2] 로컬 상태 관리 (UI 전용) ---
  const [activeTab, setActiveTab] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const categories = ["전체", "최근 학습", "중요 ⭐️", "완료"];

  // --- [3] 필터링 로직 ---
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      // 검색어 필터
      const matchesSearch = deck.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // 탭 필터
      if (activeTab === "전체") return matchesSearch;
      if (activeTab === "중요 ⭐️") return matchesSearch && deck.isFavorite;
      return matchesSearch;
    });
  }, [decks, searchQuery, activeTab]);

  // --- [4] 핸들러 함수들 ---

  // 즐겨찾기 토글
  const onToggleDeckFavorite = useCallback(
    async (deckId, currentStatus) => {
      await updateDeckFavorite(deckId, !currentStatus);
    },
    [updateDeckFavorite],
  );

  /** 단어장 추가 모달 열기 */
  const onAddDeck = useCallback(() => {
    openModal("DECK_ADD", {
      isEdit: false,
      initialData: { lang_code: currentLangValue },

      onSubmit: async (formData) => {
        await addDeck({
          name: formData.title,
          description: formData.description,
          language: formData.language,
          icon: "",
        });
        closeModal();
      },
    });
  }, [openModal, closeModal, addDeck, currentLangValue]);

  /** 단어장 수정 모달 열기 */
  const onEditDeck = useCallback(
    (deck) => {
      openModal("DECK_EDIT", {
        initialData: deck,
        isEdit: true,
        onSubmit: async (formData) => {
          await updateDeck(deck.id, {
            name: formData.title,
            description: formData.description,
            language: formData.language,
            icon: deck.icon,
          });
          closeModal();
        },
      });
    },
    [openModal, closeModal, updateDeck],
  );

  /** 단어장 삭제 모달 열기 */
  const handleDeleteClick = useCallback(
    (deck) => {
      openModal("CONFIRM_DELETE", {
        title: `"${deck.name}" 단어장을 삭제할까요?`,
        message: "삭제된 내용은 다시 복구할 수 없어요.",
        onConfirm: async () => {
          await deleteDeck(deck.id);
          closeModal();
        },
      });
    },
    [openModal, closeModal, deleteDeck],
  );

  return {
    // Data
    decks: filteredDecks,
    loading,
    categories,

    // State Controls
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,

    // Action Handlers
    onAddDeck,
    onEditDeck,
    handleDeleteClick,
    fetchDecks,
    clearDecks,
    onToggleDeckFavorite,
  };
};
