import React, { Suspense } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ModalProvider } from "@/contexts/ModalProvider";
import { WordsProvider } from "@/contexts/WordsProvider";
import MainLayout from "@/components/layout/MainLayout";
import { AppRoutesData } from "@/routes/AppRoutes";

// 로딩
const PageLoader = () => (
  <div className="loading-screen flex-center">
    <div className="loader"></div>
    <p>잠시만 기다려주세요...</p>
  </div>
);

function AppContent() {
  return (
    <MainLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {AppRoutesData.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Suspense>
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
