import React from "react";

/**
 * MainLayout: 앱의 기본 프레임워크 역할
 * 헤더, 컨텐츠 영역, 바텀바의 위치를 정의합니다.
 */
const MainLayout = ({ children, header, bottomNav, modals }) => {
  return (
    <div className="v-app-layout">
      {/* 고정 헤더 영역 */}
      {header && <div className="v-layout-header">{header}</div>}

      {/* 메인 컨텐츠 영역 (스크롤 발생 구역) */}
      <main className="v-page-container">{children}</main>

      {/* 하단 네비게이션 영역 */}
      {bottomNav && <div className="v-layout-bottom">{bottomNav}</div>}

      {/* 포털 혹은 최상위에 뜰 모달들 */}
      {modals}
    </div>
  );
};

export default MainLayout;
