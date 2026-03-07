import React, { useState, useEffect, useMemo } from "react";
import Button from "@/components/common/Button/Button";
import SearchBar from "@/components/common/SearchBar/SearchBar";
import { useContentStore } from "@/store/useContentStore";
import { toast } from "react-hot-toast";
import { Globe, X, Plus } from "lucide-react";
import styles from "./AdminLanguages2.module.css";

const AdminLanguages2 = () => {
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

  const handleToSave = async () => {
    if (!newLang.code.trim() || !newLang.name.trim())
      return toast.error("코드와 언어명을 입력해주세요.");
    try {
      await upsertLanguage(newLang);
      setNewLang({ id: null, code: "", name: "", emoji: "" });
      toast.success("저장되었습니다.");
    } catch (error) {
      toast.error("저장 실패");
    }
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
      } catch (e) {
        failCount++;
      }
    }
    if (failCount > 0) toast.error(`${failCount}건 실패`);
    if (successCount > 0) {
      toast.success(`${successCount}건 등록 완료`);
      setBulkLanguage("");
    }
    await fetchLanguages();
  };

  const handleLanguageBulkUpdate = async (textData) => {
    if (!textData.trim()) return toast.error("데이터가 없습니다.");
    if (!window.confirm("일괄 수정하시겠습니까?")) return;
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
    toast.success(`${successCount}건 수정 완료`);
    await fetchLanguages();
  };

  const handleToDelete = async (id, name) => {
    if (!window.confirm(`'${name}'을(를) 삭제하시겠습니까?`)) return;
    try {
      await deleteLanguage(id);
      toast.success("삭제 완료");
      setNewLang({ id: null, code: "", name: "", emoji: "" });
    } catch (error) {
      toast.error("삭제 실패");
    }
  };

  return (
    <div className="v-app-layout">
      <div className={styles.pageContainer}>
        {/* 헤더 */}
        <header className={styles.header}>
          <div className={styles.headerIconWrap}>
            <Globe size={24} />
          </div>
          <div>
            <h1 className={styles.title}>Language Settings</h1>
            <p className={styles.desc}>플랫폼 언어 리소스를 중앙 관리합니다.</p>
          </div>
        </header>

        {/* 🌟 카드 1: 빠른 등록 및 뱃지 영역 */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Plus size={18} /> 빠른 언어 등록
            </div>
            {newLang.id && (
              <button
                className={styles.resetBtn}
                onClick={() =>
                  setNewLang({ id: null, code: "", name: "", emoji: "" })
                }
              >
                입력 초기화 <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.inputGrid}>
            <div className={`${styles.inputGroup} ${styles.idGroup}`}>
              <label>ID (자동생성)</label>
              <input
                className={styles.readOnly}
                value={newLang.id || "-"}
                readOnly
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Code</label>
              <input
                name="code"
                value={newLang.code}
                onChange={handleChange}
                placeholder="ko-KR"
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Name</label>
              <input
                name="name"
                value={newLang.name}
                onChange={handleChange}
                placeholder="한국어"
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Emoji</label>
              <input
                name="emoji"
                value={newLang.emoji}
                onChange={handleChange}
                placeholder="🇰🇷"
              />
            </div>
            <div className={styles.btnGroup}>
              <Button
                variant="primary"
                onClick={handleToSave}
                disabled={!newLang.code || !newLang.name}
              >
                {newLang.id ? "수정 반영" : "신규 등록"}
              </Button>
            </div>
          </div>

          <div className={styles.badgeCloud}>
            {languages?.map((lang) => (
              <span
                key={lang.id}
                className={styles.badge}
                onClick={() =>
                  setNewLang({
                    id: lang.id,
                    code: lang.code,
                    name: lang.name,
                    emoji: lang.emoji || "",
                  })
                }
              >
                {lang.emoji} <strong>{lang.code}</strong>
                <button
                  className={styles.delBadge}
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
        </section>

        {/* 🌟 카드 2: 데이터 관리 영역 (탭 + 테이블) */}
        <section className={styles.card}>
          <div className={styles.cardToolbar}>
            <div className={styles.tabNav}>
              <button
                className={bulkMode === "list" ? styles.activeTab : ""}
                onClick={() => setBulkMode("list")}
              >
                목록 관리
              </button>
              <button
                className={bulkMode === "add" ? styles.activeTab : ""}
                onClick={() => {
                  setBulkMode("add");
                  setBulkLanguage("");
                }}
              >
                대량 등록
              </button>
              <button
                className={bulkMode === "edit" ? styles.activeTab : ""}
                onClick={loadLanguagesForEdit}
              >
                대량 수정
              </button>
            </div>
            {bulkMode === "list" && (
              <div className={styles.searchWrap}>
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="언어명 또는 코드 검색..."
                />
              </div>
            )}
          </div>

          <div className={styles.workspace}>
            {bulkMode === "list" ? (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: "100px" }}>ID</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th style={{ width: "80px", textAlign: "center" }}>
                        Emoji
                      </th>
                      <th style={{ width: "120px", textAlign: "center" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLanguages?.map((lang) => {
                      const isEditing = editingId === lang.id;
                      return (
                        <tr
                          key={lang.id}
                          className={isEditing ? styles.editingRow : ""}
                        >
                          <td className={styles.idText} title={lang.id}>
                            {lang.id.slice(0, 8)}
                          </td>
                          <td>
                            <input
                              className={styles.cellInput}
                              value={isEditing ? editFormData.code : lang.code}
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
                              className={styles.cellInput}
                              value={isEditing ? editFormData.name : lang.name}
                              disabled={!isEditing}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  name: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <input
                              className={`${styles.cellInput} ${styles.center}`}
                              value={
                                isEditing
                                  ? editFormData.emoji
                                  : lang.emoji || ""
                              }
                              disabled={!isEditing}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  emoji: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div className={styles.actionBtns}>
                              {isEditing ? (
                                <>
                                  <button
                                    className={styles.textBtnPrimary}
                                    onClick={() => handleInlineSave(lang.id)}
                                  >
                                    저장
                                  </button>
                                  <button
                                    className={styles.textBtnGhost}
                                    onClick={() => setEditingId(null)}
                                  >
                                    취소
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className={styles.textBtnPrimary}
                                    onClick={() => {
                                      setEditingId(lang.id);
                                      setEditFormData({
                                        code: lang.code,
                                        name: lang.name,
                                        emoji: lang.emoji || "",
                                      });
                                    }}
                                  >
                                    수정
                                  </button>
                                  <button
                                    className={styles.textBtnDanger}
                                    onClick={() => deleteLanguage(lang.id)}
                                  >
                                    삭제
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.bulkArea}>
                <textarea
                  className={styles.bulkTextarea}
                  value={bulkLanguage}
                  onChange={(e) => setBulkLanguage(e.target.value)}
                  placeholder={
                    bulkMode === "add"
                      ? "code | name | emoji\nko-KR | 한국어 | 🇰🇷"
                      : "id | code | name | emoji"
                  }
                />
                <div className={styles.bulkActions}>
                  <Button
                    variant="primary"
                    onClick={() =>
                      bulkMode === "add"
                        ? handleLanguageBulkRegister(bulkLanguage)
                        : handleLanguageBulkUpdate(bulkLanguage)
                    }
                  >
                    {bulkMode === "add" ? "대량 등록 실행" : "대량 수정 적용"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminLanguages2;
