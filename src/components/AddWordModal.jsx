import React, { useState } from "react";
import { X } from "lucide-react";

const AddWordModal = ({ isOpen, onClose, onAdd }) => {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word || !meaning) return;
    onAdd({ word, meaning, example: "" });
    setWord("");
    setMeaning("");
    onClose();
  };

  // 공통 input 스타일 정의
  const inputStyle = {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "14px",
    border: "1px solid var(--primary)", // 테마 색상에 맞게 경계선 조절
    backgroundColor: "var(--bg)", // 배경색을 테마 배경색으로
    color: "var(--text)", // 글자색도 테마에 맞게
    fontSize: "1rem",
    boxSizing: "border-box", // 패딩 때문에 삐져나가는 것 방지 (가장 중요!)
    outline: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)", // 조금 더 어둡게 해서 모달 집중도 높임
        backdropFilter: "blur(4px)", // 배경 블러 효과 (트렌디한 앱 느낌)
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
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
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
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
            cursor: "pointer",
          }}
        >
          <X size={24} />
        </button>

        <h2
          style={{
            marginBottom: "24px",
            fontSize: "1.5rem",
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          새 단어 추가
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "8px" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                opacity: 0.7,
                marginLeft: "4px",
              }}
            >
              단어
            </label>
            <input
              placeholder="Apple"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                opacity: 0.7,
                marginLeft: "4px",
              }}
            >
              뜻
            </label>
            <input
              placeholder="사과"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
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
              transition: "transform 0.2s",
            }}
          >
            저장하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddWordModal;
