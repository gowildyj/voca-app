import React, { useState, useEffect } from "react";
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
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtnStyle}>
          <X size={24} />
        </button>
        <h2 style={titleStyle}>덱 정보 수정</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>학습 언어 변경</label>
            <select
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              style={selectStyle}
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
            <label style={labelStyle}>덱 이름 변경</label>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button type="submit" style={submitBtnStyle}>
            수정 완료
          </button>
        </form>
      </div>
    </div>
  );
};

// 스타일 가이드 (AddWordModal과 통일)
const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  padding: "20px",
};
const modalStyle = {
  backgroundColor: "var(--card)",
  width: "100%",
  maxWidth: "380px",
  borderRadius: "28px",
  padding: "32px 24px 24px 24px",
  position: "relative",
};
const closeBtnStyle = {
  position: "absolute",
  right: "20px",
  top: "20px",
  background: "none",
  border: "none",
  color: "var(--text)",
  opacity: 0.5,
  cursor: "pointer",
};
const titleStyle = {
  marginBottom: "24px",
  fontSize: "1.3rem",
  fontWeight: "800",
  textAlign: "center",
};
const labelStyle = {
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "var(--primary)",
  marginBottom: "6px",
  display: "block",
  opacity: 0.8,
};
const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(0,0,0,0.1)",
  backgroundColor: "var(--bg)",
  color: "var(--text)",
  fontSize: "1rem",
  outline: "none",
};
const selectStyle = {
  ...inputStyle,
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  backgroundSize: "16px",
};
const submitBtnStyle = {
  width: "100%",
  padding: "16px",
  borderRadius: "16px",
  backgroundColor: "var(--primary)",
  color: "white",
  border: "none",
  fontWeight: "700",
  fontSize: "1rem",
  cursor: "pointer",
};

export default RenameDeckModal;
