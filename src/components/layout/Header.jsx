import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineChevronLeft,
  HiOutlineCog6Tooth,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { AppRoutesData } from "@/routes/AppRoutes";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import "@/styles/layout/header.css";

const Header = ({
  onOpenLangModal,
  onOpenSettings,
  currentLangIcon,
  currentLangLabel,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isVisible = useScrollDirection();
  const isHome = location.pathname === "/";

  const currentRoute = AppRoutesData.find((route) =>
    route.path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(route.path.split("/:")[0]),
  );

  return (
    <header className={`v-layout-header ${isVisible ? "" : "header-hidden"}`}>
      <div className="v-header-inner">
        <div className="v-header-side">
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

        <div className="v-header-center">
          <h1 className={`v-header-title ${isHome ? "v-app-logo" : ""}`}>
            {isHome ? "동동구리" : currentRoute?.title || "동동구리"}
          </h1>
        </div>

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
