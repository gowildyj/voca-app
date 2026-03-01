// src/pages/Test.jsx

import React from "react";
import Button from "@/components/common/Button";
import { useGlobalStore } from "@/store/useGlobalStore";
import "@/styles/layout/layout.css";

const Test = () => {
  // Store에서 액션들 꺼내오기
  const {
    fetchLanguages,
    fetchCategories,
    addTestWord,
    fetchStudyItems,
    fetchScenarios,
    createGuestUser,
  } = useGlobalStore();

  return (
    <div className="v-app-layout">
      <div className="v-page-container">
        <div className="v-page-section">
          <h1
            className="v-section-title"
            style={{ fontSize: "2rem", marginBottom: "20px" }}
          >
            🧪 DB 연결 테스트
          </h1>
          <p style={{ marginBottom: "20px", color: "#666" }}>
            F12 개발자 도구의 콘솔(Console)을 켜고 버튼을 눌러보세요.
            <br /> logger가 데이터를 보여줍니다.
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* 1. 기초 데이터 섹션 */}
            <section>
              <h2 className="v-section-title">1. 기초 데이터 (Foundation)</h2>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <Button onClick={fetchLanguages} size="sm">
                  언어 목록 조회
                </Button>
                <Button onClick={() => fetchCategories("ko")} size="sm">
                  카테고리 조회 (KO)
                </Button>
              </div>
            </section>

            <hr style={{ width: "100%", border: "0.5px solid #eee" }} />

            {/* 2. 콘텐츠 섹션 */}
            <section>
              <h2 className="v-section-title">
                2. 핵심 콘텐츠 (Word/Sentence)
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "10px",
                  flexWrap: "wrap",
                }}
              >
                <Button onClick={addTestWord} variant="secondary" size="sm">
                  [INSERT] 테스트 단어 추가 (Apple)
                </Button>
                <Button onClick={() => fetchStudyItems("en", "ko")} size="sm">
                  [SELECT] 단어장 조회 (EN 학습 / KO 모국어)
                </Button>
              </div>
              <p
                style={{ fontSize: "0.8rem", color: "#888", marginTop: "8px" }}
              >
                * 단어 추가 버튼을 누르면 Master, Translation, Reading 테이블에
                모두 데이터가 들어갑니다.
              </p>
            </section>

            <hr style={{ width: "100%", border: "0.5px solid #eee" }} />

            {/* 3. 시나리오 섹션 */}
            <section>
              <h2 className="v-section-title">3. 시나리오 (Scenario)</h2>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <Button onClick={() => fetchScenarios("en")} size="sm">
                  시나리오 목록 조회
                </Button>
              </div>
            </section>

            <hr style={{ width: "100%", border: "0.5px solid #eee" }} />

            {/* 4. 유저 섹션 */}
            <section>
              <h2 className="v-section-title">4. 사용자 (User)</h2>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <Button onClick={createGuestUser} variant="danger" size="sm">
                  비로그인 유저 생성 (Device ID)
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
