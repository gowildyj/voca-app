// src/components/layout/Header.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineChevronLeft,
  HiOutlineCog6Tooth,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { AppRoutesData } from "@/routes/AppRoutes";
import "@/styles/layout/header.css";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const Header = ({
  onOpenLangModal,
  onOpenSettings,
  currentLangIcon,
  currentLangLabel,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isVisible = useScrollDirection();

  const currentRoute = AppRoutesData.find((route) => {
    if (route.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(route.path.split("/:")[0]);
  });

  const displayTitle = isHome ? "동동구리" : currentRoute?.title || "동동구리";

  return (
    <header className={`v-layout-header ${isVisible ? "" : "header-hidden"}`}>
      <div className="v-header-inner">
        {/* [Left] 언어 선택기 또는 뒤로가기 */}
        <div className="v-header-side left">
          {isHome ? (
            <div className="v-lang-selector-btn" onClick={onOpenLangModal}>
              <span className="v-lang-flag">{currentLangIcon}</span>
              <span className="v-lang-name">{currentLangLabel}</span>
              <HiOutlineChevronDown size={14} className="v-lang-arrow" />
            </div>
          ) : (
            <button className="v-header-icon-btn" onClick={() => navigate(-1)}>
              <HiOutlineChevronLeft size={26} />
            </button>
          )}
        </div>

        {/* [Center] 제목 영역 */}
        <div className="v-header-center">
          <h1 className={`v-header-title ${isHome ? "v-app-logo" : ""}`}>
            {displayTitle}
          </h1>
        </div>

        {/* [Right] 설정 버튼 */}
        <div className="v-header-side right">
          <button className="v-header-icon-btn" onClick={onOpenSettings}>
            <HiOutlineCog6Tooth size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
