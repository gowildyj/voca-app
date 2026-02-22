import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play, Pause, EyeOff, Languages } from "lucide-react";
import StudyHeader from "@/components/ui/study/StudyHeader";
import ScenarioControls from "@/components/ui/scenario/ScenarioControls";
import "@/styles/pages/scenarioSession.css";

const ScenarioSession = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const chatEndRef = useRef(null);

  // 1. 상태 관리 (가리기 모드, 재생 상태)
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [hideWord, setHideWord] = useState(false);
  const [hideMeaning, setHideMeaning] = useState(false);

  // 2. 바텀시트(슬롯 선택) 상태
  const [activeSlot, setActiveSlot] = useState(null); // { messageId, slotKey, options }

  // 3. 시나리오 데이터 (더미)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "other",
      text: "Welcome! What would you like to drink?",
      meaning: "어서 오세요! 무엇을 마시겠어요?",
    },
    {
      id: 2,
      role: "me",
      template: "I'll have a hot {menu}, please.",
      meaning: "따뜻한 {menu} 한 잔 주세요.",
      slots: {
        menu: {
          current: "Americano",
          options: ["Americano", "Cafe Latte", "Espresso", "Tea"],
        },
      },
    },
  ]);

  // 슬롯 선택 시 데이터 업데이트
  const handleSelectOption = (option) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === activeSlot.messageId) {
          return {
            ...msg,
            slots: {
              ...msg.slots,
              [activeSlot.slotKey]: {
                ...msg.slots[activeSlot.slotKey],
                current: option,
              },
            },
          };
        }
        return msg;
      }),
    );
    setActiveSlot(null);
  };

  // 템플릿 문장을 현재 선택된 슬롯 단어로 변환
  const renderText = (msg) => {
    if (!msg.template) return msg.text;
    let rendered = msg.template;
    Object.keys(msg.slots).forEach((key) => {
      const currentVal = msg.slots[key].current;
      rendered = rendered.replace(
        `{${key}}`,
        `<span class="word-slot" data-slot="${key}">${currentVal}</span>`,
      );
    });
    return (
      <div
        dangerouslySetInnerHTML={{ __html: rendered }}
        onClick={(e) => {
          if (e.target.classList.contains("word-slot")) {
            const key = e.target.dataset.slot;
            setActiveSlot({
              messageId: msg.id,
              slotKey: key,
              options: msg.slots[key].options,
            });
          }
        }}
      />
    );
  };

  return (
    <div className="scenario-session-page">
      {/* 1. 공통 헤더 */}
      <div className="scenario-header-area">
        <StudyHeader
          current={1}
          total={10}
          onClose={() => navigate(-1)}
          onSettings={() => {}}
        />
      </div>

      {/* 2. 시나리오 전용 컨트롤러 */}
      <div className="scenario-top-controls">
        <ScenarioControls
          onPlayToggle={() => setIsAutoPlay(!isAutoPlay)}
          isAutoPlay={isAutoPlay}
          onHideWord={() => setHideWord(!hideWord)}
          onHideMeaning={() => setHideMeaning(!hideMeaning)}
          hideWord={hideWord}
          hideMeaning={hideMeaning}
        />
      </div>

      {/* 3. 대화창 영역 */}
      <main className="scenario-chat-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble-row ${msg.role}`}>
            <div className="message-bubble">
              <div
                className={`sentence-text ${hideWord ? "hidden-content" : ""}`}
              >
                {renderText(msg)}
              </div>
              {!hideMeaning && (
                <div className="translation-text">
                  {msg.meaning.replace("{menu}", msg.slots?.menu.current || "")}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      {/* 4. 슬롯 선택 바텀시트 */}
      {activeSlot && (
        <div
          className="bottom-sheet-overlay"
          onClick={() => setActiveSlot(null)}
        >
          <div
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                textAlign: "center",
                marginBottom: "16px",
                color: "#6b7280",
              }}
            >
              단어 선택
            </h3>
            {activeSlot.options.map((opt) => (
              <div
                key={opt}
                className="option-item"
                onClick={() => handleSelectOption(opt)}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioSession;
