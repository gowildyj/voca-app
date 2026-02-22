import React, { useState, useEffect, useRef } from "react";
import BottomSheet from "@/components/modals/BottomSheet";
import { StyledInput, StyledTextArea } from "@/components/common/StyledInput";
import Button from "@/components/common/Button";

const WordAddTabsForm = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("single"); // 'single' | 'bulk'
  const inputRef = useRef(null);

  // 탭이 바뀌거나 모달이 열릴 때 첫 번째 인풋에 포커스
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="단어 추가하기">
      <div
        className="word-add-tabs-container"
        style={{ paddingBottom: "20px" }}
      >
        {/* 1. 내부 탭 스위치 (세그먼트 스타일) */}
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

        {/* 2. 탭별 컨텐츠 */}
        {activeTab === "single" ? (
          <div className="tab-content single-add">
            <StyledInput
              ref={inputRef}
              label="단어"
              placeholder="영단어나 문장을 입력하세요"
            />
            <StyledTextArea label="뜻" placeholder="한글 뜻을 입력하세요" />
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
              <br /> 단어와 뜻을 ,(콤마) :(콜론) 탭으로 구분합니다.
            </p>
            <StyledTextArea
              ref={inputRef}
              label="추가할 단어 목록"
              placeholder="Apple 사과&#10;Banana 바나나"
              style={{ minHeight: "180px" }}
            />
          </div>
        )}

        {/* 3. 공통 하단 버튼 */}
        <Button fullWidth onClick={onClose} className="mt-16">
          저장하기
        </Button>
      </div>
    </BottomSheet>
  );
};

export default WordAddTabsForm;
