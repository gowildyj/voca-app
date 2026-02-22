import { useEffect, useRef, useState } from "react";

/**
 * 학습 세션을 로컬 스토리지에 자동 저장하고 복구하는 훅
 * 프로덕션 레벨: 에러 핸들링 강화, 스토리지 용량 관리, 복구 안정성 확보
 */
export const useStudyPersistence = (
  currentDeckId,
  studyState, // { currentWords, currentIndex, unknownWords, knownWords }
  setStudyState,
) => {
  const [isRestored, setIsRestored] = useState(false);
  const isInitialMount = useRef(true);

  // --- [1] 데이터 복구 로직 (Mount 시 1회 실행) ---
  useEffect(() => {
    if (!currentDeckId || isRestored) return;

    const restoreSession = () => {
      try {
        const savedDeckId = localStorage.getItem("temp_study_deck_id");

        // 🌟 현재 덱과 저장된 덱이 일치할 때만 복구 진행
        if (savedDeckId === String(currentDeckId)) {
          const rawWords = localStorage.getItem("temp_study_words");
          const rawIndex = localStorage.getItem("temp_study_index");
          const rawUnknown = localStorage.getItem("temp_study_unknown");
          const rawKnown = localStorage.getItem("temp_study_known");

          if (rawWords) {
            setStudyState({
              currentWords: JSON.parse(rawWords),
              currentIndex: rawIndex ? parseInt(rawIndex, 10) : 0,
              unknownWords: rawUnknown ? JSON.parse(rawUnknown) : [],
              knownWords: rawKnown ? JSON.parse(rawKnown) : [],
            });
            console.log(`✅ [Session] 덱(${currentDeckId}) 데이터 복구 완료`);
          }
        } else if (savedDeckId) {
          // 다른 덱의 데이터가 남아있다면 혼선 방지를 위해 정리
          clearStudySession();
        }
      } catch (error) {
        console.error("❌ [Session] 복구 중 오류 발생:", error);
        clearStudySession();
      } finally {
        setIsRestored(true);
      }
    };

    restoreSession();
  }, [currentDeckId, isRestored, setStudyState]);

  // --- [2] 자동 저장 로직 (상태 변경 시 실행) ---
  useEffect(() => {
    // 🌟 복구가 완료된 이후에만 저장을 시작하여 기존 데이터를 덮어씌우는 사고 방지
    if (!currentDeckId || !isRestored) return;

    // 첫 마운트 시 저장 로직 건너뜀 (이미 복구 로직이 담당)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const saveSession = () => {
      try {
        const { currentWords, currentIndex, unknownWords, knownWords } =
          studyState;

        localStorage.setItem("temp_study_deck_id", String(currentDeckId));
        localStorage.setItem("temp_study_words", JSON.stringify(currentWords));
        localStorage.setItem("temp_study_index", String(currentIndex));
        localStorage.setItem(
          "temp_study_unknown",
          JSON.stringify(unknownWords),
        );
        localStorage.setItem("temp_study_known", JSON.stringify(knownWords));
      } catch (error) {
        // LocalStorage 용량 초과(QuotaExceededError) 대응
        if (error.name === "QuotaExceededError") {
          console.warn(
            "⚠️ [Session] 저장 공간 부족으로 세션 저장에 실패했습니다.",
          );
        } else {
          console.error("❌ [Session] 저장 중 알 수 없는 오류:", error);
        }
      }
    };

    // 성능 최적화: 잦은 상태 변경 시 디바운스 적용 고려 가능 (현재는 즉시 저장)
    saveSession();
  }, [currentDeckId, studyState, isRestored]);

  return { isRestored };
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
  console.log("🧹 [Session] 임시 데이터가 초기화되었습니다.");
};
