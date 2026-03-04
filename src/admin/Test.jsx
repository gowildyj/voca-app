import React, { useState } from "react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card/Card";
import { CardSection } from "@/components/common/Card/CardSection";
import { useContentStore } from "@/store/useContentStore";
import styles from "./Test.module.css";
import "@/styles/layout/layout.css";

const Test = () => {
  const {
    languages,
    fetchLanguages,
    upsertLanguage,
    deleteLanguage,
    tags,
    fetchTags,
    fetchTagsByLang,
    fetchTagsInfoByLang,
    fetchStatsInfoByLang,
    fetchItemsByFilter,
    handleBulkRegister,
  } = useContentStore();

  const [rawJson, setRawJson] = useState(null);
  const [openSection, setOpenSection] = useState("foundation");
  const [learningLang, setlearningLang] = useState("");
  const [itemType, setItemType] = useState("");
  const [nativeLang, setnativeLang] = useState("en-US");
  const [newLang, setNewLang] = useState({ code: "", name: "", emoji: "" });
  const [bulkText, setBulkText] = useState("");

  const toggleSection = (name) =>
    setOpenSection(openSection === name ? null : name);

  const wrapFetch = async (fetchFn, stateKey) => {
    setRawJson("🚀 Loading 데이터 요청 중...");

    try {
      await fetchFn();

      setTimeout(() => {
        const currentState = useContentStore.getState();
        setRawJson(stateKey ? currentState[stateKey] : currentState);
      }, 100);
    } catch (error) {
      setRawJson({
        status: "Error ❌",
        message: error.message || "알 수 없는 에러가 발생했습니다.",
        stack: error.stack,
      });
      console.error("Fetch Error:", error);
    }
  };

  return (
    <div className="v-app-layout">
      <div className="v-page-container">
        <header className={styles["p-test-header"]}>
          <h1 className={styles["p-test-title"]}>🧪 DB 통합 테스트</h1>
        </header>

        <div
          className={`${styles.accordion} ${openSection === "foundation" ? styles.active : ""}`}
        >
          <div
            className={styles.accHeader}
            onClick={() => toggleSection("foundation")}
          >
            <span>1. 기초 데이터 (언어/태그)</span>
            <span>{openSection === "foundation" ? "▲" : "▼"}</span>
          </div>
          {openSection === "foundation" && (
            <div className={styles.accContent}>
              <div className={styles["button-group"]}>
                <Button
                  onClick={() => wrapFetch(fetchLanguages, "languages")}
                  size="sm"
                >
                  언어전체목록
                </Button>
                <Button onClick={() => wrapFetch(fetchTags, "tags")} size="sm">
                  태그전체목록
                </Button>
                <Button
                  onClick={() =>
                    wrapFetch(() => fetchTagsByLang(nativeLang), "tags")
                  }
                  size="sm"
                >
                  언어별태그목록
                </Button>
                <Button
                  onClick={() =>
                    wrapFetch(
                      () => fetchTagsInfoByLang(learningLang, nativeLang),
                      "tags",
                    )
                  }
                  size="sm"
                >
                  언어별태그정보
                </Button>
                <Button
                  onClick={() =>
                    wrapFetch(
                      () => fetchStatsInfoByLang(learningLang),
                      "statsInfo",
                    )
                  }
                  size="sm"
                >
                  언어별필터정보
                </Button>
              </div>

              <div className={styles["admin-form-box"]}>
                <h4 className={styles["admin-form-title"]}>
                  🌐 언어 등록/수정
                </h4>
                <div className={styles["select-group"]}>
                  <input
                    placeholder="코드"
                    className={styles["styled-select"]}
                    value={newLang.code}
                    onChange={(e) =>
                      setNewLang({ ...newLang, code: e.target.value })
                    }
                  />
                  <input
                    placeholder="이름"
                    className={styles["styled-select"]}
                    value={newLang.name}
                    onChange={(e) =>
                      setNewLang({ ...newLang, name: e.target.value })
                    }
                  />
                  <input
                    placeholder="이모지"
                    className={styles["styled-select"]}
                    value={newLang.emoji}
                    onChange={(e) =>
                      setNewLang({ ...newLang, emoji: e.target.value })
                    }
                  />
                  <Button
                    onClick={() => {
                      upsertLanguage(newLang);
                      setNewLang({ code: "", name: "", emoji: "" });
                    }}
                    variant="primary"
                    size="sm"
                  >
                    저장
                  </Button>
                </div>

                <div className={styles["lang-tag-list"]}>
                  {languages?.map((lang) => (
                    <span key={lang.code} className={styles["lang-badge"]}>
                      {lang.emoji} {lang.code}
                      <button
                        className={styles["delete-btn"]}
                        onClick={() => deleteLanguage(lang.code)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 필터용 셀렉트 박스 */}
              <div
                className={styles["select-group"]}
                style={{ marginTop: "15px" }}
              >
                <select
                  className={styles["styled-select"]}
                  value={learningLang}
                  onChange={(e) => setlearningLang(e.target.value)}
                >
                  <option value="">학습 언어 선택</option>
                  {languages?.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.emoji} {l.name}
                    </option>
                  ))}
                </select>
                <select
                  className={styles["styled-select"]}
                  value={nativeLang}
                  onChange={(e) => setnativeLang(e.target.value)}
                >
                  <option value="">모국어 선택</option>
                  {languages?.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.emoji} {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 대량 등록 */}
        <div
          className={`${styles.accordion} ${openSection === "bulk" ? styles.active : ""}`}
        >
          <div
            className={styles.accHeader}
            onClick={() => toggleSection("bulk")}
          >
            <span>2. 핵심 콘텐츠 (대량 등록)</span>
            <span>{openSection === "bulk" ? "▲" : "▼"}</span>
          </div>
          {openSection === "bulk" && (
            <div className={styles.accContent}>
              <textarea
                className={styles["bulk-textarea"]}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="코드 | 단어 | 예문"
              />

              <select
                className={styles["styled-select"]}
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
              >
                <option value="">itemType</option>
                <option value="WORD">단어</option>
                <option value="SENTENCE">문장</option>
              </select>

              <div
                className={styles["button-group"]}
                style={{ marginTop: "10px" }}
              >
                <Button
                  onClick={() => handleBulkRegister(bulkText)}
                  variant="secondary"
                  size="sm"
                >
                  대량등록
                </Button>
                <Button
                  onClick={() =>
                    wrapFetch(
                      () =>
                        fetchItemsByFilter({
                          learningLang,
                          nativeLang,
                          itemType: itemType,
                        }),
                      "items",
                    )
                  }
                  size="sm"
                >
                  아이템 조회
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 3. 프리뷰 영역 */}
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <span className={styles.panelTitle}>🔍 RAW DATA PREVIEW</span>
            <button
              onClick={() => setRawJson(null)}
              className={styles.clearBtn}
            >
              Clear
            </button>
          </div>
          <div className={styles.previewBody}>
            <pre>
              {rawJson ? JSON.stringify(rawJson, null, 2) : "결과 대기 중..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
