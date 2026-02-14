import React, { useState } from "react";
import { X, Plus, ListPlus } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "@/components/common/Modal";

const AddWordModal = ({
  isOpen,
  onClose,
  onAdd,
  onAddBulk,
  onAddDeck,
  defaultDeckId,
  defaultDeckName,
  mode,
}) => {
  const [activeTab, setActiveTab] = useState("single");
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [newDeckName, setNewDeckName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [langCode, setLangCode] = useState("");

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAdd({
        word: word.trim(),
        meaning: meaning.trim(),
        deck_id: defaultDeckId,
      });
      setWord("");
      setMeaning("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (isSubmitting) return;

    const lines = bulkText.split("\n").filter((line) => line.trim());
    const parsedWords = lines
      .map((line) => {
        const parts = line.split(/[:|,|\t]/);
        if (parts.length < 2) return null;
        const w = parts[0].replace(/["']/g, "").trim();
        const m = parts[1].replace(/["']/g, "").trim();
        return w && m ? { word: w, meaning: m, deck_id: defaultDeckId } : null;
      })
      .filter(Boolean);

    if (parsedWords.length === 0) {
      alert("형식에 맞춰 입력해주세요! (예: apple:사과 또는 banana,바나나)");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAddBulk?.(parsedWords);
      if (result?.success !== false) {
        setBulkText("");
        onClose();
      } else {
        alert(result?.error || "일괄 추가 중 오류가 발생했습니다.");
      }
    } catch (e) {
      alert("일괄 추가 중 오류가 발생했습니다.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeckSubmit = async (e) => {
    e.preventDefault();
    if (!newDeckName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAddDeck?.(newDeckName.trim(), langCode);
      setNewDeckName("");
      setLangCode("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDeckForm = () => (
    <form onSubmit={handleDeckSubmit}>
      <p className="modal-guide-text">공부할 주제와 언어를 선택해 주세요.</p>
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
  );

  const renderSingleWordForm = () => (
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
  );

  const renderBulkWordForm = () => (
    <div>
      <p className="modal-guide-text">
        줄바꿈으로 구분 (콜론, 쉼표, 탭 모두 가능)
      </p>
      <textarea
        placeholder={"apple:사과\nbanana,바나나\ncherry\t체리"}
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
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={mode === "deck" ? "small" : "normal"}>
      <div className="modal-header">
        <h2>{mode === "deck" ? "새로운 덱 만들기" : "단어 추가하기"}</h2>
        <button onClick={onClose} className="modal-close-btn" aria-label="닫기">
          <X size={20} />
        </button>
      </div>

      {mode === "word" && (
        <div className="modal-tab-container">
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`modal-tab ${activeTab === "single" ? "active" : ""}`}
          >
            <Plus size={16} /> 하나씩
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bulk")}
            className={`modal-tab ${activeTab === "bulk" ? "active" : ""}`}
          >
            <ListPlus size={16} /> 여러 개
          </button>
        </div>
      )}

      <div className="modal-form">
        {mode === "deck"
          ? renderDeckForm()
          : activeTab === "single"
            ? renderSingleWordForm()
            : renderBulkWordForm()}
      </div>
    </Modal>
  );
};

export default AddWordModal;
