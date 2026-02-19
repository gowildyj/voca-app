/**
 * @param {string} template - 치환할 문장 (text 또는 translation)
 * @param {object} selections - 사용자가 선택한 값 모음
 * @param {object} step - 현재 스텝 데이터 (default 값 참조용)
 * @param {boolean} isTranslation - 모국어 번역본을 만드는 중인지 여부
 */
/**
 * 템플릿 텍스트의 {variable}을 선택된 값으로 치환
 */
export const formatStepText = (
  template,
  selections,
  step,
  isTranslation = false,
) => {
  if (!template) return "";

  return template.replace(/{(\w+)}/g, (match, key) => {
    // 1. 선택된 값 확인 (이미 selections[key]에는 {word, meaning} 객체가 들어있음)
    const selectedOption = selections[key] || step.default;

    if (!selectedOption) return "____";

    // 2. 번역 모드면 meaning, 학습 모드면 word 반환
    return isTranslation ? selectedOption.meaning : selectedOption.word;
  });
};
