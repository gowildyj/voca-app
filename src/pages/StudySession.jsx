import React, { useState, useRef } from "react"; // useRef 추가
import { useNavigate, useParams } from "react-router-dom";
import "@/styles/pages/studySession.css";

import StudyHeader from "@/components/ui/study/StudyHeader";
import StudyControls from "@/components/ui/study/StudyControls";
import ActionButtons from "@/components/ui/study/ActionButtons";
import StudyCard from "@/components/ui/study/StudyCard";
import StudySettingModal from "@/components/modals/StudySettingModal";

const StudySession = () => {
  const navigate = useNavigate();
  const { deckId } = useParams();

  // ★ 카드 컴포넌트를 제어하기 위한 Ref 생성
  const cardRef = useRef();

  const [current, setCurrent] = useState(1);
  const total = 20;
  const [counts, setCounts] = useState({ know: 5, unknown: 2 });
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studySettings, setStudySettings] = useState({
    isAutoPlay: false,
    viewMode: "frontFirst",
  });

  // 실제 데이터 갱신 로직 (카드 애니메이션 끝난 후 실행됨)
  const handleNextCard = (type) => {
    // 0.2초 정도 기다렸다가 데이터 변경 (카드가 날아가는 동안 유지)
    setTimeout(() => {
      if (type === "know") {
        setCounts((prev) => ({ ...prev, know: prev.know + 1 }));
      } else {
        setCounts((prev) => ({ ...prev, unknown: prev.unknown + 1 }));
      }
      setCurrent((c) => Math.min(c + 1, total));
    }, 200);
  };

  // 버튼 클릭 핸들러 (Ref를 통해 카드 애니메이션 실행)
  const handleKnow = () => {
    if (cardRef.current) cardRef.current.swipeRight(); // 오른쪽 스와이프 발동
  };

  const handleUnknown = () => {
    if (cardRef.current) cardRef.current.swipeLeft(); // 왼쪽 스와이프 발동
  };

  const handleSwipe = (direction) => {
    // 스와이프 완료 후 데이터 처리
    if (direction === "right") handleNextCard("know");
    else handleNextCard("unknown");
  };

  const DUMMY_DATA = [
    {
      id: 1,
      word: "Serendipity",
      pronunciation: "sè-rən-dí-pə-ti",
      meaning: "뜻밖의 행운",
      partOfSpeech: "Noun",
      exampleEn: "It was pure serendipity.",
      exampleKo: "그것은 순전히 뜻밖의 행운이었다.",
      emoji: "🍀",
    },
    {
      id: 2,
      word: "Ephemeral",
      pronunciation: "ə-fé-mə-rəl",
      meaning: "덧없는",
      partOfSpeech: "Adjective",
      exampleEn: "Fashion is ephemeral.",
      exampleKo: "유행은 덧없다.",
      emoji: "🍃",
    },
  ];

  return (
    <div className="study-session-page">
      <div className="study-header-area">
        <StudyHeader
          current={current}
          total={total}
          onClose={() => navigate(-1)}
          onSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      <div className="study-top-controls">
        <StudyControls
          onUndo={() => setCurrent((c) => Math.max(1, c - 1))}
          isAutoPlay={studySettings.isAutoPlay}
          toggleAutoPlay={() =>
            setStudySettings((prev) => ({
              ...prev,
              isAutoPlay: !prev.isAutoPlay,
            }))
          }
        />
      </div>

      <div className="study-card-area">
        {/* Ref 전달 필수! */}
        <StudyCard
          ref={cardRef}
          key={current}
          cardData={DUMMY_DATA[current - 1] || null}
          onSwipe={handleSwipe}
          viewMode={studySettings.viewMode}
        />
      </div>

      <div className="study-bottom-actions">
        <ActionButtons
          onKnow={handleKnow}
          onUnknown={handleUnknown}
          counts={counts}
        />
      </div>
      <StudySettingModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(settings) => {
          setStudySettings(settings);
          setIsSettingsOpen(false);
        }}
        initialData={studySettings}
      />
    </div>
  );
};

export default StudySession;
