import React, { lazy } from "react";

// 페이지 레이지 로딩
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const WordList = lazy(() => import("@/pages/WordList"));
const StudySession = lazy(() => import("@/pages/StudySession"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export const AppRoutesData = [
  { path: "/", element: <Dashboard /> },
  { path: "/list/:deckName", element: <WordList /> },
  { path: "/study/:deckName", element: <StudySession /> },
  { path: "/settings", element: <Settings /> },
  { path: "*", element: <NotFound /> },
];
