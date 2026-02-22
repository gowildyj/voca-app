import { useEffect, useMemo } from "react";
import { useWords } from "@/hooks/useWords";
import { useWordListLogic } from "@/hooks/useWordListLogic";
import { useModal } from "@/contexts/ModalContext";

export const useWordListPage = (deckId) => {
  const { openModal, closeModal } = useModal();

  const { words, decks, loading, fetchWordsByDeck, deleteDeck, addWord } =
    useWords();

  // 단어 목록 로드
  useEffect(() => {
    if (!deckId) return;
    fetchWordsByDeck(deckId);
  }, [deckId, fetchWordsByDeck]);

  // 현재 덱 정보
  const currentDeck = useMemo(() => {
    return decks.find((d) => d.id === deckId);
  }, [decks, deckId]);

  // 필터링 / 정렬 로직
  const logic = useWordListLogic(words);

  // 덱 삭제
  const handleDeleteDeck = () => {
    openModal("CONFIRM_DELETE", {
      title: "이 단어장을 삭제할까요?",
      onConfirm: async () => {
        await deleteDeck(deckId);
        closeModal();
      },
    });
  };

  // 단어 추가
  const handleAddWord = () => {
    openModal("WORD_ADD", {
      onSubmit: async (newWord) => {
        await addWord(deckId, newWord);
        closeModal();
      },
    });
  };

  return {
    ...logic,
    currentDeck,
    loading,
    handleAddWord,
    handleDeleteDeck,
    totalCount: words.length,
  };
};
