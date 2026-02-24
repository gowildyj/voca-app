/**
 * 데이터에 언어 설정이 없거나 'all'인 경우 기본 언어를 반환하는 함수
 * @param {string} langCode - 입력받은 언어 코드
 * @returns {string} - 결정된 언어 코드 (기본값 ko-KR)
 */
export const getDefaultLang = (langCode) => {
  if (!langCode || langCode === "all") {
    return "ko-KR";
  }
  return langCode;
};

/**
 * Form을 제출할 때 실행되는 함수
 * Form의 데이터를 추출하여 Object.fromEntries()를 사용하여
 * key-value 형식의 오브젝트로 반환
 * @param {Event} e - Form이 제출된 이벤트
 * @returns {Object} - 추출된 Form 데이터 (key-value 형식)
 */
export const getFormData = (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  console.log("✅ data: ", data);
  return data;
};
