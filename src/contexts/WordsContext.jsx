import React, { createContext, useContext, useMemo } from "react";
import { useWords } from "@/hooks/useWords";

/**
 * Context 생성
 * 초기값을 undefined로 설정하여 Provider 밖에서 사용 시 런타임 에러를 명확히 잡습니다.
 */
const WordsContext = createContext(undefined);

/**
 * WordsProvider 통합 관리자
 * 비즈니스 로직(useWords)과 상태 저장소(Context)를 연결합니다.
 */
export const WordsProvider = ({ children }) => {
  // 실제 Supabase와 통신하거나 상태를 관리하는 커스텀 훅 호출
  const wordsValues = useWords();

  /**
   * 성능 최적화 (Performance):
   * wordsValues 객체가 리렌더링 때마다 새로 생성되어 하위 컴포넌트들을
   * 불필요하게 리렌더링 시키는 것을 방지하기 위해 useMemo를 적용합니다.
   * (단, useWords 내부에서 이미 객체가 안정화되어 있다면 생략 가능하지만
   * 컨텍스트 레벨에서 한 번 더 보호하는 것이 프로덕션의 정석입니다.)
   */
  const memoizedValue = useMemo(
    () => ({
      ...wordsValues,
    }),
    [wordsValues],
  );

  return (
    <WordsContext.Provider value={memoizedValue}>
      {children}
    </WordsContext.Provider>
  );
};

/**
 * useWordsContext 커스텀 훅 (확장성 & 예외처리)
 * 컴포넌트에서 useContext를 직접 쓰는 대신 이 훅을 사용하게 하여
 * 잘못된 사용(Provider 밖에서의 호출)을 즉시 차단
 */
export const useWordsContext = () => {
  const context = useContext(WordsContext);

  if (context === undefined) {
    throw new Error(
      "useWordsContext는 반드시 WordsProvider 안에서 사용되어야 합니다. App.jsx의 배치를 확인하세요.",
    );
  }

  return context;
};
