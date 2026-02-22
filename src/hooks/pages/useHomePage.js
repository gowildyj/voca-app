// src/hooks/pages/useHomePage.js
import { useMemo } from "react";
import { useNavigate, generatePath } from "react-router-dom";
import { useWords } from "@/hooks/useWords";
import { useModal } from "@/contexts/ModalContext";
import { ROUTES } from "@/routes/AppRoutes"; // 라우트 상수 필요

export const useHomePage = (currentLangValue) => {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();

  // 🌟 1. useWords에서 필요한 함수들 모두 가져오기
  const { decks, loading, addDeck, updateDeck, deleteDeck, fetchDecks } =
    useWords(currentLangValue);

  // 2. 최근 학습 단어장 (데이터 정규화 반영: created_at 등 확인 필요하지만 일단 0번째)
  const lastDeck = useMemo(() => {
    if (!decks || decks.length === 0) return null;
    return decks[0];
  }, [decks]);

  // 3. 노출할 덱 4개
  const displayDecks = useMemo(() => {
    return decks.slice(0, 4);
  }, [decks]);

  // ============================================================
  // 🌟 핵심 수정: 모달 핸들러 추가 (onSubmit 주입)
  // ============================================================

  /** 단어장 추가 핸들러 */
  const onAddDeck = () => {
    openModal("DECK_ADD", {
      isEdit: false,
      initialData: { lang_code: currentLangValue }, // 현재 언어 기본값 설정
      onSubmit: async (formData) => {
        await addDeck({
          name: formData.title,
          description: formData.description,
          language: formData.language, // 폼에서 선택한 언어
          icon: "📁",
        });
        closeModal();
      },
    });
  };

  /** 단어장 수정 핸들러 */
  const onEditDeck = (deck) => {
    openModal("DECK_EDIT", {
      initialData: deck,
      isEdit: true,
      onSubmit: async (formData) => {
        await updateDeck(deck.id, {
          name: formData.title,
          description: formData.description,
          icon: deck.icon,
        });
        closeModal();
      },
    });
  };

  /** 단어장 삭제 핸들러 */
  const handleDeleteDeck = (deck) => {
    openModal("CONFIRM_DELETE", {
      title: `"${deck.name}" 단어장을 삭제할까요?`, // deck_name -> name
      onConfirm: async () => {
        await deleteDeck(deck.id);
        closeModal();
      },
    });
  };

  // 네비게이션 헬퍼
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
    onAddDeck,
    onEditDeck,
    handleDeleteDeck,
    fetchDecks,
  };
};
