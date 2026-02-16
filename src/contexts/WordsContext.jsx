import React, { createContext } from "react";
import { useWords } from "@/hooks/useWords";

export const WordsContext = createContext(null);

export const WordsProvider = ({ children }) => {
  const wordsValues = useWords();

  return (
    <WordsContext.Provider value={wordsValues}>
      {children}
    </WordsContext.Provider>
  );
};
