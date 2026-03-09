import React, { useState, useEffect, useRef } from "react";
import BottomSheet from "@/components/modals/BottomSheet";
import { StyledInput, StyledTextArea } from "@/components/common/FormElements";
import Button from "@/components/common/Button";

const WordEditBulkForm = ({
  isOpen,
  onClose,
  deckId,
  words = [],
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState("list");
  const [editList, setEditList] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const inputRef = useRef(null);

  // Store에서 가져온 words는 'deckId'를 가지고 있습니다.
  const currentDeckId =
    deckId || (words.length > 0 ? words[0].deck_id || words[0].deckId : null);

  useEffect(() => {
    if (isOpen) {
      setEditList([...words]);

      const text = words
        .map((w) => {
          const ex = w.example || "";
          return `${w.word} | ${w.meaning} | ${ex}`;
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
    let finalPayload = [];

    if (activeTab === "list") {
      finalPayload = editList.map((item) => ({
        ...item,
        deck_id: deckId || item.deck_id || item.deckId || currentDeckId,
      }));
    } else {
      // 🌟 텍스트 수정: 줄 번호(index)를 기준으로 원본 ID를 다시 붙여줍니다.
      finalPayload = bulkText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "")
        .map((line, index) => {
          const parts = line.split("|").map((p) => p.trim());

          // 🌟 화면엔 없지만, 우리가 가진 words[index]에 ID가 살아있어요!
          const original = words[index];

          return {
            id: original?.id, // 원본 ID 복구
            deck_id:
              deckId || original?.deck_id || original?.deckId || currentDeckId,
            word: parts[0] || "",
            meaning: parts[1] || "",
            example: parts[2] || null,
            display_order:
              original?.displayOrder ?? original?.display_order ?? index,
            status: original?.status || "none",
          };
        });
    }

    // ID가 유실된 유령 데이터 방지
    const cleanData = finalPayload.filter((w) => w.id && w.deck_id);

    onSubmit?.(cleanData);
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
