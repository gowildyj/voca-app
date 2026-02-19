// src/components/scenario/ChatBubble.jsx 수정
import React from "react";
import { formatStepText } from "@/utils/scenarioUtils";

const ChatBubble = ({
  step,
  selections,
  allSteps,
  onOpenSelector,
  onPlayAudio,
}) => {
  const renderInteractiveText = (template, isTranslation) => {
    if (!template) return "";
    const parts = template.split(/({[\w]+})/g);

    return parts.map((part, i) => {
      const match = part.match(/{(\w+)}/);
      if (match) {
        const varName = match[1];

        // [중요] 현재 스텝에 정보가 없다면, 전체 스텝 중 해당 변수를 정의한 스텝을 찾음
        const originStep =
          allSteps.find((s) => s.text?.includes(`{${varName}}`) && s.options) ||
          step;

        const selected = selections[varName] || originStep.default;
        const displayText = isTranslation ? selected?.meaning : selected?.word;

        return (
          <span
            key={`${i}-${displayText}`} // 단어 바뀌면 반짝이게
            className="inline-slot"
            onClick={(e) => {
              e.stopPropagation();
              // 옵션이 있는 원본 스텝의 정보를 넘겨줌
              if (originStep.options)
                onOpenSelector(varName, originStep.options);
            }}
          >
            {displayText || "____"}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={`chat-row ${step.role}`}>
      <div className="bubble" onClick={() => onPlayAudio(step.text)}>
        <div className="main-text">
          {renderInteractiveText(step.text, false)}
        </div>
        <div className="translation-text">
          {renderInteractiveText(step.translation, true)}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
