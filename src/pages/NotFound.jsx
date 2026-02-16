import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex-center"
      style={{ height: "80vh", flexDirection: "column", gap: "20px" }}
    >
      <h1 style={{ fontSize: "5rem" }}>404</h1>
      <p>길을 잃으셨나요? 스텔라와 동동이가 도와드릴게요! 🚀</p>
      <button
        onClick={() => navigate("/")}
        className="primary-btn"
        style={{ padding: "10px 20px", borderRadius: "12px" }}
      >
        홈으로 돌아가기
      </button>
    </div>
  );
};

export default NotFound;
