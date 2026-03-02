import React, { useEffect, useState, useMemo } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import AdminPageContainer from "@/admin/AdminPageContainer";
import Button from "@/components/common/Button";
import { toast } from "react-hot-toast";

import {
  HiTrash,
  HiCheck,
  HiXMark,
  HiChevronDown,
  HiChevronUp,
  HiPhoto,
  HiDocumentDuplicate,
  HiStar,
  HiFunnel,
} from "react-icons/hi2";

const AdminItems = () => {
  const {
    languages,
    categories,
    items,
    fetchLanguages,
    fetchAdminCategories,
    fetchAdminItems,
    addItemsBulk,
    deleteItem,
    updateItem,
  } = useGlobalStore();

  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filterType, setFilterType] = useState("ALL");

  // 상세 편집 상태
  const [editData, setEditData] = useState({
    uq_key: "",
    item_type: "WORD",
    image_url: "",
    is_favorite: false, // 즐겨찾기 추가
    tag_ids: [],
    langs: {},
  });

  const filteredItems = useMemo(() => {
    if (filterType === "ALL") return items;
    return items.filter((item) => item.item_type === filterType);
  }, [items, filterType]);

  // 🌟 AI 프롬프트 (한국어 최적화)
  const currentLangCodes = languages.map((l) => l.code).join(", ");
  const AI_GUIDE = `
당신은 다국어 언어 학습 데이터 전문가입니다.
요청하는 단어/문장을 아래 언어 코드들에 맞춰 JSON 배열로 변환하세요.

[규칙]
1. 형식: { "uq_key": "영문_키", "item_type": "WORD"|"SENTENCE", "langs": { "코드": { "content": "내용", "example": "예문" } } }
2. uq_key: 고유한 영문 이름 (예: 'greeting_hello', 'travel_taxi').
3. item_type: 짧은 단어는 'WORD', 문장은 'SENTENCE'.
4. 예문: 단어(WORD)일 때만 포함하고 문장은 빈 문자열("") 처리.

대상 언어: ${currentLangCodes}
요청 데이터: 
`;

  useEffect(() => {
    fetchLanguages();
    fetchAdminCategories();
    fetchAdminItems();
  }, []);

  // --- 체크박스 & 복사 ---
  const handleSelectAll = (e) => {
    if (e.target.checked)
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleCopySelectedIds = () => {
    if (selectedIds.size === 0) return toast.error("선택된 항목이 없습니다.");
    navigator.clipboard.writeText(Array.from(selectedIds).join("\n"));
    toast.success(`${selectedIds.size}개의 ID가 복사되었습니다.`);
  };

  // --- Bulk 텍스트 변환 (IDs -> Text) ---
  const handleConvertIdsToText = (idsArray) => {
    const langCodes = languages.map((l) => l.code);
    const headers = ["id", "uq_key", "type", ...langCodes];
    const headerLine = headers.join(" | ");

    const rows = idsArray
      .map((id) => {
        const item = items.find((i) => i.id === id.trim());
        if (!item) return null;
        const cols = [
          item.id,
          item.uq_key || item.item_key || "",
          item.item_type || "WORD",
          ...langCodes.map(
            (code) =>
              item.item_translations?.find((t) => t.lang_code === code)
                ?.content || "",
          ),
        ];
        return cols.join(" | ");
      })
      .filter(Boolean);

    return [headerLine, ...rows].join("\n");
  };

  // --- 🌟 [핵심] 아코디언 토글 & 데이터 매핑 로직 ---
  const handleToggle = (item) => {
    const uniqueId = item.id || item._tempId || item.uq_key;

    if (expandedId === uniqueId) {
      setExpandedId(null);
    } else {
      setExpandedId(uniqueId);
      const langMap = {};

      // 1. DB 데이터 로드 (item_translations)
      item.item_translations?.forEach((t) => {
        langMap[t.lang_code] = {
          content: t.content || "",
          example: t.example_sentence || "",
        };
      });

      // 2. 미리보기/벌크 데이터 로드 (langs 객체 구조 대응)
      if (item.langs) {
        Object.entries(item.langs).forEach(([code, info]) => {
          // info가 {content: "", example: ""} 인 경우와 일반 문자열인 경우 모두 대응
          langMap[code] = {
            content: typeof info === "object" ? info.content || "" : info,
            example: info.example || "",
          };
        });
      }

      // 3. 누락된 언어 필드 초기화
      languages.forEach((l) => {
        if (!langMap[l.code]) langMap[l.code] = { content: "", example: "" };
      });

      setEditData({
        uq_key: item.uq_key || item.item_key || "",
        item_type: item.item_type || "WORD",
        image_url: item.image_url || "",
        is_favorite: item.is_favorite || false,
        tag_ids: item.item_tag_map?.map((t) => t.tag_id) || item.tag_ids || [],
        langs: langMap,
      });
    }
  };

  const handleSave = async (id) => {
    if (!id) return;
    const success = await updateItem(id, editData);
    if (success) setExpandedId(null);
  };

  // --- 렌더러 ---
  const renderHeader = (
    <thead>
      <tr>
        <th style={{ width: "40px", textAlign: "center" }}>
          <input
            type="checkbox"
            onChange={handleSelectAll}
            checked={items.length > 0 && selectedIds.size === items.length}
          />
        </th>
        <th style={{ width: "50px", textAlign: "center" }}>No.</th>
        <th style={{ width: "80px", textAlign: "center" }}>Type</th>
        <th style={{ width: "60px", textAlign: "center" }}>Image</th>
        <th>Content (Target / Native)</th>
        <th style={{ width: "150px" }}>Tags</th>
        <th style={{ width: "80px", textAlign: "center" }}>Action</th>
      </tr>
    </thead>
  );

  const renderRow = (item, index, no) => {
    const uniqueId = item.id || item._tempId || item.uq_key;
    const isExpanded = expandedId === uniqueId;
    const isSelected = item.id && selectedIds.has(item.id);

    // 목록 요약 표시 로직
    let displayContent = "No Data";
    if (item.item_translations?.length > 0) {
      const target = item.item_translations[0]?.content || "";
      const native =
        item.item_translations.find((t) => t.lang_code === "ko-KR")?.content ||
        "";
      displayContent =
        native && native !== target ? `${target} / ${native}` : target;
    } else if (item.langs) {
      const vals = Object.values(item.langs);
      const first = typeof vals[0] === "object" ? vals[0].content : vals[0];
      displayContent = first || "Preview Data";
    }

    const currentTagIds =
      item.item_tag_map?.map((m) => m.tag_id) || item.tag_ids || [];

    return (
      <React.Fragment key={uniqueId || index}>
        <tr
          onClick={() => handleToggle(item)}
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
          <td
            style={{ textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={() => handleSelectRow(item.id)}
              disabled={!item.id}
            />
          </td>
          <td style={{ textAlign: "center" }}>{no || "-"}</td>
          <td style={{ textAlign: "center" }}>
            <span className={`badge ${item.item_type}`}>{item.item_type}</span>
          </td>
          <td style={{ textAlign: "center" }}>
            {item.image_url ? (
              <img
                src={item.image_url}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "4px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <HiPhoto size={20} color="#cbd5e1" />
            )}
          </td>
          <td>
            <div
              style={{
                fontWeight: "bold",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {item.is_favorite && <HiStar style={{ color: "#f59e0b" }} />}
              <span
                style={{
                  maxWidth: "400px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayContent}
              </span>
              {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              {item.uq_key || item.item_key}
            </div>
          </td>
          <td>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {currentTagIds.slice(0, 2).map((tagId) => {
                const tag = categories.find((c) => c.id === tagId);
                return (
                  <span
                    key={tagId}
                    className="badge success"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {tag?.uq_key}
                  </span>
                );
              })}
              {currentTagIds.length > 2 && (
                <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>
                  +{currentTagIds.length - 2}
                </span>
              )}
            </div>
          </td>
          <td
            style={{ textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="danger"
              size="sm"
              icon={<HiTrash />}
              onClick={() => deleteItem(item.id)}
            />
          </td>
        </tr>

        {/* --- 상세 편집 패널 (아코디언) --- */}
        {isExpanded && (
          <tr>
            <td colSpan="7" className="admin-accordion-panel">
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ flex: "0 0 180px" }}>
                  <label className="admin-lang-label">고유 Key</label>
                  <input
                    className="admin-inline-input"
                    style={{ width: "100%" }}
                    value={editData.uq_key}
                    onChange={(e) =>
                      setEditData({ ...editData, uq_key: e.target.value })
                    }
                  />
                </div>
                <div style={{ flex: "0 0 120px" }}>
                  <label className="admin-lang-label">타입</label>
                  <select
                    className="admin-inline-input"
                    style={{ width: "100%", height: "38px" }}
                    value={editData.item_type}
                    onChange={(e) =>
                      setEditData({ ...editData, item_type: e.target.value })
                    }
                  >
                    <option value="WORD">WORD</option>
                    <option value="SENTENCE">SENTENCE</option>
                  </select>
                </div>
                <div style={{ flex: "0 0 150px" }}>
                  <label className="admin-lang-label">즐겨찾기</label>
                  <label className="admin-toggle-wrapper">
                    <input
                      type="checkbox"
                      checked={editData.is_favorite}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          is_favorite: e.target.checked,
                        })
                      }
                    />
                    <div className="toggle-track">
                      <div className="toggle-handle" />
                    </div>
                    <span className="toggle-label">
                      {editData.is_favorite ? "고정됨" : "일반"}
                    </span>
                  </label>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="admin-lang-label">관련 태그</label>
                  <div className="admin-tag-selection-group">
                    {categories.map((cat) => {
                      const isSelected = editData.tag_ids.includes(cat.id);
                      return (
                        <label
                          key={cat.id}
                          className={`admin-tag-chip ${isSelected ? "active" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const nextTags = e.target.checked
                                ? [...editData.tag_ids, cat.id]
                                : editData.tag_ids.filter(
                                    (id) => id !== cat.id,
                                  );
                              setEditData({ ...editData, tag_ids: nextTags });
                            }}
                          />
                          <span>
                            {cat.icon_emoji} {cat.uq_key}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 🌟 다국어 입력 그리드 - AdminTag처럼 언어별로 나열 */}
              <div
                className="admin-lang-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                }}
              >
                {languages.map((lang) => {
                  const info = editData.langs[lang.code] || {
                    content: "",
                    example: "",
                  };
                  return (
                    <div key={lang.code} className="admin-lang-item">
                      <span className="admin-lang-label">
                        {lang.name} ({lang.code})
                      </span>
                      <input
                        className="admin-inline-input"
                        style={{
                          width: "100%",
                          marginBottom: "6px",
                          fontWeight: "bold",
                        }}
                        value={info.content}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            langs: {
                              ...editData.langs,
                              [lang.code]: { ...info, content: e.target.value },
                            },
                          })
                        }
                        placeholder="단어/문장 입력..."
                      />
                      <textarea
                        className="admin-inline-input"
                        style={{
                          width: "100%",
                          height: "60px",
                          fontSize: "0.85rem",
                          resize: "none",
                        }}
                        value={info.example}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            langs: {
                              ...editData.langs,
                              [lang.code]: { ...info, example: e.target.value },
                            },
                          })
                        }
                        placeholder="예문 입력..."
                      />
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <Button
                  variant="ghost"
                  onClick={() => setExpandedId(null)}
                  icon={<HiXMark />}
                >
                  취소
                </Button>
                {item.id && (
                  <Button
                    icon={<HiCheck />}
                    onClick={() => handleSave(item.id)}
                  >
                    수정사항 저장
                  </Button>
                )}
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  const renderAddForm = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
      }}
    >
      {/* 1. 타입 필터 버튼 그룹 */}
      <div
        className="tabs"
        style={{
          background: "#f8fafc",
          padding: "4px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <button
          className={filterType === "ALL" ? "active" : ""}
          onClick={() => setFilterType("ALL")}
          style={{ fontSize: "0.85rem", padding: "6px 12px" }}
        >
          전체
        </button>
        <button
          className={filterType === "WORD" ? "active" : ""}
          onClick={() => setFilterType("WORD")}
          style={{ fontSize: "0.85rem", padding: "6px 12px" }}
        >
          단어
        </button>
        <button
          className={filterType === "SENTENCE" ? "active" : ""}
          onClick={() => setFilterType("SENTENCE")}
          style={{ fontSize: "0.85rem", padding: "6px 12px" }}
        >
          문장
        </button>
      </div>

      {/* 2. ID 복사 버튼 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {selectedIds.size > 0 && (
          <span
            style={{
              fontSize: "0.85rem",
              color: "#2563eb",
              fontWeight: "bold",
            }}
          >
            {selectedIds.size}개 선택됨
          </span>
        )}
        <Button
          variant={selectedIds.size > 0 ? "primary" : "secondary"}
          size="sm"
          icon={<HiDocumentDuplicate />}
          onClick={handleCopySelectedIds}
          disabled={selectedIds.size === 0}
        >
          ID 복사
        </Button>
      </div>
    </div>
  );

  return (
    <AdminPageContainer
      title="🗂️ 콘텐츠(아이템) 관리"
      data={filteredItems}
      onRefresh={fetchAdminItems}
      onUpload={addItemsBulk}
      onLoadData={handleConvertIdsToText}
      renderListHeader={renderHeader}
      renderListRow={renderRow}
      renderAddForm={renderAddForm}
      aiGuide={AI_GUIDE}
      searchPlaceholder="고유 키 또는 내용 검색..."
      jsonPlaceholder='[{"uq_key": "hello", "item_type": "WORD", "langs": {"ko-KR": {"content": "안녕하세요", "example": "그가 나에게 인사했다."}}}]'
    />
  );
};

export default AdminItems;
