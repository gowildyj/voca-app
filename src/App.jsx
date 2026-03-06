import React, { Suspense } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { Toaster } from "react-hot-toast";
import { toastConfig } from "@/utils/toast";

// 레이아웃 & 라우트 설정
import AppRoutes from "@/routes/AppRoutes";
// import UserLayout from "@/components/layout/UserLayout";
import AdminLayout from "@/components/layout/AdminLayout";

const AppContent = () => {
  return (
    <Suspense fallback={<div className="loading-screen">로딩 중...</div>}>
      <Routes>
        {/* --- 사용자(User) 경로 --- */}
        {/* <Route element={<UserLayout />}>
          {AppRoutes.user.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route> */}

        {/* --- 관리자(Admin) 경로 --- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="languages" replace />} />
          {AppRoutes.admin.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* 404 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <ModalProvider>
    <Router>
      <ThemeProvider>
        <Toaster {...toastConfig} />
        <AppContent />
      </ThemeProvider>
    </Router>
  </ModalProvider>
);

export default App;
