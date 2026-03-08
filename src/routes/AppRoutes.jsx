import { lazy } from "react";

// --- User Pages ---
// const Home = lazy(() => import("@/pages/user/Home"));
// const StudySession = lazy(() => import("@/pages/user/StudySession"));
// const Settings = lazy(() => import("@/pages/user/Settings"));

// --- Admin Pages ---
const Test = lazy(() => import("@/pages/admin/Test"));
const DesignGuide = lazy(() => import("@/pages/admin/DesignGuide"));
const AdminLanguages = lazy(() => import("@/pages/admin/AdminLanguages"));
const AdminTags = lazy(() => import("@/pages/admin/AdminTags"));
// const AdminItems = lazy(() => import("@/pages/admin/AdminItems"));

const AppRoutes = {
  user: [
    // { path: "/", element: <Home /> },
    // { path: "/study", element: <StudySession /> },
    // { path: "/settings", element: <Settings /> },
  ],
  admin: [
    { path: "test", element: <Test /> },
    { path: "languages", element: <AdminLanguages /> },
    { path: "tags", element: <AdminTags /> },
    { path: "design", element: <DesignGuide /> },
    { path: "tags", element: <AdminTags /> },
    // { path: "items", element: <AdminItems /> },
  ],
};

export default AppRoutes;
