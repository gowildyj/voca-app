import React, { lazy } from "react";

/**
 * [ROUTES] 경로 상수 관리
 * 서비스 내 모든 URL 경로를 한곳에서 관리하여 오타를 방지합니다.
 */
export const ROUTES = {
  HOME: "/",
  DECK_LIST: "/decks",
  DECK_DETAIL: "/decks/:deckId", // 단어 목록 페이지
  STUDY: "/study/:deckId", // 플래시카드 학습 페이지
  SCENARIO_LIST: "/scenarios",
  SCENARIO_SESSION: "/scenario/:id", // 시나리오 인터랙티브 학습 페이지
  SETTINGS: "/settings",
  DESIGN: "/design",
};

/**
 * [Lazy Loading] 컴포넌트 동적 로딩
 * 초기 로딩 속도를 높이기 위해 필요한 시점에 페이지를 불러옵니다.
 */
const HomePage = lazy(() => import("@/pages/WordDeckList"));
const WordDeckList = lazy(() => import("@/pages/WordDeckList"));
const WordList = lazy(() => import("@/pages/WordList"));
const StudySession = lazy(() => import("@/pages/StudySession"));
const ScenarioList = lazy(() => import("@/pages/ScenarioList"));
const ScenarioPage = lazy(() => import("@/pages/ScenarioPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const DesignGuide = lazy(() => import("@/pages/DesignGuide"));
const NotFound = lazy(() => import("@/pages/NotFound"));

/**
 * [AppRoutesData] 라우트 구성 데이터
 * Header 타이틀 자동 생성이나 내비게이션 구성 시 활용됩니다.
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
    path: ROUTES.SETTINGS,
    element: <SettingsPage />,
    title: "설정",
  },
  {
    path: ROUTES.DESIGN,
    element: <DesignGuide />,
    title: "디자인 가이드",
  },
  {
    path: "*",
    element: <NotFound />,
    title: "페이지를 찾을 수 없음",
  },
];

/**
 * [generatePath] 동적 경로 생성 헬퍼
 * 예: generatePath(ROUTES.DECK_DETAIL, { deckId: 10 }) => "/decks/10"
 */
export const generatePath = (path, params) => {
  return Object.entries(params).reduce(
    (acc, [key, val]) => acc.replace(`:${key}`, val),
    path,
  );
};
