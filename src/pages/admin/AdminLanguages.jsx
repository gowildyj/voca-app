import React, { useState, useEffect, useMemo } from "react";
import Button from "@/components/common/Button/Button";
import SearchBar from "@/components/common/SearchBar/SearchBar";
import { useContentStore } from "@/store/useContentStore";
import { toast } from "react-hot-toast";
import { logger } from "@/utils/logger";
import { Globe } from "lucide-react";
import styles from "./AdminLanguages.module.css";

const AdminLanguages = () => {
  const { languages, fetchLanguages, upsertLanguage, deleteLanguage } =
    useContentStore();

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
  const [searchTerm, setSearchTerm] = useState("");

  // 검색 필터링 로직
  const filteredLanguages = useMemo(() => {
    if (!searchTerm.trim()) return languages;
    const lower = searchTerm.toLowerCase();
    return languages?.filter(
      (lang) =>
        lang.name.toLowerCase().includes(lower) ||
        lang.code.toLowerCase().includes(lower) ||
        (lang.id && lang.id.includes(lower)),
    );
  }, [languages, searchTerm]);

  useEffect(() => {
    setEditingId(null);
    if (bulkMode === "edit" && languages.length > 0) {
      setBulkLanguage(
        languages
          .map((l) => `${l.id} | ${l.code} | ${l.name} | ${l.emoji || ""}`)
          .join("\n"),
      );
    }
  }, [bulkMode, languages]);

  const loadLanguagesForEdit = () => {
    const text = languages
      .map((l) => `${l.id} | ${l.code} | ${l.name} | ${l.emoji || ""}`)
      .join("\n");
    setBulkLanguage(text);
    setBulkMode("edit");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLang((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (lang) => {
    setNewLang({
      id: lang.id,
      code: lang.code,
      name: lang.name,
      emoji: lang.emoji || "",
    });
  };

  const handleToSave = async () => {
    if (!newLang.code.trim() || !newLang.name.trim())
      return toast.error("코드와 이름을 입력해주세요.");
    try {
      await upsertLanguage(newLang);
      setNewLang({ id: null, code: "", name: "", emoji: "" });
      toast.success("저장 완료!");
    } catch (error) {
      toast.error("저장 실패");
    }
  };

  const startInlineEdit = (lang) => {
    setEditingId(lang.id);
    setEditFormData({
      code: lang.code,
      name: lang.name,
      emoji: lang.emoji || "",
    });
  };

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

  const handleLanguageBulkRegister = async (textData) => {
    if (!textData.trim()) return toast.error("데이터가 없습니다.");
    const lines = textData.split(/\r?\n/).filter((line) => line.trim() !== "");
    let successCount = 0;
    let failCount = 0;
    for (const line of lines) {
      const parts = line.split("|").map((item) => item.trim());
      if (parts.length < 2 || !parts[0] || !parts[1]) {
        failCount++;
        continue;
      }
      try {
        await upsertLanguage({
          code: parts[0],
          name: parts[1],
          emoji: parts[2] || "",
        });
        successCount++;
      } catch (error) {
        failCount++;
      }
    }
    if (failCount > 0) toast.error(`${failCount}건 실패`);
    if (successCount > 0) {
      toast.success(`${successCount}건 등록 완료!`);
      setBulkLanguage("");
    }
    await fetchLanguages();
  };

  const handleLanguageBulkUpdate = async (textData) => {
    if (!textData.trim()) return toast.error("데이터가 없습니다.");
    if (!window.confirm("입력한 내용으로 전체 데이터를 수정하시겠습니까?"))
      return;
    const lines = textData.split(/\r?\n/).filter((l) => l.trim() !== "");
    let successCount = 0;
    for (const line of lines) {
      const parts = line.split("|").map((item) => item.trim());
      const [id, code, name, emoji] = parts;
      if (id && code && name) {
        try {
          await upsertLanguage({ id, code, name, emoji: emoji || "" });
          successCount++;
        } catch (err) {}
      }
    }
    toast.success(`${successCount}건 수정 완료!`);
    await fetchLanguages();
  };

  const handleToDelete = async (id, name) => {
    if (!window.confirm(`${name}을(를) 삭제하시겠습니까?`)) return;
    try {
      await deleteLanguage(id);
      toast.success("삭제 성공");
      setNewLang({ id: null, code: "", name: "", emoji: "" });
    } catch (error) {
      toast.error("삭제 실패");
    }
  };

  return (
    <div className="v-app-layout">
      <div className={styles.pageContainer}>
        {/* 타이틀 영역 */}
        <header className={styles.header}>
          <div className={styles.headerIconWrap}>
            <Globe size={24} />
          </div>
          <div>
            <h1 className={styles.title}>Language Management</h1>
            <p className={styles.desc}>
              플랫폼의 언어 설정을 관리하고 대량으로 데이터를 제어합니다.
            </p>
          </div>
        </header>

        {/* 한개 등록  */}
        <div className={styles["admin-form-box"]}>
          <div className={styles.formHeader}>
            <h4 className={styles["admin-form-title"]}>🌐 언어 등록/수정</h4>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setNewLang({ id: null, code: "", name: "", emoji: "" })
              }
            >
              리셋
            </Button>
          </div>
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
              variant="primary"
              size="sm"
              onClick={handleToSave}
              disabled={!newLang.code || !newLang.name}
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

        {/* 🌟 3. 검색바 (적당한 위치에 독립적으로 배치) */}
        <div className={styles.searchWrapper}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="언어명 또는 코드 검색..."
          />
        </div>

        {/* 🌟 4. 데이터 관리 영역 (모던 탭 + Test 스타일 테이블) */}
        <div className={styles["admin-form-box"]}>
          {/* 모던 FilterTab 스타일 */}
          <div className={styles.modernTabs}>
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

          {/* Test 스타일 테이블 완벽 복구 */}
          {bulkMode === "list" && (
            <div>
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
                    {filteredLanguages?.map((lang) => {
                      const isEditing = editingId === lang.id;
                      const displayData = isEditing ? editFormData : lang;
                      return (
                        <tr key={lang.id}>
                          <td
                            className={styles.center}
                            style={{ fontSize: "10px", color: "#999" }}
                            title={lang.id}
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
                              style={{ textAlign: "center" }}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  emoji: e.target.value,
                                })
                              }
                              placeholder="🌐"
                            />
                          </td>
                          <td className={styles.actions}>
                            {isEditing ? (
                              <>
                                <button
                                  className={styles["save-inline-btn"]}
                                  onClick={() => handleInlineSave(lang.id)}
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

          {/* Test 스타일 대량 작업 폼 복구 */}
          {(bulkMode === "add" || bulkMode === "edit") && (
            <div>
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
              <div
                className={styles["button-group"]}
                style={{ marginTop: "10px" }}
              >
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    bulkMode === "add"
                      ? handleLanguageBulkRegister(bulkLanguage)
                      : handleLanguageBulkUpdate(bulkLanguage)
                  }
                >
                  {bulkMode === "add" ? "일괄 등록 저장" : "일괄 수정 저장"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLanguages;
