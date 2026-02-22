import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { ROUTES } from "@/routes/AppRoutes";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "home", label: "홈", icon: HiOutlineHome, path: ROUTES.HOME },
    {
      id: "decks",
      label: "단어장",
      icon: HiOutlineBookOpen,
      path: ROUTES.DECK_LIST,
    },
    {
      id: "scenarios",
      label: "시나리오",
      icon: HiOutlineChatBubbleLeftRight,
      path: ROUTES.SCENARIO_LIST,
    },
    // {
    //   id: "settings",
    //   label: "설정",
    //   icon: HiOutlineCog6Tooth,
    //   path: ROUTES.SETTINGS,
    // },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      {/* 중앙 정렬을 위한 컨테이너 (CSS에서 max-width 제어) */}
      <div className="nav-container">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={`nav-item ${active ? "active" : ""}`}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>

              {/* 활성화 표시 포인트 */}
              {/* {active && <div className="active-dot" />} */}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
