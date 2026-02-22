import React, { useState, useEffect, useRef } from "react";
import BottomSheet from "@/components/modals/BottomSheet";
import { StyledInput, StyledTextArea } from "@/components/common/StyledInput";
import Button from "@/components/common/Button";

const WordEditBulkForm = ({ isOpen, onClose, words = [], onSave }) => {
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'text'
  const [editList, setEditList] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const inputRef = useRef(null);

  // 1. 모달이 "처음 열릴 때만" 데이터를 세팅하도록 분리 (isOpen이 true로 변할 때만)
  useEffect(() => {
    if (isOpen) {
      // 목록용 데이터 복사
      setEditList([...words]);
      // 텍스트용 데이터 변환
      const text = words.map((w) => `${w.word}:${w.meaning}`).join("\n");
      setBulkText(text);
    }
  }, [isOpen]); // 🌟 words나 activeTab을 빼서 무한 루프 방지

  // 2. 탭이 바뀌거나 열릴 때 포커스만 처리
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab]);

  const handleListChange = (index, field, value) => {
    const newList = [...editList];
    newList[index] = { ...newList[index], [field]: value };
    setEditList(newList);
  };

  const handleSave = () => {
    if (activeTab === "list") {
      onSave?.(editList);
    } else {
      const updatedWords = bulkText
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          // 구분자 허용: 콜론, 쉼표, 탭
          const parts = line.split(/[:|,|\t]/);
          const word = parts[0]?.trim() || "";
          const meaning = parts[1]?.trim() || "";
          return { word, meaning };
        });
      onSave?.(updatedWords);
    }
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="단어 일괄 수정">
      <div
        className="word-edit-tabs-container"
        style={{ paddingBottom: "20px" }}
      >
        {/* 탭 스위치 */}
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
              backgroundColor: activeTab === "list" ? "#fff" : "transparent",
              boxShadow:
                activeTab === "list" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              color: activeTab === "list" ? "var(--primary)" : "#666",
            }}
            onClick={() => setActiveTab("list")}
          >
            목록 수정
          </button>
          <button
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: activeTab === "text" ? "#fff" : "transparent",
              boxShadow:
                activeTab === "text" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              color: activeTab === "text" ? "var(--primary)" : "#666",
            }}
            onClick={() => setActiveTab("text")}
          >
            텍스트 수정
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "4px" }}>
          {activeTab === "list" ? (
            <div
              className="tab-content list-edit"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {editList.map((item, index) => (
                <div
                  key={item.id || index}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-end",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <StyledInput
                      label={index === 0 ? "단어" : ""}
                      value={item.word}
                      onChange={(e) =>
                        handleListChange(index, "word", e.target.value)
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <StyledInput
                      label={index === 0 ? "뜻" : ""}
                      value={item.meaning}
                      onChange={(e) =>
                        handleListChange(index, "meaning", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tab-content text-edit">
              <StyledTextArea
                ref={inputRef}
                label="전체 수정 (단어:뜻)"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                style={{ minHeight: "250px" }}
              />
            </div>
          )}
        </div>

        <Button fullWidth onClick={handleSave} className="mt-16">
          수정사항 저장하기
        </Button>
      </div>
    </BottomSheet>
  );
};

export default WordEditBulkForm;
