import React from "react";
import {
  X,
  PlayCircle,
  Volume2,
  Bell,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { useTheme, VALID_THEMES } from "@/contexts/ThemeContext";
import Button from "@/components/common/Button";
import "@/styles/pages/settingsPage.css";

const SettingsPage = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      id: "modern",
      label: "모던",
      color: "var(--color-modern)",
      desc: "차분한 네이비 그레이",
    },
    {
      id: "dark",
      label: "다크",
      color: "var(--color-dark)",
      desc: "편안한 미드나잇 블루",
    },
    {
      id: "bw",
      label: "흑백",
      color: "var(--color-bw)",
      desc: "클래식한 블랙 & 화이트",
    },
    {
      id: "pink",
      label: "핑크",
      color: "var(--color-pink)",
      desc: "말린 장미빛 인디핑크",
    },
    {
      id: "blue",
      label: "블루",
      color: "var(--color-blue)",
      desc: "청량한 스카이 블루",
    },
    {
      id: "green",
      label: "그린",
      color: "var(--color-green)",
      desc: "안정감을 주는 세이지 그린",
    },
    {
      id: "yellow",
      label: "옐로우",
      color: "var(--color-yellow)",
      desc: "포근한 버터 옐로우",
    },
    {
      id: "purple",
      label: "퍼플",
      color: "var(--color-purple)",
      desc: "우아한 라벤더 퍼플",
    },
    {
      id: "pastel",
      label: "파스텔",
      color: "var(--color-pastel)",
      desc: "달콤한 솜사탕 믹스",
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="v-settings-overlay">
      {/* 1. 헤더 */}
      <header className="v-settings-header">
        <button className="v-settings-close" onClick={onClose}>
          <X size={24} />
        </button>
        <h1 className="v-settings-title">설정</h1>
        <div style={{ width: 24 }} />
      </header>

      <main className="v-settings-content">
        {/* 2. 테마 선택 섹션 (미니 프리뷰 스타일) */}
        <section className="v-settings-section">
          <h3 className="v-settings-label">디자인 테마</h3>
          <div className="v-theme-selection-grid">
            {themeOptions.map((t) => (
              <button
                key={t.id}
                className={`v-theme-card ${theme === t.id ? "active" : ""}`}
                onClick={() => setTheme(t.id)}
              >
                <div
                  className="v-theme-mini-preview"
                  style={{ backgroundColor: t.color }}
                >
                  <div className="v-preview-dot" />
                  <div className="v-preview-line" />
                </div>
                <div className="v-theme-info">
                  <span className="v-theme-name">{t.label}</span>
                  <span className="v-theme-desc-mini">{t.desc}</span>
                </div>
                {theme === t.id && <div className="v-theme-check">✓</div>}
              </button>
            ))}
          </div>
        </section>

        {/* 3. 학습 설정 섹션 */}
        <section className="v-settings-section">
          <h3 className="v-settings-label">학습 설정</h3>
          <div className="v-settings-list-card">
            <div className="v-list-item">
              <div className="v-item-left">
                <PlayCircle size={20} className="v-item-icon" />
                <span>자동 재생 간격</span>
              </div>
              <div className="v-item-right">
                <select className="v-inline-select" defaultValue="2.0초">
                  <option value="1.0초">1.0초</option>
                  <option value="2.0초">2.0초</option>
                  <option value="3.0초">3.0초</option>
                </select>
                <ChevronRight size={16} />
              </div>
            </div>

            <div className="v-list-item">
              <div className="v-item-left">
                <Volume2 size={20} className="v-item-icon" />
                <span>선호 목소리</span>
              </div>
              <div className="v-segmented-control">
                <button className="active">여성</button>
                <button>남성</button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 기타 섹션 */}
        <section className="v-settings-section">
          <h3 className="v-settings-label">기타</h3>
          <div className="v-settings-list-card">
            <div className="v-list-item">
              <div className="v-item-left">
                <Bell size={20} className="v-item-icon" />
                <span>학습 알림</span>
              </div>
              <div className="v-toggle-wrapper">
                <input
                  type="checkbox"
                  id="noti-toggle"
                  className="v-real-toggle"
                  defaultChecked
                />
                <label htmlFor="noti-toggle" className="v-toggle-label" />
              </div>
            </div>

            <button
              className="v-list-item danger-text"
              onClick={() => alert("초기화하시겠습니까?")}
            >
              <div className="v-item-left">
                <RotateCcw size={20} />
                <span>학습 데이터 초기화</span>
              </div>
            </button>
          </div>
        </section>

        <div className="v-settings-footer">
          <p>v1.0.0 (Production Mode)</p>
          <p>© 2026 동동구리. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
