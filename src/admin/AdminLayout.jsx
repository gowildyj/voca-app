import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  HiBars3,
  HiXMark,
  HiSquare3Stack3D,
  HiChatBubbleLeftRight,
  HiTag,
  HiGlobeAlt,
} from "react-icons/hi2";
import "@/styles/admin/adminLayout.css";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { name: "언어 관리1", path: "/admin/languages1", icon: <HiGlobeAlt /> },
    { name: "언어 관리", path: "/admin/languages", icon: <HiGlobeAlt /> },
    { name: "해시태그 관리", path: "/admin/hashtags", icon: <HiTag /> },
    { name: "콘텐츠 관리", path: "/admin/items", icon: <HiSquare3Stack3D /> },
    {
      name: "시나리오",
      path: "/admin/scenarios",
      icon: <HiChatBubbleLeftRight />,
    },
    { name: "태그 관리", path: "/admin/tags", icon: <HiTag /> },
  ];

  const handleNav = (path) => {
    navigate(path);
    setIsSidebarOpen(false); // 모바일에서 클릭 시 메뉴 닫기
  };

  return (
    <div className="admin-container">
      {/* 1. 모바일 헤더 */}
      <header className="admin-header">
        <div className="logo-area">ADMIN ⚙️</div>
        <button
          className="menu-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <HiXMark /> : <HiBars3 />}
        </button>
      </header>

      <div className="admin-body">
        {/* 2. 사이드바 (데스크탑: 고정 / 모바일: 토글) */}
        <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
          <nav>
            {menus.map((menu) => (
              <button
                key={menu.path}
                className={`nav-item ${location.pathname.startsWith(menu.path) ? "active" : ""}`}
                onClick={() => handleNav(menu.path)}
              >
                <span className="icon">{menu.icon}</span>
                {menu.name}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button onClick={() => navigate("/")} className="exit-btn">
              앱으로 돌아가기
            </button>
          </div>
        </aside>

        {/* 3. 메인 컨텐츠 영역 */}
        <main className="admin-main">
          <Outlet />
        </main>

        {/* 모바일 오버레이 */}
        {isSidebarOpen && (
          <div className="overlay" onClick={() => setIsSidebarOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
