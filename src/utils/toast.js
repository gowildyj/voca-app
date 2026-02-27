import { toast } from "react-hot-toast";

/**
 * 토스트 기본 설정 (Toaster 컴포넌트용)
 */
export const toastConfig = {
  position: "top-center",
  reverseOrder: false,
  gutter: 8,
  containerStyle: {
    top: 80,
    zIndex: 9999,
  },
  toastOptions: {
    className: "custom-toast",
    duration: 2000,
  },
};

/**
 * 전역 토스트 실행 함수
 */
export const showToast = {
  success: (message, options = {}) => {
    // toast.dismiss(); // 기존 토스트 지우고 1개만 보여주기
    return toast.success(message, options);
  },
  error: (message, options = {}) => {
    toast.dismiss();
    return toast.error(message, options);
  },
};
