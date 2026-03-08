import React, { useState, useEffect, useMemo, Fragment } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/components/common/Button/Button";
import SearchBar from "@/components/common/SearchBar/SearchBar";
import { useContentStore } from "@/store/useContentStore";
import { toast } from "react-hot-toast";
import { logger } from "@/utils/logger";
import { Globe, ChevronRight, ChevronDown, Plus } from "lucide-react";
import styles from "./AdminTags.module.css";

const mockTags = [
  {
    id: "tag-001",
    unique_key: "travel",
    icon_emoji: "✈️",
    display_order: 1,
    hashtag_translations: [
      { id: "tr-1", lang_code: "ko-KR", tag_name: "여행" },
      { id: "tr-2", lang_code: "en-US", tag_name: "Travel" },
      { id: "tr-3", lang_code: "es-ES", tag_name: "Viaje" },
      { id: "tr-4", lang_code: "fr-FR", tag_name: "Voyage" },
      { id: "tr-5", lang_code: "jp-JP", tag_name: "旅行" },
      { id: "tr-6", lang_code: "zh-CN", tag_name: "旅游" },
      { id: "tr-7", lang_code: "th-TH", tag_name: "การท่องเที่ยว" },
      { id: "tr-8", lang_code: "vi-VN", tag_name: "Du lịch" },
    ],
  },
  {
    id: "tag-002",
    unique_key: "food",
    icon_emoji: "🍕",
    display_order: 2,
    hashtag_translations: [
      { id: "tr-9", lang_code: "ko-KR", tag_name: "음식" },
      { id: "tr-10", lang_code: "en-US", tag_name: "Food" },
      { id: "tr-11", lang_code: "it-IT", tag_name: "Cibo" },
    ],
  },
  {
    id: "tag-003",
    unique_key: "study",
    icon_emoji: "📚",
    display_order: 3,
    hashtag_translations: [
      { id: "tr-12", lang_code: "ko-KR", tag_name: "공부" },
      { id: "tr-13", lang_code: "en-US", tag_name: "Study" },
      { id: "tr-14", lang_code: "de-DE", tag_name: "Stud축" },
    ],
  },
];

