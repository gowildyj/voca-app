import React, { useState, useEffect, useRef } from "react";
import BottomSheet from "@/components/modals/BottomSheet";
import { StyledInput, StyledTextArea } from "@/components/common/FormElements";
import Button from "@/components/common/Button";

const WordAddTabsForm = ({ isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState("single");
  const inputRef = useRef(null);

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

    // [Case 1] 하나씩 추가
    if (activeTab === "single") {
      const word = formData.get("word");
      const meaning = formData.get("meaning");
      const example = formData.get("example");

      if (!word || !meaning) {
        alert("단어와 뜻을 모두 입력해주세요!");
        return;
      }
      onSubmit && onSubmit({ word, meaning, example });
    }
    // [Case 2] 여러 개 추가 (로직 수정됨)
    else {
      const text = formData.get("bulkText");
      if (!text || !text.trim()) {
        alert("추가할 단어 목록을 입력해주세요!");
        return;
      }

      const lines = text.split("\n").filter((line) => line.trim());

      const wordsList = lines
        .map((line) => {
          // 1. 구분자 찾기
          let separator = "|";
          if (line.includes("|")) separator = "|";
          else if (line.includes(":")) separator = ":";

          const parts = line.split(separator);

          const word = parts[0]?.trim() || "";
          const meaning = parts[1]?.trim() || "";
          const example = parts.slice(2).join(separator).trim();

          return { word, meaning, example };
        })
        .filter((item) => item.word);

      if (wordsList.length === 0) {
        alert("유효한 단어가 없습니다.");
        return;
      }
      onSubmit && onSubmit(wordsList);
    }

    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="단어 추가하기">
      <form
        onSubmit={handleSubmit}
        className="word-add-tabs-container"
        style={{ paddingBottom: "20px" }}
      >
        {/* 탭 버튼 */}
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
            type="button"
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

        {activeTab === "single" ? (
          <div className="tab-content single-add">
            <StyledInput
              ref={inputRef}
              name="word"
              label="단어"
              placeholder="Apple"
            />
            <StyledInput name="meaning" label="뜻" placeholder="사과" />
            <StyledInput
              name="example"
              label="예문 (선택)"
              placeholder="I like apples."
            />
          </div>
        ) : (
          <div className="tab-content bulk-add">
            <p
              style={{
                fontSize: "0.85rem",
                color: "#666",
                marginBottom: "12px",
                lineHeight: "1.5",
              }}
            >
              <strong>단어, 뜻, 예문</strong>을 수직선( | )이나 콜론( : )으로
              구분하세요.
              <br />
              예문 내의 쉼표와 띄어쓰기는 그대로 유지됩니다.
            </p>
            <StyledTextArea
              ref={inputRef}
              name="bulkText"
              label="추가할 단어 목록"
              placeholder={`Apple | 사과 | I like apples, and bananas.\nRun | 달리다 | I can run fast.`}
              style={{
                minHeight: "180px",
                fontFamily: "monospace",
                fontSize: "14px",
              }}
            />
          </div>
        )}

        <Button type="submit" fullWidth className="mt-16">
          저장하기
        </Button>
      </form>
    </BottomSheet>
  );
};

export default WordAddTabsForm;
