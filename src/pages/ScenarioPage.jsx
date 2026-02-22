import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Languages, Play, Square } from "lucide-react";
import { hotelBreakfast } from "@/data/scenarios/hotel_breakfast";
import { speak } from "@/utils/ttsUtils";

import StudyHeader from "@/components/ui/study/StudyHeader";
import ScenarioHeader from "@/components/ui/scenario/ScenarioHeader";
import ChatBubble from "@/components/cards/ChatBubble";
import SelectorModal from "@/components/modals/SelectorModal";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import ScenarioSettingModal from "@/components/modals/ScenarioSettingModal";
import "@/styles/pages/scenarioPage.css";

const ScenarioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const isPlayingAll = useRef(false);

  // --- 상태 관리 ---
  const [selections, setSelections] = useState({});
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorConfig, setSelectorConfig] = useState({
    name: "",
    options: [],
  });

  const [hideMode, setHideMode] = useState(null); // 'word' | 'meaning' | null
  const [playingId, setPlayingId] = useState(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sessionSettings, setSessionSettings] = useState({
    gender: "female",
    speed: "1.0",
    autoNext: true,
  });

  // --- 가리기 모드 토글 (하나씩만 활성화) ---
  const handleToggleMode = (mode) => {
    setHideMode((prev) => (prev === mode ? null : mode));
  };

  // --- TTS 핸들러 ---
  const handlePlayAudio = async (text, id, onEnd = () => {}) => {
    window.speechSynthesis.cancel();
    setPlayingId(id);
    await speak(text, hotelBreakfast.learning_lang, 1.0);
    setPlayingId(null);
    onEnd();
  };

  const handleFullPlay = async () => {
    if (playingId || isPlayingAll.current) {
      isPlayingAll.current = false;
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }

    isPlayingAll.current = true;
    for (const step of hotelBreakfast.steps) {
      if (!isPlayingAll.current) break;

      // 슬롯 치환: 선택값 없으면 default 사용 (끊김 방지)
      const textToSpeak = step.text.replace(/{(\w+)}/g, (match, key) => {
        return selections[key]?.word || step.default?.word || match;
      });

      await new Promise((resolve) =>
        handlePlayAudio(textToSpeak, step.id, resolve),
      );
    }
    isPlayingAll.current = false;
  };

  return (
    <div className="v-scenario-page">
      {/* 1. 고정 헤더: 가운데 시나리오 제목 배치 */}
      <div className="v-fixed-header">
        <ScenarioHeader
          title={hotelBreakfast.title_learning}
          current={0}
          total={0}
          onClose={() => navigate(-1)}
          onSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* 2. 우측 플로팅 도구 그룹 */}
      <div className="v-scenario-tool-group">
        <Button
          variant="tool"
          icon={
            isPlayingAll.current ? (
              <Square size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )
          }
          onClick={handleFullPlay}
          className={isPlayingAll.current ? "active" : ""}
          aria-label="전체 재생"
        />
        <Button
          variant="tool"
          icon={<Eye size={20} />}
          onClick={() => handleToggleMode("word")}
          className={hideMode === "word" ? "active" : ""}
          aria-label="단어 가리기"
        />
        <Button
          variant="tool"
          icon={<Languages size={20} />}
          onClick={() => handleToggleMode("meaning")}
          className={hideMode === "meaning" ? "active" : ""}
          aria-label="뜻 가리기"
        />
      </div>

      <main className="v-chat-container" ref={scrollRef}>
        {/* 3. 상황 설명 섹션 */}

        <div className="v-scenario-guide-container">
          <div className="v-guide-badge">SCENARIO</div>
          <div className="v-guide-content">
            <h2 className="v-guide-title">{hotelBreakfast.title_base}</h2>
            <p className="v-guide-desc">
              호텔 식당에서 조식을 먹기 위해 직원과 대화하는 상황입니다. 원하는
              옵션을 선택하고 문장을 완성해 보세요!
            </p>
          </div>
        </div>

        {/* 4. 대화 리스트 (왼쪽/오른쪽 정렬) */}
        <div className="v-chat-list">
          {hotelBreakfast.steps.map((step) => (
            <ChatBubble
              key={step.id}
              step={step}
              selections={selections}
              onOpenSelector={(name, opts) => {
                setSelectorConfig({ name, options: opts });
                setIsSelectorOpen(true);
              }}
              onPlayAudio={(text) => handlePlayAudio(text, step.id)}
              // 현재 재생 중일 때는 가리기 해제
              hideMode={playingId === step.id ? null : hideMode}
              isPlaying={playingId === step.id}
            />
          ))}
        </div>
      </main>

      {/* 5. 선택 모달 */}
      <SelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        options={selectorConfig.options}
        selectedValue={selections[selectorConfig.name]}
        onSelect={(opt) => {
          setSelections((prev) => ({ ...prev, [selectorConfig.name]: opt }));
          setIsSelectorOpen(false);
        }}
      />

      <ScenarioSettingModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialData={sessionSettings}
        onSave={(newSettings) => {
          setSessionSettings(newSettings);
          setIsSettingsOpen(false);
        }}
      />
    </div>
  );
};

export default ScenarioPage;
