import React from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import Button from "@/components/common/Button";
import "@/styles/pages/notFound.css"; // 스타일 파일 필요 시 생성

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="v-not-found-container">
      <div className="v-not-found-content">
        <HiOutlineExclamationTriangle
          size={64}
          color="#fbbf24"
          style={{ marginBottom: "16px" }}
        />
        <h2 className="v-not-found-title">페이지를 찾을 수 없어요 😢</h2>
        <p className="v-not-found-desc">
          주소가 잘못 입력되었거나,
          <br />더 이상 존재하지 않는 페이지입니다.
        </p>
        <div style={{ marginTop: "32px", width: "100%", maxWidth: "200px" }}>
          <Button fullWidth onClick={() => navigate("/", { replace: true })}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
