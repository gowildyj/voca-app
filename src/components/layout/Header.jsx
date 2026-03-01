import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineChevronLeft,
  HiOutlineCog6Tooth,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { AppRoutesData, ROUTES } from "@/routes/AppRoutes"; // ROUTES 가져오기
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

  // 홈 화면 여부 체크
  const isHome = location.pathname === "/";

  // 현재 라우트 정보 찾기
  const currentRoute = AppRoutesData.find((route) =>
    route.path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(route.path.split("/:")[0]),
  );

  // 🌟 [핵심 수정] 계층형 뒤로가기 로직
  const handleGoBack = () => {
    // 1. 현재 페이지가 '단어 목록(Deck Detail)'이라면 -> 무조건 홈(Deck List)으로 이동
    if (location.pathname.startsWith("/decks/")) {
      navigate(ROUTES.HOME, { replace: true }); // replace: true로 뒤로가기 기록 꼬임 방지
      return;
    }

    // 2. (확장 가능) 만약 설정 페이지나 기타 페이지라면 -> 히스토리백 or 홈
    // 예: 설정 페이지에서 왔다면 그냥 뒤로가기가 자연스러울 수 있음
    navigate(-1);
  };

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
            /* 🌟 onClick 핸들러를 handleGoBack으로 교체 */
            <button className="v-header-icon-btn" onClick={handleGoBack}>
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
