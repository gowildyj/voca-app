// src/components/modals/ModalRenderer.jsx
import React from "react";
import DeckAddForm from "@/components/modals/DeckAddForm";
import DeckEditForm from "@/components/modals/DeckEditForm";
import WordAddForm from "@/components/modals/WordAddTabsForm";
import WordEditForm from "@/components/modals/WordEditForm";
import WordEditBulkForm from "@/components/modals/WordEditBulkForm";

/**
 * 전역 모달 렌더러
 * 여기서 앱의 모든 모달을 중앙 제어합니다.
 */
const ModalRenderer = ({ modalType, modalProps, isOpen, onClose }) => {
  if (!isOpen) return null;

  switch (modalType) {
    case "DECK_ADD":
      return <DeckAddForm {...modalProps} isOpen={isOpen} onClose={onClose} />;
    case "DECK_EDIT":
      return <DeckEditForm {...modalProps} isOpen={isOpen} onClose={onClose} />;
    case "WORD_ADD":
      return (
        <WordAddTabsForm {...modalProps} isOpen={isOpen} onClose={onClose} />
      );
    case "WORD_EDIT":
      return <WordEditForm {...modalProps} isOpen={isOpen} onClose={onClose} />;
    case "WORD_EDIT_BULK":
      return (
        <WordEditBulkForm {...modalProps} isOpen={isOpen} onClose={onClose} />
      );

    default:
      return null;
  }
};

export default ModalRenderer;
