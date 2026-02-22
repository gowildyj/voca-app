/**
 * [Scenario Utility]
 * 시나리오 대화문의 템플릿 텍스트를 실제 선택된 데이터로 변환합니다.
 */

/**
 * 템플릿 텍스트 내의 {variable} 패턴을 실제 값으로 치환합니다.
 * * @param {string} template - 치환 대상 문장 (예: "I'd like to order {drink}, please.")
 * @param {Object} selections - 사용자가 선택한 값 모음 (예: { drink: { word: "Coffee", meaning: "커피" } })
 * @param {Object} step - 현재 단계 데이터 (선택이 없을 경우 사용할 step.default 포함)
 * @param {boolean} isTranslation - 번역 모드 여부 (true면 meaning, false면 word 반환)
 * @returns {string} 치환이 완료된 최종 문장
 */
export const formatStepText = (
  template,
  selections = {},
  step = {},
  isTranslation = false,
) => {
  // 1. 예외 처리: 템플릿이 없으면 빈 문자열 반환
  if (!template) return "";

  /**
   * 정규식 설명: /{(\w+)}/g
   * { } 로 감싸진 영문자/숫자 조합을 전역(g)으로 찾습니다.
   */
  return template.replace(/{(\w+)}/g, (match, key) => {
    // 2. 우선순위 결정: 사용자 선택값 -> 스텝 기본값(default) -> 스텝의 첫 번째 옵션 순서
    const selectedOption =
      selections[key] || step.default || (step.options && step.options[0]);

    // 3. 데이터가 전혀 없을 경우: UI가 깨지지 않도록 플레이스홀더 반환
    if (!selectedOption) {
      return "____";
    }

    // 4. 데이터 타입 방어: 객체 형태 { word, meaning } 인지, 단순 문자열인지 확인
    // 확장성: 단순 문자열 데이터가 들어와도 정상 작동하도록 설계
    if (typeof selectedOption === "string") {
      return selectedOption;
    }

    // 5. 모드에 따른 값 추출
    const result = isTranslation ? selectedOption.meaning : selectedOption.word;

    // 6. 최종 안전 가드: 추출한 값이 null이나 undefined인 경우 예외 처리
    return result || selectedOption.word || "____";
  });
};

/**
 * (참고) 시나리오 진행률 계산 유틸리티 (추후 확장용)
 */
export const calculateScenarioProgress = (currentIndex, totalSteps) => {
  if (totalSteps <= 0) return 0;
  return Math.round(((currentIndex + 1) / totalSteps) * 100);
};
