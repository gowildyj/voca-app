// src/hooks/pages/useHomePage.js
import { useMemo } from "react";
import { useNavigate, generatePath } from "react-router-dom";
import { useWords } from "@/hooks/useWords";
import { useModal } from "@/contexts/ModalContext";
import { ROUTES } from "@/routes/AppRoutes";

export const useHomePage = (currentLangValue) => {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();

  // 🌟 DB에서 덱 목록 가져오기 (언어 필터 적용)
  const { decks, loading, deleteDeck } = useWords(currentLangValue);

  // 1. 최근 학습 단어장 추출 (가장 최근 생성되거나 업데이트된 덱 1개)
  const lastDeck = useMemo(() => {
    if (!decks || decks.length === 0) return null;
    return decks[0]; // SQL에서 이미 created_at desc 정렬됨
  }, [decks]);

  // 2. 홈 화면에 노출할 4개의 덱 (2열 배치를 고려한 4개 제한)
  const displayDecks = useMemo(() => {
    return decks.slice(0, 4);
  }, [decks]);

  // 3. 삭제 처리 로직
  const handleDeleteDeck = (deck) => {
    openModal("CONFIRM_DELETE", {
      title: `"${deck.deck_name}" 단어장을 삭제할까요?`,
      onConfirm: async () => {
        await deleteDeck(deck.id);
        closeModal();
      },
    });
  };

  const handleNavigate = (path, params) => {
    if (params) {
      navigate(generatePath(path, params));
    } else {
      navigate(path);
    }
  };

  return {
    lastDeck,
    displayDecks,
    loading,
    handleNavigate,
    handleDeleteDeck,
    openModal,
  };
};
