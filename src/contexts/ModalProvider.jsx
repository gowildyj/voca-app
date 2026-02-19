import React, { useState, lazy, Suspense } from "react";
import { ModalContext } from "./ModalContext";

const ModalComponents = {
  ADD_DECK: lazy(() => import("@/components/common/modals/AddWordModal")),
  ADD_WORD: lazy(() => import("@/components/common/modals/AddWordModal")),
  EDIT_DECK: lazy(() => import("@/components/common/modals/EditDeckModal")),
  EDIT_WORD: lazy(() => import("@/components/common/modals/EditWordModal")),
  BULK_EDIT: lazy(() => import("@/components/common/modals/BulkEditModal")),
};

const ModalRenderer = ({ config, onClose }) => {
  const { type, props } = config;
  if (!type || !ModalComponents[type]) return null;
  const SelectedModal = ModalComponents[type];

  return (
    <Suspense fallback={null}>
      <SelectedModal isOpen={true} onClose={onClose} {...props} />
    </Suspense>
  );
};

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState({ type: null, props: {} });

  const openModal = (type, props = {}) => setModalConfig({ type, props });
  const closeModal = () => setModalConfig({ type: null, props: {} });

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalConfig.type && (
        <ModalRenderer config={modalConfig} onClose={closeModal} />
      )}
    </ModalContext.Provider>
  );
};
