// src/contexts/ModalContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  lazy,
  Suspense,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";

// 모달 상태를 공유할 Context 생성
const ModalContext = createContext(null);

// 모달 컴포넌트 매핑 (지연 로딩 적용)
// 대규모 서비스에서 초기 로딩 속도를 높이기 위해 lazy 사용
const ModalComponents = {
  // DECK_ADD: lazy(() => import("@/components/modals/DeckEditForm")),
  // DECK_EDIT: lazy(() => import("@/components/modals/DeckEditForm")),
  // WORD_ADD: lazy(() => import("@/components/modals/WordAddTabsForm")),
  // WORD_EDIT: lazy(() => import("@/components/modals/WordEditForm")),
  // WORD_EDIT_BULK: lazy(() => import("@/components/modals/WordEditBulkForm")),
  // CONFIRM_DELETE: lazy(() => import("@/components/modals/ConfirmDeleteModal")),
};

/**
 * ModalRenderer: Portal을 사용하여 모달을 #modal-root로 전송
 */
const ModalRenderer = ({ config, onClose }) => {
  const { type, props } = config;

  // 열린 모달이 없거나 등록되지 않은 타입이면 렌더링 안 함
  if (!type || !ModalComponents[type]) {
    if (type)
      console.error(`[ModalError] "${type}"은 등록되지 않은 모달 타입입니다.`);
    return null;
  }

  const SelectedModal = ModalComponents[type];
  const modalRoot = document.getElementById("modal-root");

  // DOM에 #modal-root가 없는 경우 예외 처리
  if (!modalRoot) {
    console.warn(
      "HTML에 <div id='modal-root'></div>가 없습니다. index.html을 확인하세요.",
    );
    return null;
  }

  // React Portal을 사용하여 UI 깨짐 방지
  return createPortal(
    <Suspense fallback={null}>
      {/* SelectedModal에 공통 props 주입 */}
      <SelectedModal isOpen={true} onClose={onClose} {...props} />
    </Suspense>,
    modalRoot,
  );
};

/**
 * ModalProvider: 앱 전체에 모달 제어 기능을 제공
 */
export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState({ type: null, props: {} });

  // 모달 열기 함수 (useCallback으로 성능 최적화)
  const openModal = useCallback((type, props = {}) => {
    setModalConfig({ type, props });
  }, []);

  // 모달 닫기 함수 (메모리 누수 방지를 위해 props까지 초기화)
  const closeModal = useCallback(() => {
    setModalConfig({ type: null, props: {} });
  }, []);

  // Context 값 메모이제이션 (불필요한 전체 리렌더링 방지)
  const value = useMemo(
    () => ({ openModal, closeModal }),
    [openModal, closeModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalRenderer config={modalConfig} onClose={closeModal} />
    </ModalContext.Provider>
  );
};

/**
 * useModal: 컴포넌트에서 모달을 사용하기 위한 커스텀 훅
 */
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal은 ModalProvider 내부에서 사용해야 합니다.");
  }
  return context;
};