const AdminTags = () => {
  const { t } = useTranslation();

  const {
    languages,
    fetchLanguages,
    upsertLanguage,
    deleteLanguage,
    appLang,
    setAppLang,
    tags,
    filteredTags,
    fetchTags,
  } = useContentStore();

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
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchTags();
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

  // 아코디언 토글 함수
  // const toggleRow = (tagId) => {
  //   const newExpandedRows = new Set(expandedRows);
  //   if (newExpandedRows.has(tagId)) {
  //     newExpandedRows.delete(tagId);
  //   } else {
  //     newExpandedRows.add(tagId);
  //   }
  //   setExpandedRows(newExpandedRows);
  // };
  const toggleRow = (tagId) => {
    setExpandedRow((prevId) => (prevId === tagId ? null : tagId));
  };

  // 대표 언어
  const getMainTagName = (translations) => {
    const main =
      translations.find((t) => t.lang_code === "ko-KR") ||
      translations.find((t) => t.lang_code === "en-US") ||
      translations[0];
    return main ? main.tag_name : "No Name";
  };

  // 대량수정
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

  // 한건 등록+수정
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

  // 대량 등록
  const handleLanguageBulkRegister = async (textData) => {
    if (!textData.trim()) return toast.error(t("required_fields"));

    const lines = textData.split(/\r?\n/).filter((line) => line.trim() !== "");

    const promises = lines.map(async (line) => {
      const [code, name, emoji] = line.split("|").map((item) => item.trim());
      if (!code || !name) return null;
      return upsertLanguage({ code, name, emoji: emoji || "" });
    });

    try {
      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r !== null).length;

      toast.success(`${t("success")} ${successCount}`);
      setBulkLanguage("");
      setBulkMode("list"); // 등록 후 목록으로 이동
    } catch (error) {
      toast.error(t("failed"));
      logger.error("Bulk Register Error", error);
    }
  };

  // 대량 수정 수정
  const handleLanguageBulkUpdate = async (textData) => {
    if (!textData.trim()) return toast.error(t("required_fields"));
    if (!window.confirm(t("confirm"))) return;

    const lines = textData.split(/\r?\n/).filter((l) => l.trim() !== "");

    const promises = lines.map(async (line) => {
      const [id, code, name, emoji] = line
        .split("|")
        .map((item) => item.trim());
      if (id && code && name) {
        return upsertLanguage({ id, code, name, emoji: emoji || "" });
      }
      return null;
    });

    try {
      await Promise.all(promises);
      toast.success(`${t("success")} ${successCount}`);
      // setBulkLanguage("");
      setBulkMode("list");
    } catch (error) {
      toast.error(t("failed"));
    }
  };

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

  return (
    <div className="v-app-layout">
      <div className={styles.pageContainer}>
        {/* 타이틀 영역 */}
        <header className={styles.header}>
          <div className={styles.headerIconWrap}>
            <Globe size={24} />
          </div>
          <div>
            <h1 className={styles.title}>Tags Management</h1>
            <p className={styles.desc}>
              플랫폼의 해시태그 설정을 관리하고 대량으로 데이터를 제어합니다.
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
            <h4 className={styles["admin-form-title"]}>🏷️ 태그 등록/수정</h4>
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

        {/* 검색바 (적당한 위치에 독립적으로 배치) */}
        <div className={styles.searchWrapper}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="언어명 또는 코드 검색..."
          />
        </div>

        {/* 데이터 관리 영역 (모던 탭 + Test 스타일 테이블) */}
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

          {/* 목록 */}
          {bulkMode === "list" && (
            <div className={styles["table-wrapper"]}>
              <table className={styles["admin-table"]}>
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}></th>
                    <th>Key / ID</th>
                    <th>대표 태그명</th>
                    <th className={styles.center}>이모지</th>
                    <th className={styles.center}>번역 현황</th>
                    <th className={styles.center}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTags?.map((tag) => {
                    const isExpanded = expandedRow === tag.id;
                    return (
                      <Fragment key={tag.id}>
                        {/* --- 1단계: 마스터 행 (Parent) --- */}
                        <tr
                          className={isExpanded ? styles.expandedRow : ""}
                          onClick={() => toggleRow(tag.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className={styles.center}>
                            {isExpanded ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </td>
                          <td className={styles.keyText}>
                            <div>{tag.unique_key}</div>
                            <div style={{ fontSize: "10px", color: "#999" }}>
                              {tag.id.slice(0, 8)}
                            </div>
                          </td>
                          <td style={{ fontWeight: "bold" }}>
                            #{getMainTagName(tag.hashtag_translations)}
                          </td>
                          <td className={styles.center}>
                            {tag.icon_emoji || "🏷️"}
                          </td>
                          <td className={styles.center}>
                            <span className={styles.langCountBadge}>
                              {tag.hashtag_translations?.length || 0} / 40
                            </span>
                          </td>
                          <td
                            className={styles.actions}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* 언어관리와 동일한 버튼 클래스 사용 */}
                            <button
                              className={styles["edit-inline-btn"]}
                              onClick={() => handleEdit(tag)}
                            >
                              수정
                            </button>
                            <button
                              className={styles["delete-inline-btn"]}
                              onClick={() =>
                                handleToDelete(tag.id, tag.unique_key)
                              }
                            >
                              삭제
                            </button>
                          </td>
                        </tr>

                        {/* --- 2단계: 아코디언 상세 내용 (Child) --- */}
                        {isExpanded && (
                          <tr className={styles.accordionDetailRow}>
                            <td colSpan="6" className={styles.accordionTd}>
                              <div className={styles.translationWrapper}>
                                <div className={styles.translationGrid}>
                                  {tag.hashtag_translations?.map((trans) => (
                                    <div
                                      key={trans.id}
                                      className={styles.translationItem}
                                    >
                                      <span className={styles.langBadgeShort}>
                                        {trans.lang_code}
                                      </span>
                                      <span className={styles.tagNameText}>
                                        #{trans.tag_name}
                                      </span>
                                      <button className={styles.miniEditIcon}>
                                        ✏️
                                      </button>
                                    </div>
                                  ))}
                                  {/* 새 번역 추가 버튼 */}
                                  <button className={styles.addTranslationBtn}>
                                    <Plus size={14} />{" "}
                                    {t("add_language") || "Add"}
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 대량 등록, 수정 */}
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

export default AdminTags;
