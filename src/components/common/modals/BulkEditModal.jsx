import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import Modal from "@/components/common/Modal"; // 기존 Modal 컴포넌트

const BulkEditModal = ({ isOpen, onClose, words, onSave }) => {
  const [editedWords, setEditedWords] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsInitialLoading(true);
      if (words) {
        setEditedWords(JSON.parse(JSON.stringify(words)));
        setTimeout(() => setIsInitialLoading(false), 100);
      } else {
        setIsInitialLoading(false);
      }
    }
  }, [isOpen, words]);

  // 입력 핸들러
  const handleChange = (id, field, value) => {
    setEditedWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
    );
  };

  // 저장 핸들러
  const handleSubmit = async () => {
    if (editedWords.length === 0) return;
    setIsSubmitting(true);
    try {
      await onSave(editedWords);
      onClose();
    } catch (err) {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="modal-header">
        <h2 className="modal-title">단어 일괄 수정</h2>
        <button
          onClick={onClose}
          className="modal-close-btn"
          type="button"
          aria-label="닫기"
        >
          <X size={20} />
        </button>
      </div>

      <div className="modal-body-scroll">
        {/* ✅ 여기에 중괄호 { 가 있어야 합니다! */}
        {isInitialLoading ? (
          <div className="empty-state">
            <Loader2
              className="spinner"
              size={32}
              style={{ marginBottom: "10px", opacity: 0.5 }}
            />
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : editedWords.length === 0 ? (
          <div className="empty-state">
            <p>수정할 단어가 없습니다.</p>
          </div>
        ) : (
          <div className="bulk-edit-list">
            {editedWords.map((word) => (
              <div key={word.id} className="bulk-edit-item">
                <div className="input-group">
                  <label className="modal-label">단어</label>
                  <input
                    value={word.word}
                    onChange={(e) =>
                      handleChange(word.id, "word", e.target.value)
                    }
                    className="modal-input"
                    placeholder="단어"
                  />
                </div>
                <div className="input-group">
                  <label className="modal-label">뜻</label>
                  <input
                    value={word.meaning}
                    onChange={(e) =>
                      handleChange(word.id, "meaning", e.target.value)
                    }
                    className="modal-input"
                    placeholder="뜻"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button
          onClick={handleSubmit}
          className="modal-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "저장 중..."
          ) : (
            <div className="btn-content">
              {/* <Save size={18} /> */}
              <span>전체 저장 ({editedWords.length}개)</span>
            </div>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default BulkEditModal;
