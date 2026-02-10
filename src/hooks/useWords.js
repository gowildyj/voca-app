import { useState } from "react";
import defaultData from "../data/words.json";

export const useWords = () => {
  const [words, setWords] = useState(() => {
    const savedWords = localStorage.getItem("my-voca-words");
    try {
      return savedWords ? JSON.parse(savedWords) : defaultData;
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      return defaultData;
    }
  });

  const addWord = (newWord) => {
    setWords((prevWords) => {
      const updated = [...prevWords, { ...newWord, id: Date.now() }];
      localStorage.setItem("my-voca-words", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteWord = (id) => {
    if (window.confirm("이 단어를 삭제하시겠습니까?")) {
      setWords((prevWords) => {
        const updated = prevWords.filter((word) => word.id !== id);
        localStorage.setItem("my-voca-words", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateWordStatus = (id, newStatus) => {
    setWords((prevWords) => {
      const updated = prevWords.map((word) =>
        word.id === id ? { ...word, status: newStatus } : word,
      );
      localStorage.setItem("my-voca-words", JSON.stringify(updated));
      return updated;
    });
  };

  // 덱 삭제
  const deleteDeck = (deckName) => {
    if (window.confirm(`"${deckName}" 덱의 모든 단어를 삭제하시겠습니까?`)) {
      setWords((prevWords) => {
        // 해당 덱 이름과 일치하지 않는 단어들만 남깁니다.
        const updated = prevWords.filter((word) => word.deck !== deckName);
        // 로컬스토리지에도 즉시 저장
        localStorage.setItem("my-voca-words", JSON.stringify(updated));
        return updated;
      });
    }
  };

  // 덱 이름 수정
  const renameDeck = (oldName, newName) => {
    if (!newName.trim()) return; // 빈 이름 방지

    setWords((prevWords) => {
      const updated = prevWords.map((word) =>
        word.deck === oldName ? { ...word, deck: newName } : word,
      );
      localStorage.setItem("my-voca-words", JSON.stringify(updated));
      return updated;
    });
  };

  return {
    words,
    addWord,
    deleteWord,
    updateWordStatus,
    deleteDeck,
    renameDeck,
  };
};
