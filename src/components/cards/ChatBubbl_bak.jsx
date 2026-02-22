import React, { useState } from "react";
import "@/styles/components/cards/chatBubble.css";

const ChatBubble = ({
  step,
  selections = {},
  allSteps = [],
  onOpenSelector,
  onPlayAudio,
  showWord = true,
  showMeaning = true,
}) => {
  const [localShowWord, setLocalShowWord] = useState(false);
  const [localShowMeaning, setLocalShowMeaning] = useState(false);

  // 1. 텍스트 내 슬롯 변환 및 대문자 처리
  const renderInteractiveText = (template, isTranslation) => {
    if (!template) return "";

    return template.split(/({[\w]+})/g).map((part, i, arr) => {
      const match = part.match(/{(\w+)}/);
      if (match) {
        const varName = match[1];
        const originStep =
          allSteps.find((s) => s.text?.includes(`{${varName}}`) && s.options) ||
          step;
        const selected = selections[varName] || originStep?.default;

        let displayText = isTranslation ? selected?.meaning : selected?.word;

        // 영어 대문자 로직 (문장의 시작일 때)
        if (!isTranslation && typeof displayText === "string") {
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
            className="v-inline-slot"
            onClick={(e) => {
              e.stopPropagation();
              const isHidden = isTranslation
                ? !showMeaning && !localShowMeaning
                : !showWord && !localShowWord;
              if (!isHidden && originStep.options)
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

  // 2. TTS용 텍스트 생성
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

        const prevText = fullString.slice(0, offset);
        const isFirstInSentence =
          offset === 0 || /(?:^|[.?!])\s*$/.test(prevText);
        if (isFirstInSentence && typeof word === "string")
          word = word.charAt(0).toUpperCase() + word.slice(1);

        return word;
      },
    );
  };

  const isMe = step.role === "me";

  return (
    <div className={`v-chat-row ${step.role}`}>
      <div
        className={`v-message-bubble ${isMe ? "me" : "other"} clickable-bounce`}
      >
        {/* 영어 영역 */}
        <div
          className="v-bubble-main"
          onClick={(e) => {
            if (!showWord && !localShowWord) {
              e.stopPropagation();
              setLocalShowWord(true);
            } else {
              onPlayAudio && onPlayAudio(getSpokenText(step.text));
            }
          }}
        >
          {/* 가려야 할 때만 v-mask-box로 감싸기 */}
          {!showWord && !localShowWord ? (
            <span className="v-mask-box">hidden word</span>
          ) : (
            renderInteractiveText(step.text, false)
          )}
        </div>

        {/* 한글 영역 */}
        <div
          className="v-bubble-sub"
          onClick={(e) => {
            if (!showMeaning && !localShowMeaning) {
              e.stopPropagation();
              setLocalShowMeaning(true);
            } else {
              onPlayAudio && onPlayAudio(getSpokenText(step.text));
            }
          }}
        >
          {!showMeaning && !localShowMeaning ? (
            <span className="v-mask-box">hidden meaning</span>
          ) : (
            renderInteractiveText(step.translation, true)
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
