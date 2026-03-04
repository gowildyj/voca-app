// src/admin/Test.jsx
import React, { useState } from "react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card/Card";
import { CardSection } from "@/components/common/Card/CardSection";
// import { useGlobalStore } from "@/store/useGlobalStore";
import { useContentStore } from "@/store/useContentStore";
import styles from "./Test.module.css"; // 페이지 전용 CSS
import "@/styles/layout/layout.css";
import { StyledInput } from "@/components/common/FormElements";

const Test = () => {
  const {
    languages,
    fetchLanguages,
    fetchTags,
    fetchTagsByLang,
    fetchTagsInfoByLang,
  } = useContentStore();

  const [selectedLang, setSelectedLang] = useState("");

  return (
    <div className="v-app-layout">
      <div className="v-page-container">
        <header className={styles["p-test-header"]}>
          <h1 className={styles["p-test-title"]}>🧪 DB 연결 테스트</h1>
          <p className={styles["p-test-subtitle"]}>
            F12 개발자 도구의 콘솔을 확인하세요. logger가 데이터를 보여줍니다.
          </p>
        </header>

        <Card>
          <CardSection title="1. 기초 데이터 (Foundation)">
            <Button onClick={fetchLanguages} size="sm">
              언어 목록 조회
            </Button>
            <Button onClick={() => fetchTags()} size="sm">
              태그 조회
            </Button>
            <Button onClick={() => fetchTagsByLang(selectedLang)} size="sm">
              {selectedLang || "언어별"} 태그 조회
            </Button>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
            >
              <option value="">select</option>
              {languages?.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.emoji} {lang.name}
                </option>
              ))}
            </select>

            <Button
              onClick={() => fetchTagsInfoByLang("ko-KR", "en-US")}
              size="sm"
            >
              태그 정보 조회
            </Button>
          </CardSection>

          {/* <CardSection
            title="2. 핵심 콘텐츠 (Word/Sentence)"
            description="* 단어 추가 시 Master, Translation, Reading 테이블에 동시 입력됩니다."
          >
            <Button onClick={addTestWord} variant="secondary" size="sm">
              [INSERT] 테스트 단어 추가
            </Button>
            <Button onClick={() => fetchStudyItems("en", "ko")} size="sm">
              [SELECT] 단어장 조회
            </Button>
          </CardSection> */}

          {/* <CardSection title="3. 시나리오 (Scenario)">
            <Button onClick={() => fetchScenarios("en")} size="sm">
              시나리오 목록 조회
            </Button>
          </CardSection> */}

          {/* <CardSection title="4. 사용자 (User)" isLast={true}>
            <Button onClick={createGuestUser} variant="danger" size="sm">
              비로그인 유저 생성
            </Button>
          </CardSection> */}
        </Card>
      </div>
    </div>
  );
};

export default Test;
