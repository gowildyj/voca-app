import React, { useEffect } from "react";
import StudySession from "@/pages/StudySession";
import "@/styles/pages/studyPage.css";

const StudyPage = ({
  isOpen,
  onClose,
  deckId,
  initialWords,
  initialDeck,
  currentCard,
  onToggleWordFavorite,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="v-study-overlay">
      <main className="v-study-content-full">
        <StudySession
          deckId={deckId}
          initialWords={initialWords}
          initialDeck={initialDeck}
          onClose={onClose}
          onToggleWordFavorite={onToggleWordFavorite}
        />
      </main>
    </div>
  );
};

export default StudyPage;
