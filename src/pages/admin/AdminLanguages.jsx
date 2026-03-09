import React, { useState, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTranslation } from "react-i18next";
import Button from "@/components/common/Button/Button";
import SearchBar from "@/components/common/SearchBar/SearchBar";
import { useContentStore } from "@/store/useContentStore";
import { toast } from "react-hot-toast";
import { logger } from "@/utils/logger";
import { Globe } from "lucide-react";
import styles from "./AdminLanguages.module.css";

const AdminLanguages = () => {
  const { t } = useTranslation();

  const {
    languages,
    fetchLanguages,
    upsertLanguage,
    upsertLanguagesBulk,
    deleteLanguage,
    appLang,
    setAppLang,
  } = useContentStore(
    useShallow((state) => ({
      languages: state.languages,
      fetchLanguages: state.fetchLanguages,
      upsertLanguage: state.upsertLanguage,
      upsertLanguagesBulk: state.upsertLanguagesBulk,
      deleteLanguage: state.deleteLanguage,
      appLang: state.appLang,
      setAppLang: state.setAppLang,
    })),
  );

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
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLanguages();
  }, []);

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

  // 대량수정
  // useEffect(() => {
  //   setEditingId(null);
  //   if (bulkMode === "edit" && languages.length > 0) {
  //     setBulkLanguage(
  //       languages
  //         .map((l) => `${l.id} | ${l.code} | ${l.name} | ${l.emoji || ""}`)
  //         .join("\n"),
  //     );
  //   }
  // }, [bulkMode, languages]);

  // 대량수정 데이터 삽입
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

  // 목록 전체선택
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredLanguages.map((lang) => lang.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 목록 개별선택
  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // 대량수정 탭에 데이터 넣기
  const handleGoToBulkEdit = () => {
    if (selectedIds.length === 0) {
      return toast.error("수정할 항목을 선택해주세요.");
    }

    const selectedLangs = languages.filter((l) => selectedIds.includes(l.id));
    const text = selectedLangs
      .map((l) => `${l.id} | ${l.code} | ${l.name} | ${l.emoji || ""}`)
      .join("\n");

    setBulkLanguage(text);
    setBulkMode("edit");

    toast.success(`${selectedIds.length}개의 항목을 편집창으로 가져왔습니다.`);
  };

  // 개별 등록+수정
  const handleToSave = async () => {
    if (!newLang.code.trim() || !newLang.name.trim())
      return toast.error(t("required_fields"));
    try {
      await upsertLanguage(newLang);
      setNewLang({ id: null, code: "", name: "", emoji: "" });
      toast.success(t("success"));
    } catch (error) {
      toast.error(t("failed"));
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
      toast.success(t("success"));
    } catch (error) {
      toast.error(t("failed"));
    }
  };

  // 대량 등록/수정
  const handleLanguagesBulk = async (textData) => {
    if (!textData.trim()) return toast.error(t("required_fields"));
    if (!window.confirm(t("confirm"))) return;

    const lines = textData.split(/\r?\n/).filter((l) => l.trim() !== "");
    const payload = [];
    const errorLines = [];

    lines.forEach((line, index) => {
      const parts = line.split("|").map((item) => item.trim());

      if (bulkMode === "edit") {
        // 수정 모드: [id | code | name | emoji]
        const [id, code, name, emoji] = parts;
        if (!code || !name) {
          errorLines.push(index + 1);
        } else {
          payload.push({
            id: id === "null" ? null : id,
            code,
            name,
            emoji: emoji || "",
          });
        }
      } else {
        // 등록 모드: [code | name | emoji]
        const [code, name, emoji] = parts;
        if (!code || !name) {
          errorLines.push(index + 1);
        } else {
          payload.push({ code, name, emoji: emoji || "" });
        }
      }
    });

    if (errorLines.length > 0) {
      return toast.error(
        `${errorLines.join(", ")}번째 줄에 code 또는 name이 없어요!`,
      );
    }

    if (payload.length === 0) return toast.error("처리할 데이터가 없습니다.");
    const result = await upsertLanguagesBulk(payload);

    if (result) {
      toast.success(`${t("success")} ${result.length}`);
      setBulkLanguage("");
      setBulkMode("list");
    }
  };

  // 개별 삭제
  const handleToDelete = async (id, name) => {
    if (!window.confirm(`${name}을(를) 삭제하시겠습니까?`)) return;
    try {
      await deleteLanguage(id);
      toast.success(t("success"));
      setNewLang({ id: null, code: "", name: "", emoji: "" });
    } catch (error) {
      toast.error(t("failed"));
    }
  };

  // 대량 삭제
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return toast.error("선택된 항목이 없습니다.");
    if (
      !window.confirm(
        `선택한 ${selectedIds.length}개의 언어를 삭제하시겠습니까?`,
      )
    )
      return;

    try {
      await Promise.all(selectedIds.map((id) => deleteLanguage(id)));
      toast.success("선택된 항목이 삭제되었습니다.");
      setSelectedIds([]);
      fetchLanguages(); // 목록 갱신
    } catch (error) {
      toast.error("일부 항목 삭제에 실패했습니다.");
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
          <Button
            onClick={() => {
              setAppLang(appLang === "ko" ? "en" : "ko");
            }}
          >
            aaa
          </Button>
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

        {/*  검색바 (적당한 위치에 독립적으로 배치) */}
        <div className={styles.searchWrapper}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="언어명 또는 코드 검색..."
          />
        </div>

        {/*  데이터 관리 영역 */}
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
              // onClick={loadLanguagesForEdit}
              onClick={handleGoToBulkEdit}
            >
              언어 대량 수정
            </button>
          </div>

          {/* 일괄 처리 */}
          <div className={styles.batchControlWrapper}>
            {/* {bulkMode === "list" && ( */}
            <div
              className={`${styles.batchControlBar} ${selectedIds.length > 0 ? styles.active : ""}`}
            >
              <div className={styles.batchInfo}>
                <span>
                  {selectedIds.length > 0
                    ? `${selectedIds.length}개 선택됨`
                    : "선택된 항목이 없습니다"}
                </span>
              </div>

              <div className={styles.batchButtons}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGoToBulkEdit}
                  disabled={selectedIds.length <= 0 || bulkMode !== "list"}
                >
                  선택 항목 대량 수정
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.length <= 0 || bulkMode !== "list"}
                >
                  선택 삭제
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                  disabled={selectedIds.length <= 0 || bulkMode !== "list"}
                >
                  리셋
                </Button>
              </div>
            </div>
            {/* )} */}
          </div>

          {/* 테이블 */}
          {bulkMode === "list" && (
            <div>
              <div className={styles["table-wrapper"]}>
                <table className={styles["admin-table"]}>
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}>
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            selectedIds.length === filteredLanguages.length &&
                            filteredLanguages.length > 0
                          }
                        />
                      </th>
                      <th style={{ width: "50px" }}>No.</th>
                      <th>ID</th>
                      <th>코드</th>
                      <th>언어명</th>
                      <th>이모지</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLanguages?.map((lang, index) => {
                      const isEditing = editingId === lang.id;
                      const displayData = isEditing ? editFormData : lang;
                      const isSelected = selectedIds.includes(lang.id);

                      return (
                        <tr
                          key={lang.id}
                          className={isSelected ? styles.selectedRow : ""}
                        >
                          <td className={styles.center}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(lang.id)}
                            />
                          </td>
                          <td className={styles.center}>{index + 1}</td>
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

          {/* 대량 작업 폼 */}
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
                  onClick={() => handleLanguagesBulk(bulkLanguage)}
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
