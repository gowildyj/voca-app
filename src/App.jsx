import React, { Suspense, useMemo, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { WordsProvider } from "@/contexts/WordsContext";
import { Toaster, toast } from "react-hot-toast";

import MainLayout from "@/components/layout/MainLayout";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import StudyCategoryModal from "@/components/modals/StudyCategoryModal";
import SettingsPage from "@/pages/SettingsPage";

import { AppRoutesData, ROUTES } from "@/routes/AppRoutes";
import { LANG_OPTIONS, DEFAULT_LANG } from "@/constants/languages";

function AppContent() {
  const location = useLocation();

  // 🌟 [상태 관리] 사용자 선택 언어 보존 (LocalStorage)
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
            onSelect={(langId) => {
              const target = LANG_OPTIONS.find((l) => l.value === langId);
              if (target) {
                setSelectedLang(target);
                localStorage.setItem("selected_language", langId);
                toast.success(`${target.label} 모드로 변경되었습니다!`, {
                  icon: target.icon,
                });
              }
              setIsLangModalOpen(false);
            }}
          />
        </>
      }
    >
      <Toaster position="top-center" />
      <Suspense fallback={<div className="v-loader" />}>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              // 🌟 페이지 컴포넌트에 현재 언어 값을 주입합니다.
              element={React.cloneElement(element, {
                currentLangValue: selectedLang.value,
              })}
            />
          ))}
        </Routes>
      </Suspense>
    </MainLayout>
  );
}

const App = () => (
  <Router>
    <ThemeProvider>
      {/* 🌟 나중에 WordsProvider 내부에서 useWords를 쓰고 싶다면 
          여기로 selectedLang을 옮기는 구조로 발전시킬 수 있습니다. */}
      <WordsProvider>
        <ModalProvider>
          <AppContent />
        </ModalProvider>
      </WordsProvider>
    </ThemeProvider>
  </Router>
);

export default App;
