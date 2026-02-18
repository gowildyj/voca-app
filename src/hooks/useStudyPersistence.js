import { useEffect, useRef } from "react";

export const useStudyPersistence = (
  currentDeckId,
  currentWords,
  currentIndex,
  unknownWords,
  knownWords,
  setStudyState,
) => {
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!currentDeckId) return;

    isLoadedRef.current = false;

    const savedDeckId = localStorage.getItem("temp_study_deck_id");

    if (savedDeckId === String(currentDeckId)) {
      const savedWords = localStorage.getItem("temp_study_words");
      const savedIndex = localStorage.getItem("temp_study_index");
      const savedUnknown = localStorage.getItem("temp_study_unknown");
      const savedKnown = localStorage.getItem("temp_study_known");

      if (savedWords) {
        setStudyState({
          currentWords: JSON.parse(savedWords),
          currentIndex: savedIndex ? parseInt(savedIndex, 10) : 0,
          unknownWords: savedUnknown ? JSON.parse(savedUnknown) : [],
          knownWords: savedKnown ? JSON.parse(savedKnown) : [],
        });
      }
    }

    isLoadedRef.current = true;
  }, [currentDeckId, setStudyState]);

  useEffect(() => {
    if (!currentDeckId || !isLoadedRef.current) return;

    localStorage.setItem("temp_study_deck_id", String(currentDeckId));
    localStorage.setItem("temp_study_words", JSON.stringify(currentWords));
    localStorage.setItem("temp_study_index", String(currentIndex));
    localStorage.setItem("temp_study_unknown", JSON.stringify(unknownWords));
    localStorage.setItem("temp_study_known", JSON.stringify(knownWords));
  }, [currentDeckId, currentWords, currentIndex, unknownWords, knownWords]);

  return { loading: false };
};

export const clearStudySession = () => {
  const keys = [
    "temp_study_words",
    "temp_study_index",
    "temp_study_deck_id",
    "temp_study_unknown",
    "temp_study_known",
  ];
  keys.forEach((key) => localStorage.removeItem(key));
};
