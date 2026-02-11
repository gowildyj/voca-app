import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ 애니메이션 추가

const EditWordModal = ({ isOpen, onClose, onUpdate, item }) => {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ 중복 클릭 방지 상태

  // 1. 데이터 초기화 로직
  useEffect(() => {
    if (item && isOpen) {
      setWord(item.word);
      setMeaning(item.meaning);
    }
  }, [item, isOpen]);

  // 2. 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // ✅ onUpdate가 비동기(async)일 경우를 대비해 await 처리
      const result = await onUpdate(item.id, { word, meaning });
      if (result?.success !== false) {
        onClose();
      }
    } catch (error) {
      console.error("수정 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="modal-content small"
          >
            <div className="modal-header">
              <h2>단어 수정</h2>
              <button
                onClick={onClose}
                className="modal-close-btn"
                aria-label="닫기"
              >
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditWordModal;
