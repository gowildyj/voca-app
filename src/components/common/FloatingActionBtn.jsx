import React from "react";
import { HiPlus } from "react-icons/hi2";
import { useLocation } from "react-router-dom";
import { useModal } from "@/contexts/ModalContext";
import { ROUTES } from "@/routes/AppRoutes";

const FloatingActionBtn = () => {
  const { openModal } = useModal();
  const location = useLocation();

  // 1. 버튼을 보여줄 경로 정의 (내 단어장, 단어 목록 상세)
  const isDeckList = location.pathname === ROUTES.DECK_LIST;
  const isWordList = location.pathname.startsWith("/list/"); // 예: /list/123

  // 2. 홈(/), 시나리오(/scenarios), 설정(/settings) 등에서는 아예 렌더링 안 함
  if (!isDeckList && !isWordList) return null;

  const handleFabClick = () => {
    if (isDeckList) {
      openModal("DECK_EDIT", { isEdit: false });
    } else {
      // 단어 목록 페이지일 때
      const deckId = location.pathname.split("/").pop();
      openModal("WORD_EDIT", { isEdit: false, deckId });
    }
  };

  return (
    <button
      className="btn-fab main-fab clickable-bounce"
      onClick={handleFabClick}
    >
      <HiPlus size={28} />
    </button>
  );
};

export default FloatingActionBtn;
