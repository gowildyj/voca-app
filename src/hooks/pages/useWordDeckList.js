// src/hooks/pages/useWordDeckList.js
import { useState, useMemo } from "react";
import { useWords } from "@/hooks/useWords";
import { useModal } from "@/contexts/ModalContext";

/**
 * WordDeckList 페이지의 비즈니스 로직을 담당하는 전용 훅
 * @param {string} currentLangValue - AppContext 등에서 관리되는 현재 선택 언어 코드
 */
export const useWordDeckList = (currentLangValue) => {
  const { decks, loading, deleteDeck } = useWords(currentLangValue);
  const { openModal, closeModal } = useModal();

  const [activeTab, setActiveTab] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["전체", "최근 학습", "중요 ⭐️", "완료"];

  // 🌟 DB에서 가져온 데이터를 검색어와 탭에 따라 필터링
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      const matchesSearch = deck.deck_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // 탭 필터링 (필요시 DB의 status나 created_at 기준으로 로직 추가)
      if (activeTab === "전체") return matchesSearch;
      if (activeTab === "중요 ⭐️") return matchesSearch && deck.is_favorite;
      return matchesSearch;
    });
  }, [decks, searchQuery, activeTab]);

  // 삭제 확인 모달 연동
  const handleDeleteClick = (deck) => {
    openModal("CONFIRM_DELETE", {
      title: `"${deck.deck_name}" 단어장을 삭제할까요?`,
      onConfirm: () => {
        deleteDeck(deck.id);
        closeModal();
      },
    });
  };

  return {
    decks: filteredDecks,
    loading,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    categories,
    openModal,
    handleDeleteClick,
  };
};
