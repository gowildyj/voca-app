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
    fetchStatsInfoByLang,
    fetchItemsByFilter,
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
          <CardSection
            title="1. 기초 데이터 (Foundation)"
            description="언어, 태그, 학습 통계"
          >
            <Button onClick={fetchLanguages} size="sm">
              언어 목록 조회
            </Button>

            <Button onClick={() => fetchTags()} size="sm">
              태그 조회
            </Button>

            <Button onClick={() => fetchTagsByLang(selectedLang)} size="sm">
              {selectedLang || "언어별"} 태그 조회
            </Button>

            <Button
              onClick={() => fetchTagsInfoByLang("ko-KR", selectedLang)}
              size="sm"
            >
              태그 정보 조회
            </Button>

            <Button
              onClick={() => fetchStatsInfoByLang(selectedLang)}
              size="sm"
            >
              학습 통계 필터
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
          </CardSection>

          <CardSection
            title="2. 핵심 콘텐츠 (Word/Sentence)"
            description="* 아이템(단어/문장) 관련 CRUD 테스트"
          >
            {/* <Button onClick={addTestWord} variant="secondary" size="sm">
              [INSERT] 테스트 단어 추가
            </Button> */}
            <Button
              onClick={() =>
                fetchItemsByFilter({
                  learningLang: selectedLang,
                  nativeLang: "ko-KR",
                  // userId: currentUser?.id,
                  itemType: "SENTENCE",
                })
              }
              size="sm"
            >
              [SELECT] 단어장 조회
            </Button>
          </CardSection>

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
