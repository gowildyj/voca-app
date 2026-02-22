// src/components/layout/BottomNav.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, MessageSquare } from "lucide-react";
import "@/styles/layout/bottomNav.css";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로가 탭과 일치하는지 확인하는 함수
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${isActive("/") ? "active" : ""}`}
        onClick={() => navigate("/")}
      >
        <Home size={24} />
        <span>홈</span>
      </button>

      <button
        className={`nav-item ${isActive("/decks") ? "active" : ""}`}
        onClick={() => navigate("/decks")}
      >
        <BookOpen size={24} />
        <span>단어장</span>
      </button>

      <button
        className={`nav-item ${isActive("/scenarios") ? "active" : ""}`}
        onClick={() => navigate("/scenarios")}
      >
        <MessageSquare size={24} />
        <span>상황대화</span>
      </button>
    </nav>
  );
};

export default BottomNav;
