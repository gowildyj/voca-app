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
    // Data
    words,
    currentCard,
    nextCard,
    currentDeck,
    total,
    currentIndex,
    counts,
    isFinished,
    // Animation & State
    x,
    y,
    rotate,
    controls,
    isFlipped,
    swipeDirection,
    // Actions
    isSettingsOpen,
    setIsSettingsOpen,
    studySettings,
    setStudySettings,
    triggerSwipe,
    handleRetryUnknown,
    onToggleWordFavorite,
    handleUndo,
    handleShuffle,
    toggleAutoPlay,
    handleFlip,
    onSwipeAction, // 🌟 추가된 액션
  } = useStudyPage(deckId, initialWords, initialDeck);

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
          onUndo={handleUndo}
          onShuffle={handleShuffle}
          isAutoPlay={studySettings.isAutoPlay}
          toggleAutoPlay={toggleAutoPlay}
        />
      </div>

      <div className="study-card-area">
        {/* 다음 카드 미리보기 (nextCard 활용) */}
        {nextCard && (
          <div className="next-card-preview">
            <StudyCard
              key={`next-${nextCard.id}`}
              cardData={nextCard}
              isNextPreview={true}
            />
          </div>
        )}

        {/* 현재 카드 (🌟 모든 제어권 전달) */}
        {currentCard ? (
          <StudyCard
            key={currentCard.id}
            cardData={currentCard}
            language={currentDeck?.language}
            onToggleWordFavorite={onToggleWordFavorite}
            // 🌟 훅에서 온 애니메이션 상태 및 핸들러 주입
            x={x}
            y={y}
            rotate={rotate}
            controls={controls}
            isFlipped={isFlipped}
            swipeDirection={swipeDirection}
            onFlip={handleFlip}
            onSwipeAction={onSwipeAction}
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
