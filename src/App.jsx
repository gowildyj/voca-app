import React, { Suspense, useMemo, useState, lazy } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
  Outlet,
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

// 관리자 페이지 Lazy Load
const AdminLayout = lazy(() => import("@/admin/AdminLayout"));
const AdminLanguages = lazy(() => import("@/admin/AdminLanguages"));
const AdminTags = lazy(() => import("@/admin/AdminTags"));
const AdminItems = lazy(() => import("@/admin/AdminItems"));
const AdminScenarios = lazy(() => import("@/admin/AdminScenarios"));

/**
 * [UserLayout] 일반 사용자용 레이아웃 래퍼
 * - 관리자 페이지에는 Header/BottomNav가 보이지 않도록 분리함
 */
const UserLayout = ({
  // children,
  selectedLang,
  isLangModalOpen,
  isSettingsOpen,
  setIsLangModalOpen,
  setIsSettingsOpen,
  handleLanguageChange,
}) => {
  const location = useLocation();

  // 레이아웃 표시 여부 제어 (학습 화면 등에서는 헤더/푸터 숨김)
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
      {/* {children} */}
      <Outlet />
    </MainLayout>
  );
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // [상태 관리] 사용자 선택 언어 보존
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
    const isDeckDetail =
      currentPath.startsWith("/decks/") && currentPath !== ROUTES.DECK_LIST;
    const isStudySession = currentPath.startsWith("/study/");
    const isScenarioDetail =
      currentPath.startsWith("/scenarios/") &&
      currentPath !== ROUTES.SCENARIO_LIST;
    const isScenarioSession = currentPath.startsWith("/scenario-session/");

    if (isDeckDetail || isStudySession) {
      navigate(ROUTES.DECK_LIST);
    } else if (isScenarioDetail || isScenarioSession) {
      navigate(ROUTES.SCENARIO_LIST);
    }
  };

  return (
    <>
      <Toaster {...toastConfig} />
      <Suspense fallback={<div className="v-page-transition-loader" />}>
        <Routes>
          {/* 관리자 라우트 */}
          <Route
            path="/admin"
            element={
              currentUser ? <AdminLayout /> : <Navigate to="/" replace />
            }
          >
            {/* /admin 접속 시 content로 리다이렉트 */}
            <Route index element={<Navigate to="languages" replace />} />
            <Route path="languages" element={<AdminLanguages />} />
            <Route path="hashtags" element={<AdminTags />} />
            <Route path="items" element={<AdminItems />} />
            <Route
              path="scenarios"
              element={
                <Suspense fallback={<div>시나리오 에디터 로딩 중...</div>}>
                  <AdminScenarios />
                </Suspense>
              }
            />
            <Route path="tags" element={<div>태그 준비중</div>} />
          </Route>

          {/* 일반 사용자 라우트 (UserLayout 적용) */}
          <Route
            element={
              <UserLayout
                selectedLang={selectedLang}
                isLangModalOpen={isLangModalOpen}
                isSettingsOpen={isSettingsOpen}
                setIsLangModalOpen={setIsLangModalOpen}
                setIsSettingsOpen={setIsSettingsOpen}
                handleLanguageChange={handleLanguageChange}
              />
            }
          >
            {routes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={React.cloneElement(element, {
                  currentLangValue: selectedLang.value,
                  key: selectedLang.value,
                })}
              />
            ))}
          </Route>
        </Routes>
      </Suspense>
    </>
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
