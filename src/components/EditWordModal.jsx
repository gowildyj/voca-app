// components/EditWordModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const EditWordModal = ({ isOpen, onClose, onUpdate, item }) => {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");

  // 모달이 열릴 때 선택한 단어의 정보를 input에 채워넣음
  useEffect(() => {
    if (item) {
      setWord(item.word);
      setMeaning(item.meaning);
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return;
    onUpdate(item.id, { word, meaning });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content small">
        <div className="modal-header">
          <h2>단어 수정</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="modal-label">단어</label>
          <input
            className="modal-input"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
          <label className="modal-label">뜻</label>
          <input
            className="modal-input"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
          />
          <button type="submit" className="modal-submit-btn">
            저장하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditWordModal;
