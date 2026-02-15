import React, { useState, useEffect, useCallback, memo } from "react";
import { X, Save, RotateCcw } from "lucide-react";
import Modal from "@/components/common/Modal";
import { LANG_OPTIONS } from "@/constants/languages";

/**
 * UpdateDeckModal: 덱의 이름과 TTS 언어 설정을 수정
 * React.memo를 통해 부모 리스트 갱신 시 발생하는 불필요한 리렌더링을 방지합니다.
 */
const UpdateDeckModal = ({
  isOpen,
  onClose,
  onRename,
  onResetProgress,
  oldName = "",
  deckId,
  oldLangCode = "",
}) => {
  // 1. 상태 통합 관리 (입력 폼 객체화)
  const [formData, setFormData] = useState({ name: "", lang: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. 모달이 열릴 때만 상태 초기화 (동기화 로직 최적화)
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: oldName,
        lang: oldLangCode,
      });
    }
  }, [isOpen, oldName, oldLangCode]);

  // 3. 입력 핸들러 (메모이제이션)
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // 4. 저장 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();

    // 유효성 검사 및 중복 제출 방지
    if (!deckId || !trimmedName || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 파라미터 전달 순서 및 무결성 확인
      await onRename(deckId, oldName, trimmedName, formData.lang);
      onClose();
    } catch (err) {
      console.error("[UpdateDeckModal] Update error:", err);
      alert(err?.message || "덱 정보를 수정하는 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "정말 이 덱의 모든 학습 기록을 초기화하시겠습니까?\n'몰라요/알아요' 상태가 모두 사라집니다.",
      )
    ) {
      onResetProgress(deckId);
      alert("학습 기록이 초기화되었습니다.");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="small">
      <div className="modal-header">
        <h2 className="modal-title">덱 정보 수정</h2>
        <button
          onClick={onClose}
          className="modal-close-btn"
          aria-label="모달 닫기"
          type="button"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="modal-form modal-form--compact">
        <div className="input-group">
          <label className="modal-label" htmlFor="deck-lang">
            학습 언어 (TTS)
          </label>
          <select
            id="deck-lang"
            name="lang"
            value={formData.lang}
            onChange={handleChange}
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
          <label className="modal-label" htmlFor="deck-name">
            단어장 이름
          </label>
          <input
            id="deck-name"
            name="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            className="modal-input"
            placeholder="단어장 이름을 입력하세요"
            autoComplete="off"
          />
        </div>

        <label className="modal-label">학습 관리</label>
        <button
          type="button"
          className="reset-progress-btn"
          onClick={handleReset}
        >
          <RotateCcw size={16} />
          학습 기록 초기화 (모든 단어 상태 리셋)
        </button>

        <button
          type="submit"
          className="modal-submit-btn"
          disabled={isSubmitting || !formData.name.trim()}
        >
          {isSubmitting ? "저장 중..." : "수정 완료"}
        </button>
      </form>
    </Modal>
  );
};

export default memo(UpdateDeckModal);
