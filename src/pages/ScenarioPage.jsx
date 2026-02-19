import React, { useState, useRef } from "react";
import { hotelBreakfast } from "@/data/scenarios/hotel_breakfast";
import ChatBubble from "@/components/scenario/ChatBubble";
import { speak } from "@/utils/tts";
import { Play, Square, Eye, EyeOff, Type, ArrowLeft } from "lucide-react";
import "@/styles/pages/scenario.css";

const ScenarioPage = () => {
  const [selections, setSelections] = useState({});
  const [activeSelector, setActiveSelector] = useState(null);
  const [showWord, setShowWord] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const bubbleRefs = useRef({});
  const isPlayingAll = useRef(false);

  // 단어 가리기 토글 (뜻 가리기는 해제)
  const toggleWord = () => {
    if (showWord) {
      // 가리려고 할 때
      setShowWord(false);
      setShowMeaning(true); // 뜻은 무조건 보여줌
    } else {
      // 보이게 할 때
      setShowWord(true);
    }
    setResetKey((prev) => prev + 1);
  };

  // 뜻 가리기 토글 (단어 가리기는 해제)
  const toggleMeaning = () => {
    if (showMeaning) {
      // 가리려고 할 때
      setShowMeaning(false);
      setShowWord(true); // 단어는 무조건 보여줌
    } else {
      // 보이게 할 때
      setShowMeaning(true);
    }
    setResetKey((prev) => prev + 1);
  };

  const handleSelectOption = (varName, option) => {
    setSelections((prev) => ({ ...prev, [varName]: option }));
    setActiveSelector(null);
  };

  const playText = async (text, id, onEnd = () => {}) => {
    // 1. 기존 재생 취소 및 현재 재생 ID 설정
    window.speechSynthesis.cancel();
    setPlayingId(id);

    // 2. 화면 스크롤 이동
    if (bubbleRefs.current[id]) {
      bubbleRefs.current[id].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    // 3. TTS 재생 (객체 대신 숫자 1.0만 전달) 및 완료 대기
    await speak(text, hotelBreakfast.learning_lang, 1.0);

    // 4. 재생이 완료되면 상태 초기화 및 콜백 실행
    setPlayingId(null);
    onEnd();
  };
  // ScenarioPage.jsx 의 handleFullPlay 함수 교체

  const handleFullPlay = async () => {
    // 🌟 수정된 부분: playingId가 있거나 전체 재생 루프가 돌고 있다면 멈춤
    if (playingId || isPlayingAll.current) {
      isPlayingAll.current = false; // 🛑 1. 핵심: 다음 문장으로 넘어가지 못하게 루프 강제 종료 신호!
      window.speechSynthesis.cancel(); // 🛑 2. 현재 읽고 있는 TTS 즉시 중지
      setPlayingId(null); // 🛑 3. UI 상태(테두리, 아이콘 등) 초기화
      return;
    }

    isPlayingAll.current = true;

    for (const step of hotelBreakfast.steps) {
      if (!isPlayingAll.current) break; // 🛑 여기서 신호를 확인하고 루프를 완전히 빠져나감

      const textToSpeak = step.text.replace(
        /{(\w+)}/g,
        (match, key, offset, fullString) => {
          const originStep =
            hotelBreakfast.steps.find(
              (s) => s.text?.includes(`{${key}}`) && s.options,
            ) || step;
          const selected = selections[key] || originStep?.default;
          let word = selected?.word || match;

          const prevText = fullString.slice(0, offset);
          const isFirstInSentence =
            offset === 0 || /(?:^|[.?!])\s*$/.test(prevText);

          if (isFirstInSentence && typeof word === "string") {
            word = word.charAt(0).toUpperCase() + word.slice(1);
          }

          return word;
        },
      );

      await new Promise((resolve) => playText(textToSpeak, step.id, resolve));
    }

    isPlayingAll.current = false;
    setPlayingId(null);
  };

  const isPlaying = playingId !== null;
  const effectiveShowWord = isPlaying ? true : showWord;
  const effectiveShowMeaning = isPlaying ? true : showMeaning;

  return (
    <div className="scenario-page">
      <header className="list-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => window.history.back()}>
            <ArrowLeft size={24} />
            <h1 className="list-header-title">
              {hotelBreakfast.title_learning}
            </h1>
          </button>
        </div>
        <h2 className="list-header-subtitle">{hotelBreakfast.title_base}</h2>
        <div className="top-study-controls">
          <button
            className={`study-tool-btn ${isPlaying ? "playing" : ""}`}
            onClick={handleFullPlay}
          >
            {isPlaying ? (
              <Square size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
            <span>전체 재생</span>
          </button>
          <div className="control-divider" />
          <button
            className={`study-tool-btn ${!showWord ? "active" : ""}`}
            onClick={toggleWord}
            disabled={isPlaying}
          >
            {showWord ? <Eye size={18} /> : <EyeOff size={18} />}
            <span>단어 가리기</span>
          </button>
          <div className="control-divider" />
          <button
            className={`study-tool-btn ${!showMeaning ? "active" : ""}`}
            onClick={toggleMeaning}
            disabled={isPlaying}
          >
            {showMeaning ? <Eye size={18} /> : <EyeOff size={18} />}
            <span>뜻 가리기</span>
          </button>
        </div>
      </header>

      <div className="scenario-container" key={resetKey}>
        {hotelBreakfast.steps.map((step) => (
          <div
            key={`${resetKey}-${step.id}`}
            ref={(el) => (bubbleRefs.current[step.id] = el)}
            className={`bubble-wrapper ${step.role} ${playingId === step.id ? "playing-bubble" : ""}`}
          >
            <ChatBubble
              step={step}
              selections={selections}
              allSteps={hotelBreakfast.steps}
              onOpenSelector={(varName, options) =>
                setActiveSelector({ varName, options })
              }
              onPlayAudio={(text) => playText(text, step.id)}
              showWord={effectiveShowWord}
              showMeaning={effectiveShowMeaning}
            />
          </div>
        ))}
      </div>

      {activeSelector && (
        <div
          className="mini-selector-overlay"
          onClick={() => setActiveSelector(null)}
        >
          <div
            className="mini-selector-content slim-list"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="list-group">
              {activeSelector.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`list-item ${selections[activeSelector.varName]?.word === opt.word ? "active" : ""}`}
                  onClick={() =>
                    handleSelectOption(activeSelector.varName, opt)
                  }
                >
                  <div className="item-info">
                    <span className="item-word">{opt.word}</span>
                    <span className="item-meaning">{opt.meaning}</span>
                  </div>
                  {selections[activeSelector.varName]?.word === opt.word && (
                    <span className="check-mark">✓</span>
                  )}
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
