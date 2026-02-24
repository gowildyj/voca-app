import React from "react";
import { X } from "lucide-react";
import "@/styles/components/modals/bottomSheet.css";

/**
 * BottomSheet: 모바일에서 하단부부터 올라오는 모달 컴포넌트
 * isOpen: 모달이 열려 있는지 여부를 나타내는 boolean
 * onClose: 모달이 닫기될 때 호출되는 함수
 * title: 모달의 제목
 * children: 모달의 내용
 * */
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
