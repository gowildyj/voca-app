import React, { useState } from "react";
import { hotelBreakfast } from "@/data/scenarios/hotel_breakfast";
import ChatBubble from "@/components/scenario/ChatBubble";
import "@/styles/components/scenario/scenario.css";

const ScenarioPage = () => {
  // 1. 상태 관리 (이제 모든 단계를 한 번에 보여주므로 currentStepIndex는 필요 없음)
  const [selections, setSelections] = useState({});
  const [activeSelector, setActiveSelector] = useState(null); // { stepId, varName, options }

  // 2. 단어 선택 처리
  const handleSelectOption = (varName, option) => {
    setSelections((prev) => ({
      ...prev,
      [varName]: option,
    }));
    setActiveSelector(null); // 선택 후 셀렉터 닫기
  };

  const handlePlayAudio = (text) => {
    // 1. 기존에 읽고 있던 게 있으면 멈춤
    window.speechSynthesis.cancel();

    // 2. 읽을 내용 생성
    const utterance = new SpeechSynthesisUtterance(text);

    // 3. 언어 설정 (학습 언어에 맞춰서)
    utterance.lang = "en-US"; // 나중에 데이터의 learning_lang에 맞게 변경 가능
    utterance.rate = 1.0; // 재생 속도

    // 4. 재생
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="scenario-page">
      <header className="list-header">
        <div className="header-content">
          <h1 className="list-header-title">{hotelBreakfast.title_learning}</h1>
          <p className="list-header-sub">{hotelBreakfast.title_base}</p>
        </div>
      </header>

      <div className="scenario-container">
        {hotelBreakfast.steps.map((step) => (
          <ChatBubble
            key={step.id}
            step={step}
            selections={selections}
            allSteps={hotelBreakfast.steps} // 👈 전체 단계 정보를 전달
            onOpenSelector={(varName, options) => {
              setActiveSelector({ varName, options });
            }}
            onPlayAudio={handlePlayAudio}
          />
        ))}
      </div>

      {/* 미니 플로팅 셀렉터 (화면 하단에 작고 가볍게 표시) */}
      {activeSelector && (
        <div
          className="mini-selector-overlay"
          onClick={() => setActiveSelector(null)}
        >
          <div
            className="mini-selector-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mini-selector-header">대체 단어 선택</div>
            <div className="chip-group">
              {activeSelector.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`chip ${selections[activeSelector.varName]?.word === option.word ? "active" : ""}`}
                  onClick={() =>
                    handleSelectOption(activeSelector.varName, option)
                  }
                >
                  <span className="chip-word">{option.word}</span>
                  <span className="chip-meaning">{option.meaning}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioPage;
