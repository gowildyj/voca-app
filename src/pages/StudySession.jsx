import React, { useState, useRef } from "react"; // useRef 추가
import { useNavigate, useParams } from "react-router-dom";
import "@/styles/pages/studySession.css";

import StudyHeader from "@/components/ui/study/StudyHeader";
import StudyControls from "@/components/ui/study/StudyControls";
import ActionButtons from "@/components/ui/study/ActionButtons";
import StudyCard from "@/components/ui/study/StudyCard";
import StudySettingModal from "@/components/modals/StudySettingModal";
import { useStudyPage } from "@/hooks/pages/useStudyPage";
import StudyResult from "@/pages/StudyResult";

const StudySession = () => {
  const navigate = useNavigate();
  const { deckId } = useParams();

  const {
    words,
    currentCard,
    total,
    currentIndex,
    counts,
    loading,
    cardRef,
    isSettingsOpen,
    setIsSettingsOpen,
    studySettings,
    setStudySettings,
    handleNextCard,
    triggerSwipe,
    isFinished,
    handleRetryUnknown,
  } = useStudyPage(deckId);

  if (loading && total === 0) return <div className="v-loader" />;

  if (isFinished) {
    return (
      <StudyResult
        total={total}
        counts={counts}
        deckId={deckId}
        onRetryUnknown={handleRetryUnknown}
      />
    );
  }

  return (
    <div className="study-session-page">
      <div className="study-header-area">
        <StudyHeader
          current={currentIndex + 1}
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
        {words[currentIndex + 1] && (
          <div className="next-card-preview">
            <StudyCard
              key={`next-${words[currentIndex + 1].id}`}
              cardData={words[currentIndex + 1]}
              isNextPreview={true}
            />
          </div>
        )}
        {currentCard ? (
          <StudyCard
            ref={cardRef}
            key={currentCard.id}
            cardData={currentCard}
            onSwipe={handleNextCard}
            viewMode={studySettings.viewMode}
          />
        ) : (
          <div className="v-empty">학습할 단어가 없어요!</div>
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
