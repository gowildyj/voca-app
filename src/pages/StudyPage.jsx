import React from "react";
import StudySession from "@/pages/StudySession";
import "@/styles/pages/studyPage.css";

const StudyPage = ({ isOpen, onClose, deckId, initialWords, initialDeck }) => {
  if (!isOpen) return null;

  return (
    <div className="v-study-overlay">
      <main className="v-study-content-full">
        <StudySession
          deckId={deckId}
          initialWords={initialWords} // 배달 1
          initialDeck={initialDeck} // 배달 2
          onClose={onClose}
        />
      </main>
    </div>
  );
};

export default StudyPage;
