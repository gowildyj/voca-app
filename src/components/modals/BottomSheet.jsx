import React from "react";
import { X } from "lucide-react";
import "@/styles/components/modals/bottomSheet.css";

const BottomSheet = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content bottom-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-handle">
          <div className="handle-bar"></div>
        </div>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
