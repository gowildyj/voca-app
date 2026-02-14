import React from "react";
import { motion } from "framer-motion";

/**
 * 공통 모달 레이아웃: 오버레이 클릭 시 닫기, 콘텐츠 클릭은 전파 중단
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  size = "normal",
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`modal-content ${size === "small" ? "small" : ""} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Modal;
