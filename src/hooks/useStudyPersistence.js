import { useEffect, useRef } from "react";

/**
 * 학습 세션을 로컬 스토리지에 자동 저장하고 복구하는 훅
 * @param {string} currentDeckId - 현재 학습 중인 덱의 ID
 * @param {Object} studyState - 현재 학습 상태 (currentWords, currentIndex, unknownWords, knownWords)
 * @param {Function} setStudyState - 상태를 복구할 때 사용할 Setter 함수
 */
export const useStudyPersistence = (
  currentDeckId,
  { currentWords, currentIndex, unknownWords, knownWords },
  setStudyState,
) => {
  // 처음 로드되었는지 확인하는 플래그 (중복 저장 방지)
  const isLoadedRef = useRef(false);

  // --- [1] 데이터 복구 로직 (Mount 시 1회 실행) ---
  useEffect(() => {
    if (!currentDeckId) return;

    isLoadedRef.current = false;

    try {
      const savedDeckId = localStorage.getItem("temp_study_deck_id");

      // 현재 학습하려는 덱과 저장된 덱이 일치할 때만 복구 진행
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
          console.log("✅ 학습 세션이 성공적으로 복구되었습니다.");
        }
      } else {
        // 덱이 다르면 기존 세션 데이터 삭제 (혼선 방지)
        clearStudySession();
      }
    } catch (error) {
      console.error("❌ 학습 데이터 복구 실패:", error);
      clearStudySession(); // 에러 발생 시 초기화하여 데이터 오염 방지
    }

    isLoadedRef.current = true;
  }, [currentDeckId, setStudyState]);

  // --- [2] 자동 저장 로직 (상태 변경 시 실행) ---
  useEffect(() => {
    // 덱 ID가 없거나, 아직 복구가 완료되지 않은 시점에는 저장하지 않음
    if (!currentDeckId || !isLoadedRef.current) return;

    try {
      localStorage.setItem("temp_study_deck_id", String(currentDeckId));
      localStorage.setItem("temp_study_words", JSON.stringify(currentWords));
      localStorage.setItem("temp_study_index", String(currentIndex));
      localStorage.setItem("temp_study_unknown", JSON.stringify(unknownWords));
      localStorage.setItem("temp_study_known", JSON.stringify(knownWords));
    } catch (error) {
      // 용량 초과 등의 예외 처리
      console.error("❌ 실시간 데이터 저장 실패:", error);
    }
  }, [currentDeckId, currentWords, currentIndex, unknownWords, knownWords]);

  return { loading: !isLoadedRef.current };
};

/**
 * 학습 종료 후 세션 데이터를 완전히 삭제하는 유틸리티 함수
 */
export const clearStudySession = () => {
  const keys = [
    "temp_study_words",
    "temp_study_index",
    "temp_study_deck_id",
    "temp_study_unknown",
    "temp_study_known",
  ];
  keys.forEach((key) => localStorage.removeItem(key));
  console.log("🧹 학습 세션 데이터가 정리되었습니다.");
};
