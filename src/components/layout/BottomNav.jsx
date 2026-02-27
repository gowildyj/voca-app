import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
import { ROUTES } from "@/routes/AppRoutes";
import "@/styles/layout/bottomNav.css";

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
    { id: "language", label: "언어", isCustom: true },
  ];

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {navItems.map((item) => {
          const active = item.path
            ? item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path)
            : false;

          return (
            <button
              key={item.id}
              className={`nav-item ${active ? "active" : ""}`}
              onClick={
                item.isCustom ? onOpenLangModal : () => navigate(item.path)
              }
            >
              <div className="icon-wrapper">
                {item.isCustom ? (
                  <span className="nav-lang-emoji" style={{ fontSize: "22px" }}>
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
