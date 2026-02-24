import React, { useState, useEffect, useRef } from "react";
import BottomSheet from "@/components/modals/BottomSheet";
import { StyledInput, StyledTextArea } from "@/components/common/FormElements";
import Button from "@/components/common/Button";

// 🌟 Props 이름을 'onSubmit'으로 통일하여 부모 핸들러와 맞춥니다.
const WordEditBulkForm = ({ isOpen, onClose, words = [], onSubmit }) => {
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'text'
  const [editList, setEditList] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const inputRef = useRef(null);

  // 1. 모달이 열릴 때 원본 데이터 복사
  useEffect(() => {
    if (isOpen) {
      setEditList([...words]);
      // 텍스트 모드용 문자열 생성 (단어:뜻)
      const text = words.map((w) => `${w.word}:${w.meaning}`).join("\n");
      setBulkText(text);
    }
  }, [isOpen, words]);

  // 2. 탭 전환 시 포커스 처리
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab]);

  // 리스트 모드 인풋 핸들러
  const handleListChange = (index, field, value) => {
    const newList = [...editList];
    newList[index] = { ...newList[index], [field]: value };
    setEditList(newList);
  };

  // 🌟 핵심 저장 로직
  const handleSave = () => {
    if (activeTab === "list") {
      onSubmit?.(editList);
    } else {
      const updatedWords = bulkText
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line, index) => {
          const parts = line.split(/[:|,|\t]/);
          const word = parts[0]?.trim() || "";
          const meaning = parts[1]?.trim() || "";

          // 🌟 중요: 기존 단어의 ID를 순서대로 매칭하여 업데이트가 가능하게 함
          // (만약 새로 추가된 줄이라면 ID 없이 전송되어 신규 생성됨)
          return {
            id: words[index]?.id,
            deck_id: words[index]?.deck_id,
            word,
            meaning,
          };
        });
      onSubmit?.(updatedWords);
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
        <div className="modal-tabs" style={tabContainerStyle}>
          <button
            style={activeTab === "list" ? activeTabStyle : inactiveTabStyle}
            onClick={() => setActiveTab("list")}
          >
            목록 수정
          </button>
          <button
            style={activeTab === "text" ? activeTabStyle : inactiveTabStyle}
            onClick={() => setActiveTab("text")}
          >
            텍스트 수정
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div style={{ maxHeight: "55vh", overflowY: "auto", padding: "4px" }}>
          {activeTab === "list" ? (
            <div
              className="tab-content list-edit"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {editList.length > 0 ? (
                editList.map((item, index) => (
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
                ))
              ) : (
                <p
                  style={{
                    textAlign: "center",
                    color: "#999",
                    padding: "20px",
                  }}
                >
                  수정할 단어가 없습니다.
                </p>
              )}
            </div>
          ) : (
            <div className="tab-content text-edit">
              <StyledTextArea
                ref={inputRef}
                label="전체 수정 (단어:뜻)"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Apple:사과&#10;Banana:바나나"
                style={{ minHeight: "250px", lineHeight: "1.6" }}
              />
            </div>
          )}
        </div>

        <Button fullWidth onClick={handleSave} className="mt-24">
          수정사항 저장하기
        </Button>
      </div>
    </BottomSheet>
  );
};

// 인라인 스타일 정의 (CSS 파일로 빼시는 걸 추천)
const tabContainerStyle = {
  display: "flex",
  backgroundColor: "rgba(0,0,0,0.05)",
  padding: "4px",
  borderRadius: "12px",
  marginBottom: "20px",
};

const activeTabStyle = {
  flex: 1,
  padding: "10px",
  border: "none",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
  backgroundColor: "#fff",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  color: "var(--primary)",
};

const inactiveTabStyle = {
  flex: 1,
  padding: "10px",
  border: "none",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
  backgroundColor: "transparent",
  color: "#666",
};

export default WordEditBulkForm;
