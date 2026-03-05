// src/pages/Admin/AdminPage.jsx

import React, { useState } from "react";
import AdminLanguageSection from "./sections/AdminLanguageSection";
import AdminItemSection from "./sections/AdminItemSection"; // 2번 아코디언이 될 곳
import styles from "./Admin.module.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("foundation");

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <h1>⚙️ 시스템 관리자</h1>
      </header>

      {/* 메인 메뉴 탭 */}
      <div className={styles.tabGroup}>
        <button
          className={`${styles.tabButton} ${activeTab === "foundation" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("foundation")}
        >
          기초 데이터 관리
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "content" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("content")}
        >
          콘텐츠 일괄 등록
        </button>
      </div>

      <main className={styles.content}>
        {activeTab === "foundation" && <AdminLanguageSection />}
        {activeTab === "content" && <AdminItemSection />}
      </main>
    </div>
  );
};

export default AdminPage;
