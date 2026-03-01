import React, { useState, useEffect, useRef } from "react";
import BottomSheet from "@/components/modals/BottomSheet";
import { StyledInput, StyledTextArea } from "@/components/common/FormElements";
import Button from "@/components/common/Button";

const WordEditBulkForm = ({ isOpen, onClose, words = [], onSubmit }) => {
  const [activeTab, setActiveTab] = useState("list");
  const [editList, setEditList] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const inputRef = useRef(null);

  // 🌟 [핵심 수정 1] deckId(Store용)와 deck_id(DB용) 둘 다 확인!
  // Store에서 가져온 words는 'deckId'를 가지고 있습니다.
  const currentDeckId =
    words.length > 0 ? words[0].deck_id || words[0].deckId : null;

  useEffect(() => {
    if (isOpen) {
      setEditList([...words]);

      const text = words
        .map((w) => {
          const examplePart = w.example ? `:${w.example}` : "";
          return `${w.word}:${w.meaning}${examplePart}`;
        })
        .join("\n");
      setBulkText(text);
    }
  }, [isOpen, words]);

  // 포커스 로직 (기존 동일)
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
      // 🌟 [핵심 수정 2] 목록 수정 시에도 deckId 체크
      const safeEditList = editList.map((item) => ({
        ...item,
        // item에도 deckId가 있을 수 있고 deck_id가 있을 수 있음
        deck_id: item.deck_id || item.deckId || currentDeckId,
      }));
      onSubmit?.(safeEditList);
    } else {
      const updatedWords = bulkText
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line, index) => {
          let separator = ":";
          if (line.includes("|")) separator = "|";

          const parts = line.split(separator);
          const word = parts[0]?.trim() || "";
          const meaning = parts[1]?.trim() || "";
          const example = parts.slice(2).join(separator).trim();

          const originalWord = words[index];

          return {
            id: originalWord?.id,

            // 🌟 [핵심 수정 3] 텍스트 수정 시에도 deckId 체크
            deck_id:
              originalWord?.deck_id || originalWord?.deckId || currentDeckId,

            word,
            meaning,
            example,
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
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: activeTab === "list" ? "#fff" : "transparent",
              color: activeTab === "list" ? "var(--primary)" : "#666",
              boxShadow:
                activeTab === "list" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
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
              color: activeTab === "text" ? "var(--primary)" : "#666",
              boxShadow:
                activeTab === "text" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
            }}
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
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {editList.map((item, index) => (
                <div
                  key={item.id || index}
                  style={{
                    borderBottom: "1px solid #eee",
                    paddingBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "8px",
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
                  <StyledInput
                    placeholder="예문 (선택)"
                    value={item.example || ""}
                    onChange={(e) =>
                      handleListChange(index, "example", e.target.value)
                    }
                    style={{ fontSize: "0.9rem", backgroundColor: "#f9f9f9" }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="tab-content text-edit">
              <StyledTextArea
                ref={inputRef}
                label="전체 수정 (단어:뜻:예문)"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Apple:사과:I like apples\nBanana:바나나`}
                style={{
                  minHeight: "250px",
                  lineHeight: "1.6",
                  fontFamily: "monospace",
                }}
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

export default WordEditBulkForm;
