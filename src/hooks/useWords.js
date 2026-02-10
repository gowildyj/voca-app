import { useState } from "react";
import defaultData from "../data/words.json";

export const useWords = () => {
  // 1. 상태 초기화 시점에 로컬스토리지를 바로 확인 (빨간줄 해결 핵심)
  const [words, setWords] = useState(() => {
    const savedWords = localStorage.getItem("my-voca-words");
    try {
      // 저장된 데이터가 있으면 파싱하고, 없으면 기본 데이터를 반환
      return savedWords ? JSON.parse(savedWords) : defaultData;
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      return defaultData;
    }
  });

  // 2. 단어 추가 함수
  const addWord = (newWord) => {
    // 함수형 업데이트를 사용하여 최신 상태를 보장합니다.
    setWords((prevWords) => {
      const updated = [...prevWords, { ...newWord, id: Date.now() }];
      // 로컬스토리지 저장 로직도 여기에 포함시켜 동기화합니다.
      localStorage.setItem("my-voca-words", JSON.stringify(updated));
      return updated;
    });
  };

  // 단어 삭제
  const deleteWord = (id) => {
    if (window.confirm("이 단어를 삭제하시겠습니까?")) {
      setWords((prevWords) => {
        const updated = prevWords.filter((word) => word.id !== id);
        localStorage.setItem("my-voca-words", JSON.stringify(updated));
        return updated;
      });
    }
  };

  return { words, addWord, deleteWord };
};
