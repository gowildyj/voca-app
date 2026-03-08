import React, { Suspense, useMemo, useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { Toaster } from "react-hot-toast";

import MainLayout from "@/components/layout/MainLayout";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import StudyCategoryModal from "@/components/modals/StudyCategoryModal";
import SettingsPage from "@/pages/SettingsPage";
import { toastConfig, showToast } from "@/utils/toast";

import { AppRoutesData, ROUTES } from "@/routes/AppRoutes";
import { LANG_OPTIONS, DEFAULT_LANG } from "@/constants/languages";
import { initTTS } from "@/utils/ttsUtils";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    initTTS();
  }, []);

  // [상태 관리] 사용자 선택 언어 보존 (LocalStorage)
  const [selectedLang, setSelectedLang] = useState(() => {
    const savedLangValue = localStorage.getItem("selected_language");
    return (
      LANG_OPTIONS.find((l) => l.value === savedLangValue) ||
      LANG_OPTIONS.find((l) => l.value === DEFAULT_LANG) ||
      LANG_OPTIONS[0]
    );
  });

  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 레이아웃 표시 여부 제어
  const uiDisplay = useMemo(() => {
    const path = location.pathname;
    const isStudyPath = ["/study", "/scenario-session"].some((p) =>
      path.startsWith(p),
    );
    return {
      hideBottomNav: isStudyPath,
      hideHeader: isStudyPath,
    };
  }, [location.pathname]);

  // 개발 환경 전용 루트 필터링
  const routes = useMemo(
    () =>
      process.env.NODE_ENV === "development"
        ? AppRoutesData
        : AppRoutesData.filter((r) => r.path !== ROUTES.DESIGN),
    [],
  );

  // 언어 변경 및 페이지 리다이렉트 처리
  const handleLanguageChange = (langId) => {
    const target = LANG_OPTIONS.find((l) => l.value === langId);
    if (!target) return;

    setSelectedLang(target);
    localStorage.setItem("selected_language", langId);
    showToast.success(`${target.label} 모드로 변경되었습니다!`, {
      icon: target.icon,
    });
    setIsLangModalOpen(false);

    const currentPath = location.pathname;

    // 상세 페이지 경로 패턴 확인
    const isDeckDetail =
      currentPath.startsWith("/decks/") && currentPath !== ROUTES.DECK_LIST;
    const isStudySession = currentPath.startsWith("/study/");
    const isScenarioDetail =
      currentPath.startsWith("/scenarios/") &&
      currentPath !== ROUTES.SCENARIO_LIST;
    const isScenarioSession = currentPath.startsWith("/scenario-session/");

    // 상세 페이지나 학습 화면에 있다면 해당 목록으로 이동
    if (isDeckDetail || isStudySession) {
      navigate(ROUTES.DECK_LIST); // 덱 목록으로 이동
    } else if (isScenarioDetail || isScenarioSession) {
      navigate(ROUTES.SCENARIO_LIST); // 시나리오 목록으로 이동
    }
  };

  return (
    <MainLayout
      header={
        !uiDisplay.hideHeader && (
          <Header
            currentLangIcon={selectedLang.icon}
            currentLangLabel={selectedLang.label}
            onOpenLangModal={() => setIsLangModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )
      }
      bottomNav={
        !uiDisplay.hideBottomNav && (
          <BottomNav
            currentLangIcon={selectedLang.icon}
            onOpenLangModal={() => setIsLangModalOpen(true)}
          />
        )
      }
      modals={
        <>
          <SettingsPage
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
          <StudyCategoryModal
            isOpen={isLangModalOpen}
            onClose={() => setIsLangModalOpen(false)}
            currentCategory={selectedLang.value}
            onSelect={handleLanguageChange}
          />
        </>
      }
    >
      <Toaster {...toastConfig} />
      <Suspense fallback={<div className="v-page-transition-loader" />}>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={React.cloneElement(element, {
                currentLangValue: selectedLang.value,
                // 언어가 바뀌면 컴포넌트 강제 리마운트 (데이터 갱신)
                key: selectedLang.value,
              })}
            />
          ))}
        </Routes>
      </Suspense>
    </MainLayout>
  );
}

const App = () => (
  <ModalProvider>
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  </ModalProvider>
);

export default App;
