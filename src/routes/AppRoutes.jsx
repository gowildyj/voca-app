import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
const AdminLayout = lazy(() => import("@/admin/AdminLayout"));
const AdminContent = lazy(() => import("@/admin/AdminContent"));

/**
 * [ROUTES] 경로 상수 관리
 */
export const ROUTES = {
  HOME: "/",
  DECK_LIST: "/decks",
  DECK_DETAIL: "/decks/:deckId",
  STUDY: "/study/:deckId",
  SCENARIO_LIST: "/scenarios",
  SCENARIO_SESSION: "/scenario/:id",
  DESIGN: "/design",
  TEST: "/test",
};

/**
 * [Lazy Loading] 컴포넌트 동적 로딩
 */
const WordDeckList = lazy(() => import("@/pages/WordDeckList"));
const WordList = lazy(() => import("@/pages/WordList"));
const StudySession = lazy(() => import("@/pages/StudySession"));
const ScenarioList = lazy(() => import("@/pages/ScenarioList"));
const ScenarioPage = lazy(() => import("@/pages/ScenarioPage"));
const DesignGuide = lazy(() => import("@/pages/DesignGuide"));
const TEST = lazy(() => import("@/admin/Test"));

const NotFound = lazy(() => import("@/pages/NotFound"));

/**
 * [AppRoutesData] 라우트 구성 데이터
 */
export const AppRoutesData = [
  {
    path: ROUTES.HOME,
    element: <WordDeckList />,
    title: "동동구리",
  },
  {
    path: ROUTES.DECK_LIST,
    element: <WordDeckList />,
    title: "내 단어장",
  },
  {
    path: ROUTES.DECK_DETAIL,
    element: <WordList />,
    title: "단어 목록",
  },
  {
    path: ROUTES.STUDY,
    element: <StudySession />,
    title: "카드 학습",
  },
  {
    path: ROUTES.SCENARIO_LIST,
    element: <ScenarioList />,
    title: "시나리오 선택",
  },
  {
    path: ROUTES.SCENARIO_SESSION,
    element: <ScenarioPage />,
    title: "대화 연습",
  },
  {
    path: ROUTES.DESIGN,
    element: <DesignGuide />,
    title: "디자인 가이드",
  },
  {
    path: ROUTES.TEST,
    element: <TEST />,
    title: "TEST",
  },
  {
    path: "*",
    element: <Navigate to={ROUTES.HOME} replace />,
  },
  // {
  //   path: "*",
  //   element: <NotFound />,
  //   title: "페이지를 찾을 수 없음",
  // },
];

export const generatePath = (path, params) => {
  return Object.entries(params).reduce(
    (acc, [key, val]) => acc.replace(`:${key}`, val),
    path,
  );
};
