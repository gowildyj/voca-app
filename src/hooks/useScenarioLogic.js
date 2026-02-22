import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

/**
 * 시나리오 대화 학습의 흐름과 상태를 관리하는 커스텀 훅
 * 프로덕션 레벨: 변수 치환 엔진 강화, 타이머 누수 방지, 흐름 제어 최적화
 */
export const useScenarioLogic = (scenario) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState({}); // 사용자가 선택한 변수 데이터 저장
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const timerRef = useRef(null);

  // 1. 현재 단계 데이터 추출 (방어적 설계 적용)
  const currentStep = useMemo(() => {
    if (!scenario?.steps || !scenario.steps[currentStepIndex]) return null;
    return scenario.steps[currentStepIndex];
  }, [scenario, currentStepIndex]);

  // 2. 현재까지 진행된 대화 목록 (UI 렌더링용)
  const visibleSteps = useMemo(() => {
    if (!scenario?.steps) return [];
    return scenario.steps.slice(0, currentStepIndex + 1);
  }, [scenario, currentStepIndex]);

  /**
   * 다음 단계로 이동하는 함수 (중복 호출 방지 로직 포함)
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
   * 🌟 변수 추출 및 저장 로직 (정규표현식 강화)
   */
  const handleSelectOption = useCallback(
    (option) => {
      if (!currentStep) return;

      // 텍스트 내 {variable} 패턴 추출
      const match = currentStep.text.match(/{(.*?)}/);
      if (match) {
        const varName = match[1];
        setSelections((prev) => ({
          ...prev,
          [varName]: option,
        }));
      }

      setIsOptionOpen(false);

      // 선택 후 자연스러운 전환을 위한 지연 이동
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(moveToNext, 800);
    },
    [currentStep, moveToNext],
  );

  /**
   * 모달을 그냥 닫았을 때의 방어 로직 (기본값 강제 선택)
   */
  const handleModalClose = useCallback(() => {
    if (!currentStep) return setIsOptionOpen(false);

    const match = currentStep.text.match(/{(.*?)}/);
    const varName = match ? match[1] : null;

    // 선택된 값이 없는 경우 기본값(default) 또는 첫 번째 옵션 선택 처리
    if (varName && !selections[varName]) {
      const fallback =
        currentStep.default || (currentStep.options && currentStep.options[0]);
      if (fallback) {
        handleSelectOption(fallback);
        return;
      }
    }
    setIsOptionOpen(false);
  }, [currentStep, selections, handleSelectOption]);

  /**
   * 핵심 대화 흐름 제어 엔진 (상대방 대화 vs 사용자 입력 대기)
   */
  useEffect(() => {
    if (!currentStep) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    // 1. 상대방(left)의 말: 일정 시간 후 자동 진행
    if (currentStep.role === "left") {
      // 텍스트 길이에 따라 대기 시간 조절 가능 (프로덕션 팁)
      const delay = Math.max(2000, currentStep.text.length * 100);
      timerRef.current = setTimeout(moveToNext, delay);
    }

    // 2. 나의 차례(right) & 옵션이 있는 경우: 모달 활성화
    if (currentStep.role === "right" && currentLayerOptionExists(currentStep)) {
      timerRef.current = setTimeout(() => setIsOptionOpen(true), 600);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStepIndex, currentStep, moveToNext]);

  // 유틸리티: 옵션 존재 여부 확인 [cite: 2025-07-07]
  function currentLayerOptionExists(step) {
    return Array.isArray(step.options) && step.options.length > 0;
  }

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
