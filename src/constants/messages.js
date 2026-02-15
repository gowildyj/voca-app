export const ERROR_MESSAGES = {
  // 공통 에러
  COMMON: {
    UNKNOWN: "알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.",
    NETWORK: "네트워크 연결이 불안정합니다. 연결 상태를 확인해 주세요.",
    UNAUTHORIZED: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  },
  // 덱 관련
  DECK: {
    CREATE_FAILED: "새로운 덱을 생성하는 데 실패했습니다.",
    UPDATE_FAILED: "덱 정보를 수정하는 데 실패했습니다.",
    DELETE_CONFIRM:
      "덱을 삭제하면 포함된 모든 단어가 사라집니다. 정말 삭제하시겠습니까?",
    NAME_REQUIRED: "덱 이름을 입력해 주세요.",
  },
  // 단어 관련
  WORD: {
    ADD_FAILED: "단어 추가에 실패했습니다.",
    BULK_PARSE_ERROR: "입력 형식이 올바르지 않습니다. (예: apple:사과)",
    DUPLICATE: "이미 목록에 존재하는 단어입니다.",
    DELETE_FAILED: "단어를 삭제하는 중에 오류가 발생했습니다.",
  },
};

export const SUCCESS_MESSAGES = {
  DECK_CREATED: "새로운 학습 덱이 생성되었습니다! 🚀",
  WORD_ADDED: "단어가 성공적으로 추가되었습니다.",
  SAVE_COMPLETED: "수정 내용이 저장되었습니다.",
};
