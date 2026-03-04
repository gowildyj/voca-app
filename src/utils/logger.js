// src/utils/logger.js

const isDev = import.meta.env.MODE === "development";

export const logger = {
  // 함수 호출을 알리는 로그
  start: (funcName, payload = null) => {
    if (!isDev) return;

    console.group(`✅[ACTION] ${funcName}`);
    if (payload) {
      console.log("✅ Input Payload:", payload);
    }
    console.groupEnd();
  },

  // ✅ 성공 및 결과 로그
  success: (funcName, result = null) => {
    if (!isDev) return;

    console.group(`✅ [SUCCESS] ${funcName}`);
    if (result) {
      if (Array.isArray(result)) {
        console.table(result); // 배열은 표 형식으로 출력
        // console.log(result);
      } else {
        console.log("✅ Output Data:", result);
      }
    }
    console.groupEnd();
  },

  // ❌ 에러 로그
  error: (funcName, error) => {
    if (!isDev) return;

    console.group(`❌ [ERROR] ${funcName}`);
    console.error("❌ Error Data:", error);
    console.groupEnd();
  },
};
