// src/hooks/pages/useWordDeckList.js
import { useState, useMemo } from "react";
import { useWords } from "@/hooks/useWords";
import { useModal } from "@/contexts/ModalContext";

/**
 * WordDeckList 페이지의 비즈니스 로직 훅
 * 역할: 데이터 로드, 검색 필터링, 모달(추가/수정/삭제) 핸들링
 */
export const useWordDeckList = (currentLangValue) => {
  // 1. Core Hooks
  const {
    decks,
    loading,
    addDeck,
    updateDeck,
    deleteDeck,
    fetchDecks,
    updateDeckFavorite,
  } = useWords(currentLangValue);
  const { openModal, closeModal } = useModal();

  // 2. Local State
  const [activeTab, setActiveTab] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const categories = ["전체", "최근 학습", "중요 ⭐️", "완료"];

  // 3. Filtering Logic
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      const matchesSearch = deck.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (activeTab === "전체") return matchesSearch;
      if (activeTab === "중요 ⭐️") return matchesSearch && deck.isFavorite;
      return matchesSearch;
    });
  }, [decks, searchQuery, activeTab]);

  const onToggleFavorite = async (deckId, currentStatus) => {
    await updateDeckFavorite(deckId, !currentStatus);
  };

  // 4. Handlers (Modal Controls)

  /** 단어장 추가 모달 열기 */
  const onAddDeck = () => {
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
  };

  /** 단어장 수정 모달 열기 */
  const onEditDeck = (deck) => {
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
  };

  /** 단어장 삭제 모달 열기 */
  const handleDeleteClick = (deck) => {
    openModal("CONFIRM_DELETE", {
      title: `"${deck.name}" 단어장을 삭제할까요?`,
      message: "삭제된 내용은 다시 복구할 수 없어요.",
      onConfirm: async () => {
        await deleteDeck(deck.id);
        closeModal();
      },
    });
  };

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
    onToggleFavorite,
  };
};
