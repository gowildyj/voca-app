import { useEffect, useMemo } from "react";
import { useWords } from "@/hooks/useWords";
import { useWordListLogic } from "@/hooks/useWordListLogic";
import { useModal } from "@/contexts/ModalContext";

export const useWordListPage = (deckId) => {
  const { openModal, closeModal } = useModal();

  // 1. useWords에서 모든 DB 액션 함수 가져오기
  const {
    words,
    decks,
    loading,
    fetchWordsByDeck,
    fetchDecks,
    addWord,
    addWordsBulk,
    updateWordsBulk,
    updateWord,
    deleteWord,
    updateDeck,
    deleteDeck,
  } = useWords();

  // 2. 단어 목록 로드
  useEffect(() => {
    if (deckId) {
      fetchWordsByDeck(deckId);
      fetchDecks();
    }
  }, [deckId, fetchWordsByDeck, fetchDecks]);

  // 3. 현재 덱 정보 찾기
  const currentDeck = useMemo(() => {
    return decks.find((d) => d.id === deckId);
  }, [decks, deckId]);

  // 4. 필터/정렬 로직 (기존 유지)
  const logic = useWordListLogic(words);

  // console.log("원본 words 데이터 개수:", words?.length);
  // console.log("logic에서 계산된 filteredWords:", logic.filteredWords?.length);

  // ============================================================
  // 🌟 5. 핵심: onSubmit이 주입된 핸들러들 만들기
  // ============================================================

  /** 단어 추가 */
  const onAddWord = () => {
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
  };

  /** 단어 수정 */
  const onEditWord = (word) => {
    openModal("WORD_EDIT", {
      initialData: word,
      onSubmit: async (formData) => {
        await updateWord(word.id, formData);
        closeModal();
      },
    });
  };

  /** 단어 삭제 */
  const onDeleteWord = (word) => {
    openModal("CONFIRM_DELETE", {
      title: "이 단어를 삭제할까요?",
      onConfirm: async () => {
        await deleteWord(word.id);
        closeModal();
      },
    });
  };

  /** 덱 수정 (헤더 연필 아이콘) */
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

  /** 덱 삭제 (헤더 쓰레기통 아이콘) */
  const onDeleteDeck = () => {
    openModal("CONFIRM_DELETE", {
      title: "이 단어장을 삭제할까요?",
      message: "포함된 모든 단어가 함께 삭제됩니다.",
      onConfirm: async () => {
        await deleteDeck(deckId);
        // 삭제 후 뒤로가기 처리는 컴포넌트나 useWords에서 navigate 처리 필요
        closeModal();
      },
    });
  };

  /** 일괄 편집 모달 */
  const onBulkEdit = () => {
    openModal("WORD_EDIT_BULK", {
      words: words,
      onSubmit: async (updatedList) => {
        await updateWordsBulk(updatedList);
        closeModal();
      },
    });
  };

  return {
    ...logic,
    currentDeck,
    loading,
    totalCount: words.length,
    onAddWord,
    onEditWord,
    onDeleteWord,
    onEditDeck,
    onDeleteDeck,
    onBulkEdit,
  };
};
