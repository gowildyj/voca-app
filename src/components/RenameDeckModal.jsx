import React, { useState } from "react";
import { X } from "lucide-react";

const RenameDeckModal = ({
  isOpen,
  onClose,
  onRename,
  oldName,
  deckId,
  oldLangCode,
}) => {
  const [newName, setNewName] = useState(oldName || "");
  const [newLang, setNewLang] = useState(oldLangCode || "");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onRename(deckId, oldName, newName.trim(), newLang);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content small">
        <button
          onClick={onClose}
          className="modal-close-btn"
          style={{ position: "absolute", right: "20px", top: "20px" }}
        >
          <X size={24} />
        </button>

        <h2 className="modal-title">덱 정보 수정</h2>

        <form
          onSubmit={handleSubmit}
          className="modal-form"
          style={{ padding: 0 }}
        >
          <div style={{ marginBottom: "20px" }}>
            <label className="modal-label">학습 언어 변경</label>
            <select
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              className="modal-select"
            >
              <option value="">음성 지원 안함</option>
              <option value="en-US">영어 (US)</option>
              <option value="ko-KR">한국어</option>
              <option value="fr-FR">프랑스어</option>
              <option value="ja-JP">일본어</option>
              <option value="zh-CN">중국어</option>
              <option value="es-ES">스페인어</option>
              <option value="th-TH">태국어</option>
              <option value="vi-VN">베트남어</option>
            </select>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label className="modal-label">덱 이름 변경</label>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="modal-input"
              style={{ marginBottom: 0 }}
            />
          </div>

          <button type="submit" className="modal-submit-btn">
            수정 완료
          </button>
        </form>
      </div>
    </div>
  );
};

export default RenameDeckModal;
