import React, { useEffect, useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import AdminPageContainer from "@/admin/AdminPageContainer";
import Button from "@/components/common/Button";
import { toast } from "react-hot-toast";

import {
  HiTrash,
  HiCheck,
  HiXMark,
  HiPlus,
  HiChevronDown,
  HiChevronUp,
  HiDocumentDuplicate, // ID 복사 아이콘
} from "react-icons/hi2";

const AdminTags = () => {
  const {
    languages,
    fetchLanguages,
    categories,
    fetchAdminCategories,
    addCategoriesBulk,
    deleteCategory,
    updateCategory,
  } = useGlobalStore();

  // 🌟 아코디언 상세 수정을 위한 통합 상태
  const [expandedId, setExpandedId] = useState(null);
  const [editData, setEditData] = useState({
    uq_key: "", // 🌟 키 수정도 가능하게 추가
    icon_emoji: "",
    is_main: false,
    langs: {},
  });

  // 🌟 선택된 ID 관리 (Set 사용)
  const [selectedIds, setSelectedIds] = useState(new Set());

  // 단건 추가용 상태
  const [newTag, setNewTag] = useState({
    uq_key: "",
    icon_emoji: "",
    is_main: false,
    langs: {},
  });

  // AI 프롬프트 (BCP 47 대응)
  const currentLangCodes = languages.map((l) => l.code).join(", ");
  const AI_PROMPT = `
너는 다국어 카테고리 데이터 생성 전문가야.
요청하는 카테고리들을 아래 언어 코드들에 맞춰 JSON 배열로 변환해줘.

[규칙]
1. 형식: { "uq_key": "영문키(소문자)", "icon_emoji": "...", "langs": { "언어코드": "번역명칭" } }
2. uq_key는 고유해야 해 (예: 'food', 'travel_basic').
3. 순수 JSON 배열만 출력해.

언어 목록: ${currentLangCodes}
카테고리 목록: 음식, 호텔, 여행
`;

  useEffect(() => {
    fetchLanguages();
    fetchAdminCategories();
  }, []);

  // 🌟 1. 체크박스 핸들러
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(categories.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // 🌟 2. 선택된 ID 복사 (Bulk 수정용)
  const handleCopySelectedIds = () => {
    if (selectedIds.size === 0) {
      toast.error("선택된 항목이 없습니다.");
      return;
    }
    const idsString = Array.from(selectedIds).join("\n");
    navigator.clipboard.writeText(idsString);
    toast.success(
      `${selectedIds.size}개의 ID가 복사되었습니다!\n'Bulk 수정' 탭에서 불러오세요.`,
    );
  };

  // 🌟 3. ID 목록을 받아서 Pipe Text로 변환 (Bulk 탭용)
  const handleConvertIdsToText = (idsArray) => {
    // 헤더: id | key | emoji | main | [언어코드들...]
    const langCodes = languages.map((l) => l.code);
    const headers = ["id", "key", "emoji", "main", ...langCodes];
    const headerLine = headers.join(" | ");

    const rows = idsArray
      .map((id) => {
        const cat = categories.find((c) => c.id === id.trim());
        if (!cat) return null;

        const cols = [
          cat.id,
          cat.uq_key,
          cat.icon_emoji || "",
          cat.is_main_category ? "TRUE" : "FALSE",
          ...langCodes.map((code) => {
            // 해당 언어의 태그 이름 찾기
            return (
              cat.hashtag_translations?.find((t) => t.lang_code === code)
                ?.tag_name || ""
            );
          }),
        ];
        return cols.join(" | ");
      })
      .filter(Boolean);

    return [headerLine, ...rows].join("\n");
  };

  // 🌟 아코디언 토글
  const handleToggle = (cat) => {
    const uniqueId = cat.id || cat._tempId || cat.uq_key;

    if (expandedId === uniqueId) {
      setExpandedId(null);
    } else {
      setExpandedId(uniqueId);

      const langMap = {};
      if (cat.hashtag_translations) {
        cat.hashtag_translations.forEach((t) => {
          langMap[t.lang_code] = t.tag_name;
        });
      } else if (cat.langs) {
        Object.entries(cat.langs).forEach(([code, val]) => {
          langMap[code] =
            typeof val === "object" && val !== null
              ? val.content || ""
              : val || "";
        });
      }

      languages.forEach((l) => {
        if (langMap[l.code] === undefined) langMap[l.code] = "";
      });

      // 🌟 필드 매핑 보정: uq_key(DB)와 uq_key(Bulk Parser) 모두 대응
      const effectiveKey = cat.uq_key || cat.uq_key || "";

      setEditData({
        uq_key: effectiveKey, // 이제 인풋창에 값이 정상적으로 들어갑니다.
        icon_emoji: cat.icon_emoji,
        is_main: cat.is_main_category,
        langs: langMap,
      });
    }
  };

  // 🌟 상세 편집 저장
  const handleSaveAll = async (id) => {
    const success = await updateCategory(id, {
      uq_key: editData.uq_key,
      icon_emoji: editData.icon_emoji,
      is_main_category: editData.is_main,
      langs: editData.langs,
    });
    if (success) setExpandedId(null);
  };

  // 🌟 단건 추가 핸들러
  const handleSingleAdd = async (e) => {
    e.preventDefault();
    if (!newTag.uq_key || !newTag.langs["ko-KR"])
      return toast.error("Key(영문)와 한국어 이름은 필수입니다.");

    const success = await addCategoriesBulk([newTag]);
    if (success) {
      setNewTag({ uq_key: "", icon_emoji: "", is_main: false, langs: {} });
    }
  };

  // 🌟 헤더 렌더링
  const renderHeader = (
    <thead>
      <tr>
        <th style={{ width: "40px", textAlign: "center" }}>
          <input
            type="checkbox"
            onChange={handleSelectAll}
            checked={
              categories.length > 0 && selectedIds.size === categories.length
            }
          />
        </th>
        <th style={{ width: "50px", textAlign: "center" }}>No.</th>
        <th style={{ width: "60px", textAlign: "center" }}>Icon</th>
        <th style={{ width: "120px" }}>Key</th>
        <th>Names (Summary)</th>
        <th style={{ width: "60px", textAlign: "center" }}>Main</th>
        <th style={{ width: "80px", textAlign: "center" }}>Action</th>
      </tr>
    </thead>
  );

  // 🌟 행 렌더링
  const renderRow = (cat, index, no) => {
    // 식별자 일치 여부 확인
    const uniqueId = cat.id || cat._tempId || cat.uq_key;
    const isExpanded = expandedId === uniqueId;

    // 선택 여부는 DB ID가 있는 경우만 가능
    const isSelected = cat.id && selectedIds.has(cat.id);

    const displayKey = cat.uq_key || cat.uq_key || "-";

    // 요약 이름 표시
    let namesSummary = "No Data";
    if (cat.hashtag_translations?.length > 0) {
      namesSummary = cat.hashtag_translations
        .slice(0, 3)
        .map((t) => t.tag_name)
        .join(", ");
    } else if (cat.langs) {
      // 미리보기 데이터 요약
      namesSummary = Object.values(cat.langs)
        .slice(0, 3)
        .map((v) => {
          return typeof v === "object" && v.content ? v.content : v;
        })
        .join(", ");
    }

    return (
      <React.Fragment key={uniqueId || index}>
        <tr
          onClick={() => handleToggle(cat)}
          style={{
            cursor: "pointer",
            background: isSelected
              ? "#eff6ff"
              : isExpanded
                ? "#f8fafc"
                : "transparent",
            borderLeft: isSelected
              ? "4px solid #2563eb"
              : "4px solid transparent",
          }}
        >
          {/* 체크박스 */}
          <td
            style={{ textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={() => handleSelectRow(cat.id)}
              disabled={!cat.id}
            />
          </td>

          <td style={{ textAlign: "center" }}>{no || "-"}</td>
          <td style={{ textAlign: "center", fontSize: "1.5rem" }}>
            {cat.icon_emoji}
          </td>
          <td
            style={{
              fontSize: "0.85rem",
              fontWeight: "bold",
              color: "#64748b",
            }}
          >
            {displayKey}
          </td>
          <td>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#2563eb",
              }}
            >
              {namesSummary}
              {isExpanded ? (
                <HiChevronUp size={16} />
              ) : (
                <HiChevronDown size={16} />
              )}
            </div>
          </td>
          <td style={{ textAlign: "center" }}>
            {cat.is_main_category ? "✅" : "-"}
          </td>
          <td
            style={{ textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="danger"
              size="sm"
              onClick={() => deleteCategory(cat.id)}
              icon={<HiTrash />}
            />
          </td>
        </tr>

        {/* 아코디언 상세 패널 (기존과 동일하지만 editData가 올바르게 채워짐) */}
        {isExpanded && (
          <tr>
            <td colSpan="7" className="admin-accordion-panel">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "24px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ flex: "0 0 100px" }}>
                  <label className="admin-lang-label">아이콘</label>
                  <input
                    className="admin-inline-input"
                    style={{
                      fontSize: "1.5rem",
                      width: "100%",
                      textAlign: "center",
                    }}
                    value={editData.icon_emoji || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, icon_emoji: e.target.value })
                    }
                  />
                </div>
                <div style={{ flex: "0 0 200px" }}>
                  <label className="admin-lang-label">Key (고유값)</label>
                  <input
                    className="admin-inline-input"
                    style={{ width: "100%" }}
                    value={editData.uq_key || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, uq_key: e.target.value })
                    }
                  />
                </div>
                <div style={{ flex: "0 0 150px" }}>
                  <label className="admin-lang-label">메인 화면 노출</label>
                  <label className="admin-toggle-wrapper">
                    <input
                      type="checkbox"
                      checked={editData.is_main}
                      onChange={(e) =>
                        setEditData({ ...editData, is_main: e.target.checked })
                      }
                    />
                    <div className="toggle-track">
                      <div className="toggle-handle" />
                    </div>
                    <span className="toggle-label">
                      {editData.is_main ? "노출 중" : "숨김"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="admin-lang-grid">
                {languages.map((lang) => (
                  <div key={lang.code} className="admin-lang-item">
                    <span className="admin-lang-label">
                      {lang.name} ({lang.code})
                    </span>
                    <input
                      className="admin-inline-input"
                      style={{ width: "100%" }}
                      value={editData.langs[lang.code] || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          langs: {
                            ...editData.langs,
                            [lang.code]: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <Button
                  variant="ghost"
                  onClick={() => setExpandedId(null)}
                  icon={<HiXMark />}
                >
                  취소
                </Button>
                {/* ID가 있으면 수정, 없으면(미리보기)는 DB저장 버튼을 써야함 -> 여기선 단순히 닫거나, editData를 부모에게 올려주는 로직이 필요하지만, Bulk 탭의 주 목적은 '일괄 등록'이므로 개별 수정 후 저장은 지원하지 않거나(메모리상 수정만), 바로 DB Update를 날려야 함. */}
                {/* 미리보기 상태에서는 개별 저장이 안되므로, 아래 버튼은 cat.id가 있을 때만 유효 */}
                {cat.id && (
                  <Button
                    onClick={() => handleSaveAll(cat.id)}
                    icon={<HiCheck />}
                  >
                    변경사항 저장
                  </Button>
                )}
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  // 🌟 상단 툴바 (ID 복사 버튼 + 단건 추가 폼)
  const renderAddForm = (
    <div style={{ marginBottom: "20px" }}>
      {/* 1. 단건 추가 폼 */}
      <div
        className="guide-box"
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          padding: "12px",
          marginBottom: "12px",
        }}
      >
        <form
          onSubmit={handleSingleAdd}
          style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}
        >
          <div style={{ flex: "0 0 60px" }}>
            <label className="admin-lang-label">Icon</label>
            <input
              className="admin-inline-input"
              style={{ width: "100%", textAlign: "center" }}
              value={newTag.icon_emoji}
              onChange={(e) =>
                setNewTag({ ...newTag, icon_emoji: e.target.value })
              }
              placeholder="🍎"
            />
          </div>
          <div style={{ flex: "0 0 120px" }}>
            <label className="admin-lang-label">Key (영문)</label>
            <input
              className="admin-inline-input"
              style={{ width: "100%" }}
              value={newTag.uq_key}
              onChange={(e) => setNewTag({ ...newTag, uq_key: e.target.value })}
              placeholder="food"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="admin-lang-label">Name (ko-KR)</label>
            <input
              className="admin-inline-input"
              style={{ width: "100%" }}
              value={newTag.langs["ko-KR"] || ""}
              onChange={(e) =>
                setNewTag({
                  ...newTag,
                  langs: { ...newTag.langs, "ko-KR": e.target.value },
                })
              }
              placeholder="음식"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="admin-lang-label">Name (en-US)</label>
            <input
              className="admin-inline-input"
              style={{ width: "100%" }}
              value={newTag.langs["en-US"] || ""}
              onChange={(e) =>
                setNewTag({
                  ...newTag,
                  langs: { ...newTag.langs, "en-US": e.target.value },
                })
              }
              placeholder="Food"
            />
          </div>
          <Button type="submit" size="sm" icon={<HiPlus />}>
            추가
          </Button>
        </form>
      </div>

      {/* 2. ID 복사 버튼 */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {selectedIds.size > 0 && (
          <span
            style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: "bold" }}
          >
            {selectedIds.size}개 선택됨
          </span>
        )}
        <Button
          variant={selectedIds.size > 0 ? "primary" : "secondary"}
          icon={<HiDocumentDuplicate />}
          onClick={handleCopySelectedIds}
          disabled={selectedIds.size === 0}
        >
          선택한 ID 복사 ({selectedIds.size})
        </Button>
      </div>
    </div>
  );

  return (
    <AdminPageContainer
      title="🏷️ 태그 관리"
      data={categories}
      onUpload={addCategoriesBulk}
      onRefresh={fetchAdminCategories}
      onLoadData={handleConvertIdsToText} // 🌟 ID -> Text 변환 연결
      renderListHeader={renderHeader}
      renderListRow={renderRow}
      renderAddForm={renderAddForm}
      aiGuide={AI_PROMPT}
      searchPlaceholder="태그 이름 또는 Key 검색..."
      jsonPlaceholder='[{"uq_key": "food", "icon_emoji": "🍽️", "langs": {"en-US": "Food"}}]'
    />
  );
};

export default AdminTags;
