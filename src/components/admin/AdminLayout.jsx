// src/components/admin/AdminLayout.jsx

import React from "react";
import "@/styles/admin/AdminCommon.css";

const AdminLayout = ({ title, children }) => {
  return (
    <div className="admin-page-container">
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827" }}>
          {title}
        </h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;
