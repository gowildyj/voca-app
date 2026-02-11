import React, { useState } from "react";
import { X, Plus, ListPlus } from "lucide-react";
import { motion } from "framer-motion";

const AddWordModal = ({
  isOpen,
  onClose,
  onAdd,
  onAddBulk,
  onAddDeck,
  defaultDeck,
  mode,
}) => {
  const [activeTab, setActiveTab] = useState("single");
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [newDeckName, setNewDeckName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [langCode, setLangCode] = useState("");

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
      await onAddDeck(newDeckName, langCode);
      setNewDeckName("");
      onClose();
    } catch (error) {
      console.error("덱 생성 중 오류:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="modal-content"
      >
        <div className="modal-header">
          <h2>{mode === "deck" ? "새로운 덱 만들기" : "단어 추가하기"}</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {mode === "word" && (
          <div className="modal-tab-container">
            <button
              onClick={() => setActiveTab("single")}
              className={`modal-tab ${activeTab === "single" ? "active" : ""}`}
            >
              <Plus size={16} /> 하나씩
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`modal-tab ${activeTab === "bulk" ? "active" : ""}`}
            >
              <ListPlus size={16} /> 여러 개
            </button>
          </div>
        )}

        <div className="modal-form">
          {mode === "deck" ? (
            <form onSubmit={handleDeckSubmit}>
              <p className="modal-guide-text">
                공부할 주제와 언어를 선택해 주세요.
              </p>
              <label className="modal-label">학습 언어</label>
              <select
                value={langCode}
                onChange={(e) => setLangCode(e.target.value)}
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

              <label className="modal-label">덱 이름</label>
              <input
                placeholder="예: 파리 여행 준비"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                className="modal-input"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="modal-submit-btn"
              >
                {isSubmitting ? "처리 중..." : "새 덱 생성하기"}
              </button>
            </form>
          ) : /* 단어 추가 모드 */
          activeTab === "single" ? (
            <form onSubmit={handleSingleSubmit}>
              <input
                placeholder="단어"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="modal-input"
                autoFocus
              />
              <input
                placeholder="뜻"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                className="modal-input"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="modal-submit-btn"
              >
                {isSubmitting ? "추가 중..." : "추가하기"}
              </button>
            </form>
          ) : (
            <div>
              <p className="modal-guide-text">줄바꿈으로 구분 (단어:뜻)</p>
              <textarea
                placeholder={"apple:사과\nbanana:바나나"}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="modal-textarea"
              />
              <button
                onClick={handleBulkSubmit}
                disabled={isSubmitting}
                className="modal-submit-btn"
              >
                {isSubmitting ? "업로드 중..." : "일괄 추가"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AddWordModal;
