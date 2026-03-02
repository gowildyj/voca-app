import React, { Suspense, useMemo, useState, useEffect, lazy } from "react";
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
import { useGlobalStore } from "@/store/useGlobalStore"; // 🌟 스토어 임포트 확인

// 관리자 페이지 Lazy Load
const AdminLayout = lazy(() => import("@/admin/AdminLayout"));
const AdminLanguages = lazy(() => import("@/admin/AdminLanguages"));
const AdminTags = lazy(() => import("@/admin/AdminTags"));
const AdminItems = lazy(() => import("@/admin/AdminItems"));
const AdminScenarios = lazy(() => import("@/admin/AdminScenarios"));

/**
 * [UserLayout] 일반 사용자용 레이아웃 래퍼
 */
const UserLayout = ({
  selectedLang,
  isLangModalOpen,
  isSettingsOpen,
  setIsLangModalOpen,
  setIsSettingsOpen,
  handleLanguageChange,
}) => {
  const location = useLocation();

  const uiDisplay = useMemo(() => {
    const path = location.pathname;
    const isStudyPath = ["/study", "/scenario-session"].some((p) =>
      path.startsWith(p),
    );
    return { hideBottomNav: isStudyPath, hideHeader: isStudyPath };
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
      <Outlet />
    </MainLayout>
  );
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, learningLang, setLearningLang, fetchLanguages } =
    useGlobalStore();

  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    fetchLanguages();
  }, []);

  // [상태 관리] 현재 선택된 언어 객체 계산
  const selectedLang = useMemo(() => {
    return (
      LANG_OPTIONS.find((l) => l.value === learningLang) ||
      LANG_OPTIONS.find((l) => l.value === DEFAULT_LANG) ||
      LANG_OPTIONS[0]
    );
  }, [learningLang]);

  const routes = useMemo(() => AppRoutesData, []);

  const handleLanguageChange = (langId) => {
    setLearningLang(langId);
    showToast.success(`언어가 변경되었습니다!`);
    setIsLangModalOpen(false);
    // 리다이렉트 로직...
  };

  return (
    <>
      <Toaster {...toastConfig} />
      <Suspense fallback={<div className="v-page-transition-loader" />}>
        <Routes>
          {/* 관리자 라우트 보호 */}
          <Route
            path="/admin"
            element={
              currentUser ? <AdminLayout /> : <Navigate to="/" replace />
            }
          >
            <Route index element={<Navigate to="items" replace />} />
            <Route path="languages" element={<AdminLanguages />} />
            <Route path="hashtags" element={<AdminTags />} />
            <Route path="items" element={<AdminItems />} />
            <Route path="scenarios" element={<AdminScenarios />} />
          </Route>

          {/* 일반 사용자 라우트 */}
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
              <Route key={path} path={path} element={element} />
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
