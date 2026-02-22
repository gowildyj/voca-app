import React, { useState } from "react";

const ChatBubble = ({
  step,
  selections,
  allSteps,
  onOpenSelector,
  onPlayAudio,
  showWord,
  showMeaning,
}) => {
  const [localShowWord, setLocalShowWord] = useState(false);
  const [localShowMeaning, setLocalShowMeaning] = useState(false);

  // 1️⃣ 화면 렌더링용 (UI)
  const renderInteractiveText = (template, isTranslation) => {
    if (!template) return "";

    // arr 매개변수를 추가하여 이전 텍스트(문맥)를 확인할 수 있게 함
    return template.split(/({[\w]+})/g).map((part, i, arr) => {
      const match = part.match(/{(\w+)}/);
      if (match) {
        const varName = match[1];
        const originStep =
          allSteps.find((s) => s.text?.includes(`{${varName}}`) && s.options) ||
          step;
        const selected = selections[varName] || originStep?.default;

        let displayText = isTranslation ? selected?.meaning : selected?.word;

        // 🌟 핵심: 영어이고, 문장의 맨 앞이거나 마침표/물음표/느낌표 뒤면 대문자로 변환
        if (!isTranslation && typeof displayText === "string") {
          // i === 0 이거나, 앞선 문자열(arr[i-1])이 문장의 끝을 알리는 기호로 끝나는 경우
          const isFirstInSentence =
            i === 0 || /(?:^|[.?!])\s*$/.test(arr[i - 1]);
          if (isFirstInSentence) {
            displayText =
              displayText.charAt(0).toUpperCase() + displayText.slice(1);
          }
        }

        return (
          <span
            key={i}
            className="inline-slot"
            onClick={(e) => {
              e.stopPropagation();
              const isParentHidden = isTranslation
                ? !showMeaning && !localShowMeaning
                : !showWord && !localShowWord;
              if (!isParentHidden && originStep.options)
                onOpenSelector(varName, originStep.options);
            }}
          >
            {displayText}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // 2️⃣ TTS 재생용
  const getSpokenText = (template) => {
    if (!template) return "";
    return template.replace(
      /{(\w+)}/g,
      (match, varName, offset, fullString) => {
        const originStep =
          allSteps.find((s) => s.text?.includes(`{${varName}}`) && s.options) ||
          step;
        const selected = selections[varName] || originStep?.default;
        let word = selected?.word || match;

        // 🌟 핵심: 현재 치환되는 단어 앞의 텍스트(prevText)를 검사
        const prevText = fullString.slice(0, offset);
        const isFirstInSentence =
          offset === 0 || /(?:^|[.?!])\s*$/.test(prevText);

        if (isFirstInSentence && typeof word === "string") {
          word = word.charAt(0).toUpperCase() + word.slice(1);
        }

        return word;
      },
    );
  };

  return (
    <div className={`chat-row ${step.role}`}>
      <div className="bubble">
        {/* 영어 영역 */}
        <div
          className={`main-text ${!showWord && !localShowWord ? "masked" : ""}`}
          onClick={(e) => {
            if (!showWord && !localShowWord) {
              e.stopPropagation();
              setLocalShowWord(true);
            } else {
              onPlayAudio(getSpokenText(step.text));
            }
          }}
        >
          {renderInteractiveText(step.text, false)}
        </div>

        {/* 한글 영역 */}
        <div
          className={`translation-text ${!showMeaning && !localShowMeaning ? "masked" : ""}`}
          onClick={(e) => {
            if (!showMeaning && !localShowMeaning) {
              e.stopPropagation();
              setLocalShowMeaning(true);
            } else {
              onPlayAudio(getSpokenText(step.text));
            }
          }}
        >
          {renderInteractiveText(step.translation, true)}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
