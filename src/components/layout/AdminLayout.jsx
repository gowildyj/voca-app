import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // 1. 모바일에서 메뉴 클릭 시 또는 페이지 이동 시 자동 닫힘 로직
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  // 2. 브라우저 리사이즈 대응
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true); // PC는 기본 열림 상태 유지
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { path: "/admin/design", label: "design", icon: "🌐" },
    { path: "/admin/test", label: "test", icon: "🌐" },
    { path: "/admin/languages", label: "Languages", icon: "🌐" },
    { path: "/admin/languages2", label: "Languages2", icon: "🌐" },
    { path: "/admin/tags", label: "Hashtags", icon: "🏷️" },
    { path: "/admin/contents", label: "Contents", icon: "📚" },
  ];

  return (
    <div className={styles.container}>
      {/* 모바일 전용 오버레이: 배경을 어둡게 처리하고 클릭 시 닫힘 */}
      {isMobile && isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      )}

      {/* 사이드바 영역 */}
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.opened : styles.closed}`}
      >
        <div className={styles.sidebarInner}>
          <div className={styles.logoArea}>
            <div className={styles.brandIcon}>D</div>
            <span className={styles.brandName}>Admin</span>
          </div>

          <nav className={styles.nav}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLink} ${location.pathname.startsWith(item.path) ? styles.active : ""}`}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <Link to="/" className={styles.exitBtn}>
              🏠 Exit
            </Link>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main
        className={`${styles.main} ${!isMobile && isOpen ? styles.pushed : ""}`}
      >
        <header className={styles.header}>
          {/* 토글 버튼: 상태에 따라 화살표 방향 변경 */}
          <button
            className={styles.toggleBtn}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "◀" : "▶"}
          </button>
          <div className={styles.title}>
            {menuItems.find((m) => location.pathname.startsWith(m.path))
              ?.label || "Admin"}
          </div>
        </header>

        <section className={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
