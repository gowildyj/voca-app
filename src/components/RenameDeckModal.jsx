import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Modal from "@/components/common/Modal";

const LANG_OPTIONS = [
  { value: "", label: "음성 지원 안함" },
  { value: "en-US", label: "영어 (US)" },
  { value: "ko-KR", label: "한국어" },
  { value: "fr-FR", label: "프랑스어" },
  { value: "ja-JP", label: "일본어" },
  { value: "zh-CN", label: "중국어" },
  { value: "es-ES", label: "스페인어" },
  { value: "th-TH", label: "태국어" },
  { value: "vi-VN", label: "베트남어" },
];

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewName(oldName || "");
      setNewLang(oldLangCode || "");
    }
  }, [isOpen, oldName, oldLangCode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onRename(deckId, oldName, newName.trim(), newLang);
      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.message || "수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="small">
      <div className="modal-header">
        <h2 className="modal-title">덱 정보 수정</h2>
        <button onClick={onClose} className="modal-close-btn" aria-label="닫기">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="modal-form modal-form--compact">
        <div className="input-group">
          <label className="modal-label">학습 언어</label>
          <select
            value={newLang}
            onChange={(e) => setNewLang(e.target.value)}
            className="modal-select"
          >
            {LANG_OPTIONS.map((opt) => (
              <option key={opt.value || "none"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="modal-label">덱 이름</label>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="modal-input"
            placeholder="덱 이름"
          />
        </div>

        <button
          type="submit"
          className="modal-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "수정 완료"}
        </button>
      </form>
    </Modal>
  );
};

export default RenameDeckModal;
