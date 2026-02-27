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

    const applyTheme = (targetTheme) => {
      // 1. data-theme 속성 적용 (CSS 변수 변경 트리거)
      if (targetTheme === "system" || targetTheme === "modern") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", targetTheme);
      }
      localStorage.setItem("app-theme", targetTheme);

      // 🌟 2. 모바일 상단바 색상 동적 변경 (Safe Area 대응)
      const themeMeta = document.getElementById("theme-meta");
      if (themeMeta) {
        // 브라우저가 스타일을 계산한 뒤 실행되도록 requestAnimationFrame 사용
        requestAnimationFrame(() => {
          const computedBgColor = getComputedStyle(root)
            .getPropertyValue("--bg")
            .trim();

          if (computedBgColor) {
            themeMeta.setAttribute("content", computedBgColor);
          }
        });
      }
    };

    applyTheme(theme);
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
