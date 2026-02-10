import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// defaultDeck 프롭스를 추가로 받습니다.
const AddWordModal = ({ isOpen, onClose, onAdd, defaultDeck }) => {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  // ✅ 덱 이름을 입력받는 상태 추가
  const [deckName, setDeckName] = useState("");

  // 모달이 열릴 때마다 초기화 및 현재 덱 이름 설정
  useEffect(() => {
    if (isOpen) {
      setWord("");
      setMeaning("");
      // 대시보드에서 '새 덱 만들기'로 들어오면 비어있고, 특정 덱 안에서 들어오면 그 이름이 기본값입니다.
      setDeckName(defaultDeck || "");
    }
  }, [isOpen, defaultDeck]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word || !meaning || !deckName) {
      alert("단어, 뜻, 그리고 덱 이름을 모두 입력해주세요!");
      return;
    }

    // ✅ 객체에 deck 정보를 포함해서 전달합니다.
    onAdd({
      word,
      meaning,
      deck: deckName, // 덱 카테고리 정보
      status: "none",
    });

    onClose();
  };

  const inputStyle = {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
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
        zIndex: 2000, // 플로팅 버튼보다 위에 떠야 함
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
          {defaultDeck ? `${defaultDeck}에 추가` : "새 단어 추가"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* ✅ 덱 입력 칸 추가 (대시보드에서 '새 덱 만들기' 할 때 필요) */}
          <div style={{ marginBottom: "8px" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                opacity: 0.7,
                marginLeft: "4px",
              }}
            >
              단어 덱 이름
            </label>
            <input
              placeholder="예: 프랑스어, 스페인어 회화"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              style={inputStyle}
              disabled={!!defaultDeck} // 특정 덱 안에서 추가할 때는 수정 불가하게 처리
            />
          </div>

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
