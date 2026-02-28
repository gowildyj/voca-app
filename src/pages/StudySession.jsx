import React from "react";
import "@/styles/pages/studySession.css";

import StudyHeader from "@/components/ui/study/StudyHeader";
import StudyControls from "@/components/ui/study/StudyControls";
import ActionButtons from "@/components/ui/study/ActionButtons";
import StudyCard from "@/components/ui/study/StudyCard";
import StudySettingModal from "@/components/modals/StudySettingModal";
import StudyResult from "@/pages/StudyResult";

import { useStudyPage } from "@/hooks/pages/useStudyPage";

const StudySession = ({ deckId, initialWords, initialDeck, onClose }) => {
  const {
    words,
    currentCard,
    currentDeck,
    total,
    currentIndex,
    counts,
    cardRef,
    isSettingsOpen,
    setIsSettingsOpen,
    studySettings,
    setStudySettings,
    handleNextCard,
    triggerSwipe,
    isFinished,
    handleRetryUnknown,
  } = useStudyPage(deckId, initialWords, initialDeck);

  // 1. 학습 종료 시 결과 화면
  // StudyResult 안에 헤더가 포함되었으므로 여기서는 중복해서 그리지 않습니다.
  if (isFinished) {
    return (
      <StudyResult
        total={total}
        counts={counts}
        deckId={deckId}
        onRetryUnknown={handleRetryUnknown}
        onClose={onClose}
      />
    );
  }

  // 2. 데이터 없을 때 (예외 처리)
  if (!words || words.length === 0) {
    return (
      <div className="study-session-page">
        <div className="study-header-area">
          <StudyHeader onClose={onClose} current={0} total={0} />
        </div>
        <div className="v-empty"></div>
      </div>
    );
  }

  // 3. 학습 화면
  return (
    <div className="study-session-page">
      <div className="study-header-area">
        <StudyHeader
          current={currentIndex + 1}
          total={total}
          onClose={onClose}
          onSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      <div className="study-top-controls">
        <StudyControls
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
        {/* 다음 카드 미리보기 */}
        {words[currentIndex + 1] && (
          <div className="next-card-preview">
            <StudyCard
              key={`next-${words[currentIndex + 1].id}`}
              cardData={words[currentIndex + 1]}
              isNextPreview={true}
            />
          </div>
        )}

        {/* 현재 카드 */}
        {currentCard ? (
          <StudyCard
            ref={cardRef}
            key={currentCard.id}
            cardData={currentCard}
            language={currentDeck?.language}
            onSwipe={handleNextCard}
            viewMode={studySettings.viewMode}
          />
        ) : (
          <div className="v-empty">완료!</div>
        )}
      </div>

      <div className="study-bottom-actions">
        <ActionButtons
          onKnow={() => triggerSwipe("right")}
          onUnknown={() => triggerSwipe("left")}
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
