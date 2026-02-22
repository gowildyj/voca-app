// src/components/modals/WordAddTabsForm.jsx
import React, { useState, useEffect, useRef } from "react";
import BottomSheet from "@/components/modals/BottomSheet";
import { StyledInput, StyledTextArea } from "@/components/common/StyledInput";
import Button from "@/components/common/Button";

const WordAddTabsForm = ({ isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState("single"); // 'single' | 'bulk'
  const inputRef = useRef(null);

  // 포커스 로직 (기존 동일)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // 🌟 [Case 1] 하나씩 추가 모드
    if (activeTab === "single") {
      const word = formData.get("word");
      const meaning = formData.get("meaning");
      const example = formData.get("example");

      if (!word || !meaning) {
        alert("단어와 뜻을 모두 입력해주세요!");
        return;
      }
      // 단일 객체 전송
      onSubmit && onSubmit({ word, meaning, example });
    }
    // 🌟 [Case 2] 여러 개 추가 모드
    else {
      const text = formData.get("bulkText");
      if (!text || !text.trim()) {
        alert("추가할 단어 목록을 입력해주세요!");
        return;
      }

      // 줄바꿈으로 나누고, 콤마/탭 등으로 단어와 뜻 분리
      const lines = text.split("\n").filter((line) => line.trim());
      const wordsList = lines
        .map((line) => {
          // 콤마(,), 콜론(:), 탭(\t) 중 하나로 분리
          const parts = line.split(/[,:\t]+/).map((s) => s.trim());
          return {
            word: parts[0],
            meaning: parts[1] || "", // 뜻이 없으면 빈 문자열
            example: "",
          };
        })
        .filter((item) => item.word); // 단어가 있는 것만 필터링

      if (wordsList.length === 0) {
        alert("유효한 단어가 없습니다.");
        return;
      }
      // 배열 전송
      onSubmit && onSubmit(wordsList);
    }

    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="단어 추가하기">
      {/* 🌟 1. form 태그로 감싸고 onSubmit 연결 */}
      <form
        onSubmit={handleSubmit}
        className="word-add-tabs-container"
        style={{ paddingBottom: "20px" }}
      >
        {/* 탭 버튼 (기존 동일) */}
        <div
          className="modal-tabs"
          style={{
            display: "flex",
            backgroundColor: "rgba(0,0,0,0.05)",
            padding: "4px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <button
            type="button" // 🌟 탭 버튼이 submit 하지 않도록 type="button" 명시
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: activeTab === "single" ? "#fff" : "transparent",
              boxShadow:
                activeTab === "single" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              color: activeTab === "single" ? "var(--primary)" : "#666",
            }}
            onClick={() => setActiveTab("single")}
          >
            하나씩 추가
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: activeTab === "bulk" ? "#fff" : "transparent",
              boxShadow:
                activeTab === "bulk" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              color: activeTab === "bulk" ? "var(--primary)" : "#666",
            }}
            onClick={() => setActiveTab("bulk")}
          >
            여러 개 추가
          </button>
        </div>

        {/* 탭별 컨텐츠 */}
        {activeTab === "single" ? (
          <div className="tab-content single-add">
            <StyledInput
              ref={inputRef}
              name="word" // 🌟 name 속성 필수!
              label="단어"
              placeholder="영단어나 문장을 입력하세요"
            />
            <StyledInput
              name="meaning" // 🌟 name 속성 필수!
              label="뜻"
              placeholder="한글 뜻을 입력하세요"
            />
            <StyledInput
              name="example" // 🌟 name 속성 필수!
              label="예문 (선택)"
              placeholder="예문을 입력하세요"
            />
          </div>
        ) : (
          <div className="tab-content bulk-add">
            <p
              style={{
                fontSize: "0.85rem",
                color: "#666",
                marginBottom: "12px",
              }}
            >
              줄바꿈으로 구분하여 여러 단어를 한 번에 넣으세요.
              <br />
              단어와 뜻을 콤마(,)나 콜론(:)으로 구분합니다.
            </p>
            <StyledTextArea
              ref={inputRef}
              name="bulkText" // 🌟 name 속성 필수!
              label="추가할 단어 목록"
              placeholder={`Apple, 사과\nBanana: 바나나`}
              style={{ minHeight: "180px" }}
            />
          </div>
        )}

        {/* 🌟 2. 저장 버튼: onClick 제거, type="submit" 추가 */}
        <Button type="submit" fullWidth className="mt-16">
          저장하기
        </Button>
      </form>
    </BottomSheet>
  );
};

export default WordAddTabsForm;
