import { useState, useMemo, useEffect } from "react";

export const useScenarioLogic = (scenario) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [isOptionOpen, setIsOptionOpen] = useState(false);

  const currentStep = scenario.steps[currentStepIndex];

  // 현재까지의 대화 목록
  const visibleSteps = useMemo(() => {
    return scenario.steps.slice(0, currentStepIndex + 1);
  }, [scenario.steps, currentStepIndex]);

  // 다음으로 넘어가기
  const moveToNext = () => {
    if (currentStepIndex < scenario.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  // 옵션 선택 처리
  const handleSelectOption = (option) => {
    const match = currentStep.text.match(/{(.*)}/);
    if (match) {
      const varName = match[1];
      setSelections((prev) => ({
        ...prev,
        [varName]: option, // {word, meaning} 객체 통째로 저장
      }));
    }
    setIsOptionOpen(false);
    setTimeout(moveToNext, 600);
  };

  // 모달 닫기 처리 (default 적용)
  const handleModalClose = () => {
    const match = currentStep?.text.match(/{(.*)}/);
    const varName = match ? match[1] : null;

    if (varName && !selections[varName]) {
      handleSelectOption(currentStep.default || currentStep.options[0]);
    } else {
      setIsOptionOpen(false);
    }
  };

  // 흐름 제어 Effect
  useEffect(() => {
    if (!currentStep) return;

    if (currentStep.role === "left") {
      const timer = setTimeout(moveToNext, 2000);
      return () => clearTimeout(timer);
    }

    if (currentStep.role === "right" && currentStep.options) {
      const timer = setTimeout(() => setIsOptionOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex]);

  return {
    visibleSteps,
    currentStep,
    selections,
    isOptionOpen,
    setIsOptionOpen,
    handleSelectOption,
    handleModalClose,
  };
};
