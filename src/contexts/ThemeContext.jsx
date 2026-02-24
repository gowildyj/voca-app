import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// Context 생성 (기본값 설정으로 에러 방지 가드)
const ThemeContext = createContext(undefined);

/**
 * 테마 유효성 검사 (보안: 로컬 스토리지 조작 방지)
 */
export const VALID_THEMES = [
  "modern",
  "dark",
  "bw",
  "pink",
  "blue",
  "green",
  "yellow",
  "purple",
  "pastel",
];
const getSafeTheme = (theme) =>
  VALID_THEMES.includes(theme) ? theme : "system";

export function ThemeProvider({ children }) {
  // 초기 상태 설정: 보안 검사를 거친 값만 허용
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "system";
    return getSafeTheme(localStorage.getItem("app-theme"));
  });

  /**
   * 테마 변경 함수 (확장성/성능: useCallback으로 리렌더링 최적화)
   */
  const setTheme = useCallback((newTheme) => {
    const safeTheme = getSafeTheme(newTheme);
    setThemeState(safeTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // 시스템 테마 감지 로직 (확장성: 사용자가 'system' 선택 시 실제 다크/라이트 모드 대응)
    const applyTheme = (targetTheme) => {
      if (targetTheme === "system" || targetTheme === "light") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", targetTheme);
      }
      localStorage.setItem("app-theme", targetTheme);
    };

    applyTheme(theme);

    // 보안: data-theme 속성에 잘못된 값이 들어가지 않도록 감시하거나 초기화 가능
  }, [theme]);

  /**
   * 미디어 쿼리 감지 (확장성: 시스템 설정 변경 시 즉시 반영)
   */
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // 시스템 설정이 바뀔 때 data-theme 재적용 로직 (필요 시)
      document.documentElement.removeAttribute("data-theme");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Context 값 메모이제이션 (성능: 하위 컴포넌트 불필요한 리렌더링 방지)
  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * 커스텀 훅: useTheme
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme은 ThemeProvider 내부에서 사용되어야 합니다.");
  }
  return context;
}
