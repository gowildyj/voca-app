import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";

const MainLayout = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("app-theme") || "system",
  );

  useEffect(() => {
    const root = document.documentElement;
    theme === "system"
      ? root.removeAttribute("data-theme")
      : root.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  return (
    <div className="App">
      <nav className="app-nav">
        <div className="flex-center" style={{ gap: "8px" }}>
          <Settings size={18} opacity={0.5} />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="theme-select"
          >
            <option value="system">자동 (시스템 설정)</option>
            <option value="dark">다크 모드 🌙</option>
            <option value="modern">Modern (Light)</option>
            <option value="bw">B&W</option>
            <option value="pastel">Pastel</option>
            <option value="pink">Pink</option>
            <option value="blue">Blue</option>
          </select>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;
