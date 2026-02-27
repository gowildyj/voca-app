import React from "react";

const MainLayout = ({ children, header, bottomNav, modals }) => {
  return (
    <div className="v-app-layout">
      {header}
      <main className="v-page-container">{children}</main>
      {bottomNav}
      {modals}
    </div>
  );
};

export default MainLayout;
