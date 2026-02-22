import { useEffect, useMemo } from "react";
import { useWords } from "@/hooks/useWords";
import { useWordListLogic } from "@/hooks/useWordListLogic";
import { useModal } from "@/contexts/ModalContext";

export const useWordListPage = (deckId) => {
  const { openModal, closeModal } = useModal();
  const { words, decks, loading, fetchWordsByDeck, deleteDeck } = useWords();

  useEffect(() => {
    if (deckId) {
      fetchWordsByDeck(deckId);
    }
  }, [deckId, fetchWordsByDeck]);

  // 현재 덱 정보 찾기
  const currentDeck = useMemo(
    () => decks.find((d) => d.id === deckId),
    [decks, deckId],
  );

  // 필터링 및 정렬 로직 (기존 훅 재사용)
  const logic = useWordListLogic(words);

  // 덱 삭제 핸들러
  const handleDeleteDeck = () => {
    openModal("CONFIRM_DELETE", {
      title: "이 단어장을 삭제할까요?",
      onConfirm: async () => {
        await deleteDeck(deckId);
        closeModal();
      },
    });
  };

  return {
    ...logic,
    currentDeck,
    loading,
    openModal,
    handleDeleteDeck,
    totalCount: words.length,
  };
};
