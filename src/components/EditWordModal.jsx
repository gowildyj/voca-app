import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Modal from "@/components/common/Modal";

const EditWordModal = ({ isOpen, onClose, onUpdate, item }) => {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setWord(item.word ?? "");
      setMeaning(item.meaning ?? "");
    }
  }, [item, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item || !word.trim() || !meaning.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await onUpdate(item.id, { word: word.trim(), meaning: meaning.trim() });
      if (result?.success !== false) onClose();
    } catch (error) {
      console.error("수정 실패:", error);
      alert("수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="small">
      <div className="modal-header">
        <h2>단어 수정</h2>
        <button onClick={onClose} className="modal-close-btn" aria-label="닫기">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="modal-form">
        <div className="input-group">
          <label className="modal-label">단어</label>
          <input
            className="modal-input"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="단어를 입력하세요"
            autoFocus
          />
        </div>

        <div className="input-group">
          <label className="modal-label">뜻</label>
          <input
            className="modal-input"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="뜻을 입력하세요"
          />
        </div>

        <button
          type="submit"
          className="modal-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "저장하기"}
        </button>
      </form>
    </Modal>
  );
};

export default EditWordModal;
