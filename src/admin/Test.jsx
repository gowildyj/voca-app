import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card/Card";
import { CardSection } from "@/components/common/Card/CardSection";
import { useContentStore } from "@/store/useContentStore";
import styles from "./Test.module.css";
import "@/styles/layout/layout.css";
import { toast } from "react-hot-toast";
import { logger } from "@/utils/logger";
import { Languages } from "lucide-react";

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
  const [newLang, setNewLang] = useState({
    id: null,
    code: "",
    name: "",
    emoji: "",
  });
  const [bulkMode, setBulkMode] = useState("list"); // list, add, edit
  const [bulkLanguage, setBulkLanguage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    code: "",
    name: "",
    emoji: "",
  });

  useEffect(() => {
    setEditingId(null);

    if (bulkMode === "edit" && languages.length > 0) {
      const text = languages
        .map((l) => `${l.id} | ${l.code} | ${l.name} | ${l.emoji || ""}`)
        .join("\n");
      setBulkLanguage(text);
    }
  }, [bulkMode]);

  // 등록된 언어 클릭시 input 채우기
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLang((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleEdit = (lang) => {
    setNewLang({
      id: lang.id,
      code: lang.code,
      name: lang.name,
      emoji: lang.emoji || "",
    });
  };

  // 언어개별등록
  const handleToSave = async () => {
    if (!newLang.code.trim() || !newLang.name.trim()) {
      toast.error("code and name are required.");
      return;
    }

    try {
      await upsertLanguage(newLang);
      setNewLang({ id: null, code: "", name: "", emoji: "" });
    } catch (error) {
      toast.error("failed");
    }
  };

  // 수정 모드 진입
  const startInlineEdit = (lang) => {
    setEditingId(lang.id);
    setEditFormData({
      code: lang.code,
      name: lang.name,
      emoji: lang.emoji || "",
    });
  };

  // 인라인 수정 저장
  const handleInlineSave = async (id) => {
    try {
      await upsertLanguage({ id, ...editFormData });
      await fetchLanguages();
      setEditingId(null);
      toast.success("수정 완료!");
    } catch (error) {
      toast.error("수정 실패");
    }
  };

  // 언어대량등록
  const handleLanguageBulkRegister = async (textData) => {
    if (!textData.trim()) {
      return toast.error("no data");
    }

    const lines = textData.split(/\r?\n/).filter((line) => line.trim() !== "");
    logger.start("[Bulk] Registering Languages", `${lines.length} items`);

    let successCount = 0;
    let failCount = 0;
    const failLines = [];

    // 반복으로 데이터 삽입
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split("|").map((item) => item.trim());

      if (parts.length < 2 || !parts[0] || !parts[1]) {
        logger.error(`[Bulk] Line ${i + 1} skip`, "코드 또는 이름 누락");
        failLines.push(`line ${i + 1}: ${line}`);
        failCount++;
        continue;
      }

      const [code, name, emoji] = parts;

      try {
        await upsertLanguage({ code, name, emoji: emoji || "" });
        successCount++;
      } catch (error) {
        logger.error(`[Bulk] DB Error: ${code}`, error.message);
        failLines.push(`${i + 1}행 (${code}): ${error.message}`);
        failCount++;
      }
    }
    if (failCount > 0) {
      toast.error(`${failCount}건 실패! 콘솔 로그나 하단 설명을 확인하세요.`);
      console.warn("실패 항목 리스트:", failLines);
    } else {
      toast.success(`${successCount}개 언어 등록 완료!`);
      setBulkLanguage("");
    }

    logger.success("[Bulk] Completed", { successCount, failCount });
  };

  // 언어대량수정위해 데이터 불러오기
  const loadLanguagesForEdit = () => {
    const text = languages
      .map((l) => `${l.id} | ${l.code} | ${l.name} | ${l.emoji || ""}`)
      .join("\n");
    setBulkLanguage(text);
    setBulkMode("edit");
  };

  // 언어대량수정
  const handleLanguageBulkUpdate = async (textData) => {
    if (!textData.trim()) return toast.error("수정할 데이터가 없습니다.");
    if (!window.confirm("입력한 내용으로 전체 데이터를 수정하시겠습니까?"))
      return;

    const lines = textData.split(/\r?\n/).filter((l) => l.trim() !== "");
    let successCount = 0;

    for (const line of lines) {
      const parts = line.split("|").map((item) => item.trim());

      // 수정 모드 규격: [0]ID | [1]Code | [2]Name | [3]Emoji
      const [id, code, name, emoji] = parts;

      if (id && code && name) {
        try {
          await upsertLanguage({ id, code, name, emoji: emoji || "" });
          successCount++;
        } catch (err) {
          logger.error(`[Update Fail] ID: ${id}`, err.message);
        }
      }
    }
    toast.success(`${successCount}건의 데이터가 성공적으로 수정되었습니다.`);
    await fetchLanguages();
  };

  // 언어개별삭제
  const handleToDelete = async (id, name) => {
    if (!window.confirm(`Are you sure to delete ${name}?`)) return;

    try {
      await deleteLanguage(id);
      toast.success("success");
      setNewLang({ id: null, code: "", name: "", emoji: "" });
    } catch (error) {
      toast.error("failed");
    }
  };

  // 카드섹션 아코디언 토글
  const toggleSection = (name) =>
    setOpenSection(openSection === name ? null : name);

  // preview 에 데이터 보여주기
  const wrapFetch = async (fetchFn, stateKey) => {
    setRawJson("🚀 Loading 데이터 요청 중...");

    try {
      await fetchFn();
      const currentState = useContentStore.getState();
      setRawJson(stateKey ? currentState[stateKey] : currentState);
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
                    placeholder="ID (자동생성)"
                    className={styles["styled-select"]}
                    value={newLang.id || ""}
                    readOnly
                  />
                  <input
                    placeholder="코드"
                    className={styles["styled-select"]}
                    name="code"
                    value={newLang.code}
                    onChange={handleChange}
                  />
                  <input
                    placeholder="이름"
                    className={styles["styled-select"]}
                    name="name"
                    value={newLang.name}
                    onChange={handleChange}
                  />
                  <input
                    placeholder="이모지"
                    className={styles["styled-select"]}
                    name="emoji"
                    value={newLang.emoji}
                    onChange={handleChange}
                  />
                  <Button
                    onClick={() => handleToSave()}
                    disabled={!newLang.code || !newLang.name}
                    variant="primary"
                    size="sm"
                  >
                    저장
                  </Button>
                </div>

                <div className={styles["lang-tag-list"]}>
                  {languages?.map((lang) => (
                    <span
                      key={lang.code}
                      className={styles["lang-badge"]}
                      onClick={() => handleEdit(lang)}
                    >
                      {lang.emoji || "🌐"} {lang.code}
                      <button
                        className={styles["delete-btn"]}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToDelete(lang.id, lang.name);
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles["admin-form-box"]}>
                <div className={styles["tab-group"]}>
                  <button
                    className={bulkMode === "list" ? styles.activeTab : ""}
                    onClick={() => setBulkMode("list")}
                  >
                    언어 목록 관리
                  </button>
                  <button
                    className={bulkMode === "add" ? styles.activeTab : ""}
                    onClick={() => {
                      setBulkMode("add");
                      setBulkLanguage("");
                    }}
                  >
                    언어 대량 등록
                  </button>
                  <button
                    className={bulkMode === "edit" ? styles.activeTab : ""}
                    onClick={loadLanguagesForEdit}
                  >
                    언어 대량 수정
                  </button>
                </div>
                {/* 1. 목록 관리 탭 */}
                {bulkMode === "list" && (
                  <div className={styles.tabContent}>
                    <h4 className={styles["admin-form-title"]}>
                      📋 등록된 언어 목록
                    </h4>
                    <div className={styles["table-wrapper"]}>
                      <table className={styles["admin-table"]}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>코드</th>
                            <th>언어명</th>
                            <th>이모지</th>
                            <th>관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {languages?.map((lang) => {
                            const isEditing = editingId === lang.id;
                            const displayData = isEditing ? editFormData : lang;

                            return (
                              <tr key={lang.id}>
                                <td
                                  className={styles.center}
                                  style={{ fontSize: "10px", color: "#999" }}
                                >
                                  {lang.id}
                                </td>
                                <td>
                                  <input
                                    className={styles["inline-input"]}
                                    value={displayData.code}
                                    disabled={!isEditing}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        code: e.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className={styles["inline-input"]}
                                    value={displayData.name}
                                    disabled={!isEditing}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        name: e.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td className={styles.center}>
                                  <input
                                    className={styles["inline-input"]}
                                    value={displayData.emoji || ""}
                                    disabled={!isEditing}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        emoji: e.target.value,
                                      })
                                    }
                                    placeholder="🌐"
                                    style={{
                                      width: "50px",
                                      textAlign: "center",
                                    }}
                                  />
                                </td>
                                <td className={styles.actions}>
                                  {isEditing ? (
                                    <>
                                      <button
                                        className={styles["save-inline-btn"]}
                                        onClick={() =>
                                          handleInlineSave(lang.id)
                                        }
                                      >
                                        저장
                                      </button>
                                      <button
                                        className={styles["cancel-inline-btn"]}
                                        onClick={() => setEditingId(null)}
                                      >
                                        취소
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        className={styles["edit-inline-btn"]}
                                        onClick={() => startInlineEdit(lang)}
                                      >
                                        수정
                                      </button>
                                      <button
                                        className={styles["delete-inline-btn"]}
                                        onClick={() =>
                                          handleToDelete(lang.id, lang.name)
                                        }
                                      >
                                        삭제
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. 대량 등록 & 3. 대량 수정 탭 (Textarea 공유) */}
                {(bulkMode === "add" || bulkMode === "edit") && (
                  <div className={styles.tabContent}>
                    <h4 className={styles["admin-form-title"]}>
                      {bulkMode === "add"
                        ? "🌐 언어 대량 등록"
                        : "🛠️ 언어 대량 수정"}
                    </h4>
                    <textarea
                      className={styles["bulk-textarea"]}
                      value={bulkLanguage}
                      onChange={(e) => setBulkLanguage(e.target.value)}
                      placeholder={
                        bulkMode === "add"
                          ? "언어코드 | 언어이름 | 이모지\nko-KR | 한국어 | 🇰🇷"
                          : "아이디 | 언어코드 | 언어이름 | 이모지\n(불러오기 버튼을 이용하세요)"
                      }
                      rows={10}
                    />
                    <div className={styles["button-group"]}>
                      <Button
                        variant="primary"
                        onClick={() =>
                          bulkMode === "add"
                            ? handleLanguageBulkRegister(bulkLanguage)
                            : handleLanguageBulkUpdate(bulkLanguage)
                        }
                        size="sm"
                      >
                        {bulkMode === "add"
                          ? "일괄 등록 저장"
                          : "일괄 수정 저장"}
                      </Button>
                    </div>
                  </div>
                )}
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
          {/* {openSection === "bulk" && (
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
          )} */}
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
