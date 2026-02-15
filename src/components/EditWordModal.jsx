import React, { useState, useEffect, useCallback, memo } from "react";
import { X } from "lucide-react";
import Modal from "@/components/common/Modal";

/**
 * EditWordModal: 단어 정보를 수정하는 모달
 * memo를 사용하여 부모의 리스트 갱신 시 발생하는 불필요한 리렌더링을 방지합니다.
 */
const EditWordModal = ({ isOpen, onClose, onUpdate, item }) => {
  // 1. 상태 관리 (객체화하여 상태 업데이트 횟수 최적화)
  const [formData, setFormData] = useState({ word: "", meaning: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. 모달이 열릴 때 초기 데이터 동기화
  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        word: item.word ?? "",
        meaning: item.meaning ?? "",
      });
    }
  }, [isOpen, item]);

  // 3. 입력 핸들러 (useCallback으로 최적화)
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // 4. 저장 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사 및 중복 제출 방지
    const trimmedWord = formData.word.trim();
    const trimmedMeaning = formData.meaning.trim();

    if (!item?.id || !trimmedWord || !trimmedMeaning || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await onUpdate(item.id, {
        word: trimmedWord,
        meaning: trimmedMeaning,
      });

      // 성공 시에만 닫기 (onUpdate가 success 여부를 반환한다고 가정)
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

  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
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

// 불필요한 리렌더링 방지를 위해 memo로 래핑
export default memo(EditWordModal);
