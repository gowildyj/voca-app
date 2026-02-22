import React, { useState, useCallback } from "react";
import { X, Plus, ListPlus } from "lucide-react";
import Modal from "@/components/common/Modal";
import { LANG_OPTIONS } from "@/constants/languages";

const parseBulkText = (text, deckId) => {
  if (!text.trim()) return [];

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[:|,\t]/);
      if (parts.length < 2) return null;

      const word = parts[0].trim().replace(/^["']|["']$/g, "");
      const meaning = parts[1].trim().replace(/^["']|["']$/g, "");

      return word && meaning ? { word, meaning, deck_id: deckId } : null;
    })
    .filter(Boolean);
};

const AddWordModal = ({
  isOpen,
  onClose,
  onAdd,
  onAddBulk,
  onAddDeck,
  defaultDeckId,
  mode = "word",
}) => {
  const [activeTab, setActiveTab] = useState("single");
  const [singleWord, setSingleWord] = useState({ word: "", meaning: "" });
  const [bulkText, setBulkText] = useState("");
  const [deckInfo, setDeckInfo] = useState({ name: "", lang: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFields = useCallback(() => {
    setSingleWord({ word: "", meaning: "" });
    setBulkText("");
    setDeckInfo({ name: "", lang: "" });
    setIsSubmitting(false);
  }, []);

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    const { word, meaning } = singleWord;

    if (!word.trim() || !meaning.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        word: word.trim(),
        meaning: meaning.trim(),
        deck_id: defaultDeckId,
      });
      resetFields();
      onClose();
    } catch (error) {
      console.error("단어 추가 실패:", error);
      alert("단어 추가 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!bulkText.trim() || isSubmitting) return;

    const parsedWords = parseBulkText(bulkText, defaultDeckId);

    if (parsedWords.length === 0) {
      alert("입력 형식이 올바르지 않습니다.\n예) apple:사과");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAddBulk?.(parsedWords);
      if (result && result.success === false) {
        throw new Error(result.message);
      }
      resetFields();
      onClose();
    } catch (e) {
      alert(e.message || "일괄 추가 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. 덱 생성 핸들러
  const handleDeckSubmit = async (e) => {
    e.preventDefault();
    if (!deckInfo.name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddDeck?.(deckInfo.name.trim(), deckInfo.lang);
      resetFields();
      onClose();
    } catch (error) {
      console.error("덱 생성 에러:", error);
      alert("단어장 생성 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDeckMode = mode === "deck";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={isDeckMode ? "small" : "normal"}
    >
      <div className="modal-header">
        <h2 className="modal-title">
          {isDeckMode ? "새로운 단어장 만들기" : "단어 추가하기"}
        </h2>
        <button onClick={onClose} className="modal-close-btn" aria-label="닫기">
          <X size={20} />
        </button>
      </div>

      {!isDeckMode && (
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
        {isDeckMode ? (
          <form onSubmit={handleDeckSubmit} className="modal-form--compact">
            <p className="modal-guide-text">
              학습할 주제와 TTS 언어를 설정하세요.
            </p>
            <label className="modal-label">학습 언어</label>
            <select
              value={deckInfo.lang}
              onChange={(e) =>
                setDeckInfo((prev) => ({ ...prev, lang: e.target.value }))
              }
              className="modal-select"
            >
              {LANG_OPTIONS.map((opt) => (
                <option key={opt.value || "none"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <label className="modal-label">단어장 이름</label>
            <input
              placeholder="단어장 이름을 입력하세요"
              value={deckInfo.name}
              onChange={(e) =>
                setDeckInfo((prev) => ({ ...prev, name: e.target.value }))
              }
              className="modal-input"
              autoFocus
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="modal-submit-btn"
            >
              {isSubmitting ? "생성 중..." : "새 단어장 생성하기"}
            </button>
          </form>
        ) : activeTab === "single" ? (
          <form onSubmit={handleSingleSubmit}>
            <div className="input-group">
              <label className="modal-label">단어</label>
              <input
                placeholder="단어를 입력하세요"
                value={singleWord.word}
                onChange={(e) =>
                  setSingleWord((prev) => ({ ...prev, word: e.target.value }))
                }
                className="modal-input"
                autoFocus
              />
            </div>
            <div className="input-group">
              <label className="modal-label">뜻</label>
              <input
                placeholder="뜻을 입력하세요"
                value={singleWord.meaning}
                onChange={(e) =>
                  setSingleWord((prev) => ({
                    ...prev,
                    meaning: e.target.value,
                  }))
                }
                className="modal-input"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="modal-submit-btn"
            >
              {isSubmitting ? "추가 중..." : "단어 추가하기"}
            </button>
          </form>
        ) : (
          <div className="modal-form--bulk">
            <p className="modal-guide-text">
              줄바꿈으로 구분 (콜론, 쉼표 지원)
            </p>
            <textarea
              placeholder={"apple:사과\nbanana,바나나"}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="modal-textarea"
            />
            <button
              onClick={handleBulkSubmit}
              disabled={isSubmitting}
              className="modal-submit-btn"
            >
              {isSubmitting ? "업로드 중..." : "리스트 일괄 추가"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default React.memo(AddWordModal);
