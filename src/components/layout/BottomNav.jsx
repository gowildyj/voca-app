import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
import { ROUTES } from "@/routes/AppRoutes";
import "@/styles/layout/bottomNav.css"; // CSS 파일 경로 확인 부탁드려요!

/**
 * BottomNav: 앱의 메인 네비게이션 바
 * Stella님의 요청에 따라 마지막 아이콘을 현재 선택된 언어로 변경했습니다.
 */
const BottomNav = ({ currentLangIcon, onOpenLangModal }) => {
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

    {
      id: "language",
      // label: "언어",
      isCustom: true,
    },
  ];

  const isActive = (path) => {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {navItems.map((item) => {
          const active = isActive(item.path);

          // 언어 선택 버튼일 경우와 일반 메뉴일 경우를 분기합니다.
          const handleClick = () => {
            if (item.isCustom) {
              onOpenLangModal();
            } else {
              navigate(item.path);
            }
          };

          return (
            <button
              key={item.id}
              className={`nav-item ${active ? "active" : ""} ${item.isCustom ? "lang-btn" : ""}`}
              onClick={handleClick}
              aria-label={item.label}
            >
              <div className="icon-wrapper">
                {item.isCustom ? (
                  <span className="nav-lang-emoji" style={{ fontSize: "25px" }}>
                    {currentLangIcon}
                  </span>
                ) : (
                  <item.icon className="nav-icon" />
                )}
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
