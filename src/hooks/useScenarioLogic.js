import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

/**
 * 시나리오 대화 학습의 흐름과 상태를 관리하는 훅
 * @param {Object} scenario - 선택된 시나리오 데이터 (steps, title 등 포함)
 */
export const useScenarioLogic = (scenario) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState({}); // 사용자가 선택한 단어 저장
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const timerRef = useRef(null);

  // 1. 현재 단계 데이터 추출
  const currentStep = useMemo(() => {
    if (!scenario?.steps) return null;
    return scenario.steps[currentStepIndex];
  }, [scenario, currentStepIndex]);

  // 2. 현재까지 진행된 대화 목록 (말풍선 리스트)
  const visibleSteps = useMemo(() => {
    if (!scenario?.steps) return [];
    return scenario.steps.slice(0, currentStepIndex + 1);
  }, [scenario, currentStepIndex]);

  /**
   * 다음 단계로 이동하는 함수
   */
  const moveToNext = useCallback(() => {
    if (!scenario?.steps) return;
    if (currentStepIndex < scenario.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      toast.success("시나리오를 모두 완료했습니다! ✨", { id: "scenario-end" });
    }
  }, [currentStepIndex, scenario]);

  /**
   * 사용자의 옵션 선택 처리
   * @param {Object} option - { word: "Apple", meaning: "사과" } 형태의 객체
   */
  const handleSelectOption = useCallback(
    (option) => {
      if (!currentStep) return;

      // 텍스트 내 {variable} 패턴을 찾아 변수명 추출
      const match = currentStep.text.match(/{(.*)}/);
      if (match) {
        const varName = match[1];
        setSelections((prev) => ({
          ...prev,
          [varName]: option,
        }));
      }

      setIsOptionOpen(false);

      // 선택 후 자연스러운 흐름을 위해 약간의 지연 후 다음으로 이동
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(moveToNext, 800);
    },
    [currentStep, moveToNext],
  );

  /**
   * 모달을 그냥 닫았을 때 처리 (기본값 강제 선택 또는 방어 로직)
   */
  const handleModalClose = useCallback(() => {
    if (!currentStep) return setIsOptionOpen(false);

    const match = currentStep.text.match(/{(.*)}/);
    const varName = match ? match[1] : null;

    // 아무것도 선택 안 하고 닫았을 때, 첫 번째 옵션이나 기본값으로 자동 진행
    if (varName && !selections[varName]) {
      const defaultValue =
        currentStep.default || (currentStep.options && currentStep.options[0]);
      if (defaultValue) {
        handleSelectOption(defaultValue);
      } else {
        setIsOptionOpen(false);
      }
    } else {
      setIsOptionOpen(false);
    }
  }, [currentStep, selections, handleSelectOption]);

  /**
   * 시나리오 자동 진행 및 옵션 창 제어 (핵심 흐름)
   */
  useEffect(() => {
    if (!currentStep) return;

    // 타이머 청소
    if (timerRef.current) clearTimeout(timerRef.current);

    // 상대방(left)이 말할 때는 일정 시간 후 자동으로 다음으로 이동
    if (currentStep.role === "left") {
      timerRef.current = setTimeout(moveToNext, 2500);
    }

    // 나(right)의 차례이고 옵션이 있는 경우 옵션 모달 열기
    if (currentStep.role === "right" && currentStep.options) {
      timerRef.current = setTimeout(() => setIsOptionOpen(true), 600);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStepIndex, currentStep, moveToNext]);

  return {
    visibleSteps,
    currentStep,
    selections,
    isOptionOpen,
    setIsOptionOpen,
    handleSelectOption,
    handleModalClose,
    currentIndex: currentStepIndex,
    totalSteps: scenario?.steps?.length || 0,
  };
};
