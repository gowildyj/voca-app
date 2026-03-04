// src/utils/commonUtils.js

import { logger } from "@/utils/logger";
import { LANG_OPTIONS } from "@/constants/languages";

/**
 * 데이터에 언어 설정이 없거나 'all'인 경우 기본 언어를 반환하는 함수
 * @param {string} langCode - 입력받은 언어 코드
 * @returns {string} - 결정된 언어 코드 혹은 기본값
 */
export const getDefaultLang = (langCode) => {
  logger.start("getDefaultLang", { langCode });
  if (!langCode || langCode === "all") {
    return "ko-KR";
  }
  return langCode;
};

/**
 * 언어 아이콘을 반환하는 함수
 * @param {string} langCode - 언어 코드 (e.g. 'ko-KR', 'en-US')
 * @returns {string} - 언어 아이콘 (e.g. '', '')
 */
const getLangIcon = (langCode) => {
  const target = LANG_OPTIONS.find((lang) => lang.value === langCode);
  return target ? target.icon : "";
};

/**

 * Form을 제출할 때 실행되는 함수
 * Form의 데이터를 추출하여 Object.fromEntries()를 사용하여 key-value 형식의 오브젝트로 반환
 * @param {Event} e - Form이 제출된 이벤트
 * @returns {Object} - 추출된 Form 데이터 (key-value 형식)
 */
export const getFormData = (e) => {
  logger.start("getFormData");
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  logger.success("getFormData", data);
  return data;
};

/**
 * boolean 값을 토글하는 함수
 * @param {boolean} currentValue - 현재 boolean 값
 * @returns {boolean} - 토글된 boolean 값
 */
export const toggleValue = (currentValue) => {
  const nextValue = !currentValue;
  logger.success("toggleValue", { from: currentValue, to: nextValue });
  return nextValue;
};
