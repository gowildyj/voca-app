import React, { useState, useEffect, useCallback, memo } from "react";
import { X } from "lucide-react";
import Modal from "@/components/common/Modal";

const EditWordModal = ({ isOpen, onClose, onUpdate, item }) => {
  const [formData, setFormData] = useState({ word: "", meaning: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        word: item.word ?? "",
        meaning: item.meaning ?? "",
      });
    }
  }, [isOpen, item]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedWord = formData.word.trim();
    const trimmedMeaning = formData.meaning.trim();

    if (!item?.id || !trimmedWord || !trimmedMeaning || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await onUpdate(item.id, {
        word: trimmedWord,
        meaning: trimmedMeaning,
      });

      if (result?.success !== false) {
        onClose();
      }
    } catch (error) {
      console.error("[EditWordModal] Update Failed:", error);
      alert("수정 내용 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="small">
      <div className="modal-header">
        <h2 className="modal-title">단어 수정</h2>
        <button
          onClick={onClose}
          className="modal-close-btn"
          aria-label="모달 닫기"
          type="button"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="modal-form">
        <div className="input-group">
          <label className="modal-label" htmlFor="edit-word">
            단어
          </label>
          <input
            id="edit-word"
            name="word"
            className="modal-input"
            value={formData.word}
            onChange={handleChange}
            placeholder="단어를 입력하세요"
            autoFocus
            autoComplete="off"
          />
        </div>

        <div className="input-group">
          <label className="modal-label" htmlFor="edit-meaning">
            뜻
          </label>
          <input
            id="edit-meaning"
            name="meaning"
            className="modal-input"
            value={formData.meaning}
            onChange={handleChange}
            placeholder="뜻을 입력하세요"
            autoComplete="off"
          />
        </div>

        <div className="modal-footer" style={{ marginTop: "12px" }}>
          <button
            type="submit"
            className="modal-submit-btn"
            disabled={
              isSubmitting || !formData.word.trim() || !formData.meaning.trim()
            }
          >
            {isSubmitting ? "저장 중..." : "수정 완료"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default memo(EditWordModal);
