import React, { useState, useCallback, useMemo } from "react";
import { X, Plus, ListPlus } from "lucide-react";
import Modal from "@/components/common/Modal";

const AddWordModal = ({
  isOpen,
  onClose,
  onAdd,
  onAddBulk,
  onAddDeck,
  defaultDeckId,
  mode = "word", // 기본값 설정
}) => {
  // 1. 상태 관리 (기능별 분리)
  const [activeTab, setActiveTab] = useState("single");
  const [singleWord, setSingleWord] = useState({ word: "", meaning: "" });
  const [bulkText, setBulkText] = useState("");
  const [deckInfo, setDeckInfo] = useState({ name: "", lang: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. 입력값 초기화 함수 (재사용성)
  const resetFields = useCallback(() => {
    setSingleWord({ word: "", meaning: "" });
    setBulkText("");
    setDeckInfo({ name: "", lang: "" });
    setIsSubmitting(false);
  }, []);

  // 3. 단일 단어 추가 핸들러
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. 일괄 추가 핸들러 (강력한 파싱 로직)
  const handleBulkSubmit = async () => {
    if (!bulkText.trim() || isSubmitting) return;

    // 정규식을 활용한 정교한 파싱 (콜론, 쉼표, 탭 대응)
    const lines = bulkText.split("\n").filter((line) => line.trim());
    const parsedWords = lines
      .map((line) => {
        const parts = line.split(/[:|,\t]/);
        if (parts.length < 2) return null;

        const w = parts[0].trim().replace(/^["']|["']$/g, "");
        const m = parts[1].trim().replace(/^["']|["']$/g, "");

        return w && m ? { word: w, meaning: m, deck_id: defaultDeckId } : null;
      })
      .filter(Boolean);

    if (parsedWords.length === 0) {
      alert("입력 형식이 올바르지 않습니다.\n예) apple:사과");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAddBulk?.(parsedWords);
      if (result?.success !== false) {
        resetFields();
        onClose();
      }
    } catch (e) {
      alert("일괄 추가 중 서버 오류가 발생했습니다.");
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. UI 렌더링 최적화 (useMemo/함수 분리)
  const isDeckMode = mode === "deck";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={isDeckMode ? "small" : "normal"}
    >
      <div className="modal-header">
        <h2 className="modal-title">
          {isDeckMode ? "새로운 덱 만들기" : "단어 추가하기"}
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
              <option value="">음성 지원 안함</option>
              <option value="en-US">영어 (US)</option>
              <option value="ko-KR">한국어</option>
              <option value="ja-JP">일본어</option>
              <option value="fr-FR">프랑스어</option>
              <option value="zh-CN">중국어</option>
            </select>
            <label className="modal-label">덱 이름</label>
            <input
              placeholder="예: 토익 필수 영단어"
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
              {isSubmitting ? "생성 중..." : "새 덱 생성하기"}
            </button>
          </form>
        ) : activeTab === "single" ? (
          <form onSubmit={handleSingleSubmit}>
            <div className="input-group">
              <label className="modal-label">단어</label>
              <input
                placeholder="영단어나 문장을 입력하세요"
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
                placeholder="의미를 입력하세요"
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
              줄바꿈으로 구분 (콜론, 쉼표, 탭 지원)
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
              {isSubmitting ? "업로드 중..." : "리스트 일괄 추가"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default React.memo(AddWordModal);
