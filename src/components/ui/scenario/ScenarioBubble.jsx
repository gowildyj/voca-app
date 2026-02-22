import React, { useState } from "react";

const ScenarioBubble = ({
  step,
  selections,
  allSteps,
  onOpenSelector,
  onPlayAudio,
  showWord,
  showMeaning,
  isPlaying, // 현재 이 버블이 재생 중인지 여부
}) => {
  const [localShowWord, setLocalShowWord] = useState(false);
  const [localShowMeaning, setLocalShowMeaning] = useState(false);

  // 텍스트 파싱 로직 (문장 첫 글자 대문자 처리 포함)
  const renderText = (template, isTranslation) => {
    return template.split(/({[\w]+})/g).map((part, i, arr) => {
      const match = part.match(/{(\w+)}/);
      if (match) {
        const varName = match[1];
        const originStep =
          allSteps.find((s) => s.text?.includes(`{${varName}}`) && s.options) ||
          step;
        const selected = selections[varName] || originStep?.default;
        let display = isTranslation ? selected?.meaning : selected?.word;

        // 영어 대문자 처리
        if (!isTranslation && typeof display === "string") {
          const isFirst = i === 0 || /(?:^|[.?!])\s*$/.test(arr[i - 1]);
          if (isFirst)
            display = display.charAt(0).toUpperCase() + display.slice(1);
        }

        return (
          <span
            key={i}
            className="inline-slot"
            onClick={(e) => {
              e.stopPropagation();
              if (
                (isTranslation
                  ? showMeaning || localShowMeaning
                  : showWord || localShowWord) &&
                originStep.options
              ) {
                onOpenSelector(varName, originStep.options);
              }
            }}
          >
            {display}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div
      className={`chat-row ${step.role} ${isPlaying ? "playing-bubble" : ""}`}
    >
      <div className="bubble">
        <div
          className={`main-text ${!showWord && !localShowWord ? "masked" : ""}`}
          onClick={(e) => {
            if (!showWord && !localShowWord) {
              e.stopPropagation();
              setLocalShowWord(true);
            } else onPlayAudio();
          }}
        >
          {renderText(step.text, false)}
        </div>
        <div
          className={`translation-text ${!showMeaning && !localShowMeaning ? "masked" : ""}`}
          onClick={(e) => {
            if (!showMeaning && !localShowMeaning) {
              e.stopPropagation();
              setLocalShowMeaning(true);
            } else onPlayAudio();
          }}
        >
          {renderText(step.translation, true)}
        </div>
      </div>
    </div>
  );
};

export default ScenarioBubble;
