import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 성능과 사용성을 최적화한 공통 모달
 * 포털(Portal)을 사용하여 DOM 최상단에 렌더링함으로써 z-index 문제를 방지합니다.
 */
const Modal = ({
  isOpen = false,
  onClose,
  children,
  size = "normal",
  className = "",
}) => {
  // 1. 키보드 ESC 키 제어 (예외처리)
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  // 2. 모달 오픈 시 배경 스크롤 방지 (UX/UI 최적화)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // 포털을 통해 모달을 body 바로 아래에 렌더링
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="modal-overlay"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`modal-content ${size === "small" ? "small" : ""} ${className}`.trim()}
            onClick={(e) => e.stopPropagation()} // 콘텐츠 클릭 시 닫힘 방지
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "16px",
              maxWidth: size === "small" ? "320px" : "500px",
              width: "90%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default React.memo(Modal);
