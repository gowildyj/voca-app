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
import { Toaster } from "react-hot-toast";

// 레이아웃 및 공통 UI
import MainLayout from "@/components/layout/MainLayout";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import FloatingActionBtn from "@/components/common/FloatingActionBtn";
import SelectorModal from "@/components/modals/SelectorModal";
import SettingsPage from "@/pages/SettingsPage";

// 라우트 데이터
import { AppRoutesData, ROUTES } from "@/routes/AppRoutes";

const PageLoader = () => (
  <div className="v-loading-screen flex-center" aria-live="polite">
    <div className="v-loader"></div>
    <p>준비 중입니다...</p>
  </div>
);

function AppContent() {
  const location = useLocation();

  // 1. 전역 모달 상태 관리
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 2. 경로별 UI 노출 제어 (Memoization으로 성능 최적화)
  const uiDisplay = useMemo(() => {
    const path = location.pathname;
    return {
      hideBottomNav: ["/study", "/scenario-session"].some((p) =>
        path.startsWith(p),
      ),
      hideHeader: ["/study", "/scenario-session"].some((p) =>
        path.startsWith(p),
      ),
    };
  }, [location.pathname]);

  const routes = useMemo(
    () =>
      process.env.NODE_ENV === "development"
        ? AppRoutesData
        : AppRoutesData.filter((r) => r.path !== ROUTES.DESIGN),
    [],
  );

  return (
    <MainLayout
      /* 헤더 조립: 설정 및 언어 변경 함수 전달 */
      header={
        !uiDisplay.hideHeader && (
          <Header
            onOpenLangModal={() => setIsLangModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )
      }
      /* 바텀바 조립 */
      bottomNav={!uiDisplay.hideBottomNav && <BottomNav />}
      /* 전역 모달/오버레이 조립 */
      modals={
        <>
          <SettingsPage
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
          <SelectorModal
            isOpen={isLangModalOpen}
            onClose={() => setIsLangModalOpen(false)}
            title="학습 언어 선택"
            options={[
              { word: "Spanish", meaning: "🇪🇸 스페인어" },
              { word: "English", meaning: "🇺🇸 영어" },
              { word: "French", meaning: "🇫🇷 프랑스어" },
            ]}
            selectedValue={{ word: "Spanish" }} // 실제로는 Context나 Store의 값 사용
            onSelect={(lang) => {
              console.log("Selected Lang:", lang);
              setIsLangModalOpen(false);
            }}
          />
        </>
      }
    >
      <Toaster
        position="top-center"
        toastOptions={{ className: "custom-toast", duration: 3000 }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          <Route
            path="*"
            element={
              <div className="p-20 text-center">페이지를 찾을 수 없습니다.</div>
            }
          />
        </Routes>
      </Suspense>

      <FloatingActionBtn />
    </MainLayout>
  );
}

const App = () => (
  <Router>
    <ThemeProvider>
      <WordsProvider>
        <ModalProvider>
          <AppContent />
        </ModalProvider>
      </WordsProvider>
    </ThemeProvider>
  </Router>
);

export default App;
