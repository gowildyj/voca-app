import React from "react";
import { useWords } from "@/hooks/useWords";
import { WordsContext } from "./WordsContext";

export const WordsProvider = ({ children }) => {
  const wordsValues = useWords();
  return (
    <WordsContext.Provider value={wordsValues}>
      {children}
    </WordsContext.Provider>
  );
};
