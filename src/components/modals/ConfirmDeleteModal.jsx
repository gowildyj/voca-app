import React from "react";
import Button from "@/components/common/Button";
import { Trash2, X } from "lucide-react";
import "@/styles/components/modals/confirmDeleteModal.css";

/**
 * ConfirmDeleteModal: 토스트처럼 가볍게 떠오르는 삭제 확인창입니다.
 * Stella님의 취향을 반영해 귀엽고 직관적으로 디자인했습니다.
 */
const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "정말 삭제할까요?",
}) => {
  if (!isOpen) return null;

  return (
    <div className="v-toast-modal-overlay" onClick={onClose}>
      <div
        className="v-toast-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 아이콘 및 닫기 버튼 */}
        <div className="v-toast-modal-header">
          <div className="v-toast-icon-bg">
            <Trash2 size={20} color="var(--danger)" />
          </div>
          <button className="v-toast-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="v-toast-modal-body">
          <h3>{title}</h3>
          <p>삭제된 내용은 다시 복구할 수 없어요.</p>
        </div>

        {/* 버튼 영역 */}
        <div className="v-toast-modal-footer">
          <Button variant="secondary" onClick={onClose} fullWidth>
            취소
          </Button>
          <Button variant="danger" onClick={onConfirm} fullWidth>
            삭제하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
