import React, { useState } from "react";
import { X, Plus, ListPlus } from "lucide-react";
import { motion } from "framer-motion";

const AddWordModal = ({
  isOpen,
  onClose,
  onAdd, // 단어 추가 함수
  onAddBulk, // 단어 대량 추가 함수
  onAddDeck, // ✅ 덱 추가 함수 (새로 추가된 decks 테이블용)
  defaultDeck,
  mode, // "word" 또는 "deck"
}) => {
  const [activeTab, setActiveTab] = useState("single");
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [newDeckName, setNewDeckName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // 1. 단어 하나 추가 핸들러
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd({ word, meaning, deck: defaultDeck });
      setWord("");
      setMeaning("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. 단어 대량 추가 핸들러
  const handleBulkSubmit = async () => {
    if (isSubmitting) return;
    const lines = bulkText.split("\n").filter((line) => line.trim());
    const parsedWords = lines
      .map((line) => {
        const [w, m] = line.split(/[:|,|\t]/).map((s) => s.trim());
        return { word: w, meaning: m, deck: defaultDeck };
      })
      .filter((item) => item.word && item.meaning);

    if (parsedWords.length === 0) return alert("형식에 맞춰 입력해주세요!");

    setIsSubmitting(true);
    try {
      await onAddBulk(parsedWords);
      setBulkText("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. ✅ 덱 추가 핸들러 (더 이상 가짜 단어를 넣지 않음)
  const handleDeckSubmit = async (e) => {
    e.preventDefault();
    if (!newDeckName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 이제 'decks' 테이블에 이름만 등록합니다.
      await onAddDeck(newDeckName);
      setNewDeckName("");
      onClose();
    } catch (error) {
      console.error("덱 생성 중 오류:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="modal-content"
        style={modalStyle}
      >
        {/* 헤더 */}
        <div style={modalHeaderStyle}>
          <h2>{mode === "deck" ? "새로운 덱 만들기" : "단어 추가하기"}</h2>
          <button onClick={onClose} style={closeBtnStyle}>
            <X size={20} />
          </button>
        </div>

        {/* 탭 메뉴 (단어 추가 모드일 때만 표시) */}
        {mode === "word" && (
          <div style={tabContainerStyle}>
            <button
              onClick={() => setActiveTab("single")}
              style={activeTab === "single" ? activeTabStyle : tabStyle}
            >
              <Plus size={16} /> 하나씩
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              style={activeTab === "bulk" ? activeTabStyle : tabStyle}
            >
              <ListPlus size={16} /> 여러 개
            </button>
          </div>
        )}

        <div style={{ padding: "20px" }}>
          {/* 1️⃣ 덱 추가 모드 */}
          {mode === "deck" ? (
            <form onSubmit={handleDeckSubmit} style={formStyle}>
              <p style={guideTextStyle}>
                공부할 주제나 언어 이름을 적어주세요.
              </p>
              <input
                placeholder="예: 프랑스어 회화, 토익 필수"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                style={inputStyle}
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ ...submitBtnStyle, opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? "처리 중..." : "새 덱 생성하기"}
              </button>
            </form>
          ) : (
            /* 2️⃣ 단어 추가 모드 */
            <>
              {activeTab === "single" ? (
                <form onSubmit={handleSingleSubmit} style={formStyle}>
                  <input
                    placeholder="단어"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    style={inputStyle}
                    autoFocus
                  />
                  <input
                    placeholder="뜻"
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                    style={inputStyle}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={submitBtnStyle}
                  >
                    {isSubmitting ? "추가 중..." : "추가하기"}
                  </button>
                </form>
              ) : (
                <div style={formStyle}>
                  <p style={guideTextStyle}>
                    줄바꿈으로 구분해 주세요. (단어:뜻)
                  </p>
                  <textarea
                    placeholder={"apple:사과\nbanana:바나나"}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    style={{ ...inputStyle, height: "150px", resize: "none" }}
                  />
                  <button
                    onClick={handleBulkSubmit}
                    disabled={isSubmitting}
                    style={submitBtnStyle}
                  >
                    {isSubmitting ? "업로드 중..." : "일괄 추가"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- 스타일링 ---
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "20px",
};
const modalStyle = {
  background: "var(--card)",
  width: "100%",
  maxWidth: "450px",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
};
const modalHeaderStyle = {
  padding: "20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid rgba(0,0,0,0.05)",
};
const tabContainerStyle = {
  display: "flex",
  padding: "10px 20px",
  gap: "10px",
  background: "var(--bg)",
};
const tabStyle = {
  flex: 1,
  padding: "10px",
  border: "none",
  borderRadius: "12px",
  background: "transparent",
  color: "var(--text)",
  opacity: 0.5,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  fontWeight: "600",
};
const activeTabStyle = {
  ...tabStyle,
  background: "var(--card)",
  opacity: 1,
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};
const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.1)",
  background: "var(--bg)",
  color: "var(--text)",
  marginBottom: "12px",
  outline: "none",
};
const guideTextStyle = {
  fontSize: "0.8rem",
  opacity: 0.6,
  marginBottom: "12px",
};
const submitBtnStyle = {
  width: "100%",
  padding: "16px",
  borderRadius: "12px",
  border: "none",
  background: "var(--primary)",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
};
const closeBtnStyle = {
  background: "none",
  border: "none",
  color: "var(--text)",
  opacity: 0.5,
  cursor: "pointer",
};
const formStyle = { display: "flex", flexDirection: "column" };

export default AddWordModal;
