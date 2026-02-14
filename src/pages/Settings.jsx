import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const THEME_OPTIONS = [
  { value: "system", label: "시스템 설정 따르기" },
  { value: "modern", label: "라이트" },
  { value: "dark", label: "다크" },
  { value: "bw", label: "흑백" },
  { value: "pastel", label: "파스텔" },
  { value: "pink", label: "핑크" },
  { value: "blue", label: "블루" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="settings-page">
      <header className="list-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="back-btn"
          aria-label="뒤로"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="list-header-title">설정</h1>
      </header>

      <section className="settings-section">
        <h2 className="settings-section-title">테마</h2>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="theme-select settings-select"
          aria-label="테마 선택"
        >
          {THEME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </section>
    </div>
  );
}
