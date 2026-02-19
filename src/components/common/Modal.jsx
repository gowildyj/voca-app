import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const Modal = ({ isOpen = false, onClose, children, className = "" }) => {
  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={onClose}
        >
          <motion.div
            key="modal-content"
            /* 1. 초기 위치 및 애니메이션 */
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            /* 2. 위로 못 올라가게 제한하는 핵심 설정 */
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }} // ✅ top을 0으로 두면 위로 드래그가 막힙니다.
            dragElastic={{ top: 0, bottom: 0.5 }} // ✅ 위쪽 탄성(Elastic)을 0으로 주면 잡아당겨도 안 올라갑니다.
            onDragEnd={(_, info) => {
              // 아래로 100px 이상 내리거나, 빠르게 아래로 튕기면(velocity) 닫기
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className={`modal-content bottom-sheet ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-drag-handle">
              <div className="handle-bar" />
            </div>

            <div className="modal-scroll-area">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default React.memo(Modal);
