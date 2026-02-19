import React, { lazy } from "react";

// 페이지 레이지 로딩
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const WordList = lazy(() => import("@/pages/WordList"));
const StudySession = lazy(() => import("@/pages/StudySession"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ScenarioPage = lazy(() => import("@/pages/ScenarioPage"));

export const AppRoutesData = [
  { path: "/", element: <Dashboard /> },
  { path: "/list/:deckName", element: <WordList /> },
  { path: "/study/:deckName", element: <StudySession /> },
  { path: "/scenario", element: <ScenarioPage /> },
  { path: "/settings", element: <Settings /> },
  { path: "*", element: <NotFound /> },
];
