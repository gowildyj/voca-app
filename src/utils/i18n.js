import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend) // 백엔드 모듈 연결
  .use(LanguageDetector) // 사용자 언어 자동 감지
  .use(initReactI18next) // 리액트 연결
  .init({
    fallbackLng: "ko", // 번역 파일이 없거나 에러나면 보여줄 기본 언어
    load: "languageOnly",

    // 파일 경로 설정
    backend: {
      loadPath: "/voca-app/locales/{{lng}}.json",
    },

    interpolation: {
      escapeValue: false, // 리액트는 자체적으로 XSS 방어를 하므로 false
    },

    debug: true,
  });

export default i18n;
