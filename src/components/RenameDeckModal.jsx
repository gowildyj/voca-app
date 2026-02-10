import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// ✅ props에 deckId를 추가로 받습니다.
const RenameDeckModal = ({ isOpen, onClose, onRename, oldName, deckId }) => {
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (isOpen) setNewName(oldName);
  }, [isOpen, oldName]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!newName || !newName.trim() || newName === oldName) {
      onClose();
      return;
    }

    // ✅ 핵심 수정: useWords의 renameDeck(deckId, oldName, newName) 형식에 맞춤
    onRename(deckId, oldName, newName.trim());
    onClose();
  };

  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid var(--primary)",
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--card)",
          width: "100%",
          maxWidth: "380px",
          borderRadius: "28px",
          padding: "32px 24px 24px 24px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: "20px",
            top: "20px",
            background: "none",
            border: "none",
            color: "var(--text)",
            opacity: 0.5,
          }}
        >
          <X size={24} />
        </button>

        <h2
          style={{
            marginBottom: "24px",
            fontSize: "1.3rem",
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          덱 이름 수정
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                opacity: 0.7,
                marginLeft: "4px",
              }}
            >
              새로운 이름
            </label>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "16px",
              backgroundColor: "var(--primary)",
              color: "white",
              border: "none",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            변경하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default RenameDeckModal;
