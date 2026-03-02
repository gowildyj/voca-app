import React, { useEffect, useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import AdminPageContainer from "@/admin/AdminPageContainer";
import Button from "@/components/common/Button";
import { toast } from "react-hot-toast";

import {
  HiTrash,
  HiCheck,
  HiChevronDown,
  HiChevronUp,
  HiPhoto,
  HiDocumentDuplicate, // 복사 아이콘
  HiCursorArrowRays, // 선택 아이콘
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

  // 🌟 [New] 선택된 ID 관리 (Set 사용)
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [editData, setEditData] = useState({
    item_type: "WORD",
    image_url: "",
    tag_ids: [],
    langs: {},
  });

  useEffect(() => {
    fetchLanguages();
    fetchAdminCategories();
    fetchAdminItems();
  }, []);

  // 🌟 1. 체크박스 핸들러
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // 현재 로딩된 모든 아이템 선택 (또는 필터된 것만 선택하려면 filteredData를 받아야 함)
      // 여기서는 심플하게 전체 선택
      setSelectedIds(new Set(items.map((i) => i.id)));
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

    // Set -> Array -> String (줄바꿈 구분)
    const idsString = Array.from(selectedIds).join("\n");
    navigator.clipboard.writeText(idsString);
    toast.success(
      `${selectedIds.size}개의 ID가 복사되었습니다!\n'Bulk 수정' 탭에서 불러오세요.`,
    );
  };

  // 🌟 3. ID 목록을 받아서 Pipe Text로 변환 (Bulk 탭에서 호출됨)
  const handleConvertIdsToText = (idsArray) => {
    // 1. 헤더 생성
    const langCodes = languages.map((l) => l.code);
    const headers = ["id", "key", "type", ...langCodes];
    const headerLine = headers.join(" | ");

    // 2. 데이터 행 생성
    const rows = idsArray
      .map((id) => {
        const item = items.find((i) => i.id === id.trim()); // 공백 제거 중요
        if (!item) return null;

        const cols = [
          item.id,
          item.item_key || "",
          item.item_type || "WORD",
          ...langCodes.map((code) => {
            return (
              item.item_translations?.find((t) => t.lang_code === code)
                ?.content || ""
            );
          }),
        ];
        return cols.join(" | ");
      })
      .filter(Boolean);

    return [headerLine, ...rows].join("\n");
  };

  // ... (handleToggle 등 기존 로직) ...
  const handleToggle = (item) => {
    if (expandedId === item.id) {
      setExpandedId(null);
    } else {
      setExpandedId(item.id);
      const langMap = {};
      item.item_translations?.forEach((t) => {
        langMap[t.lang_code] = {
          content: t.content || "",
          example: t.example_sentence || "",
        };
      });
      if (!item.id && item.langs) {
        Object.entries(item.langs).forEach(([code, info]) => {
          langMap[code] = {
            content: info.content || "",
            example: info.example || "",
          };
        });
      }
      setEditData({
        item_type: item.item_type || "WORD",
        image_url: item.image_url || "",
        tag_ids: item.item_tag_map?.map((t) => t.tag_id) || item.tag_ids || [],
        langs: langMap,
      });
    }
  };

  // 🌟 헤더 렌더링 (체크박스 추가)
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
        <th style={{ width: "100px", textAlign: "center" }}>Image</th>
        <th>Content (Target / Native)</th>
        <th style={{ width: "150px" }}>Tags</th>
        <th style={{ width: "100px", textAlign: "center" }}>Action</th>
      </tr>
    </thead>
  );

  // 🌟 행 렌더링 (체크박스 추가)
  const renderRow = (item, index, no) => {
    const isExpanded = expandedId === item.id;
    const isSelected = selectedIds.has(item.id);

    // 요약 표시 로직
    let displayContent = "No Data";
    if (item.item_translations && item.item_translations.length > 0) {
      const target = item.item_translations[0]?.content || "";
      const native =
        item.item_translations.find((t) => t.lang_code === "ko-KR")?.content ||
        "";
      displayContent = native ? `${target} / ${native}` : target;
    } else if (item.langs) {
      const target = item.langs["en-US"]?.content || "";
      const native = item.langs["ko-KR"]?.content || "";
      displayContent = native
        ? `${target} / ${native}`
        : target || Object.values(item.langs)[0]?.content;
    }

    return (
      <React.Fragment key={item.id || index}>
        <tr
          onClick={() => handleToggle(item)}
          style={{
            cursor: "pointer",
            background: isSelected
              ? "#eff6ff"
              : isExpanded
                ? "#f8fafc"
                : "transparent", // 선택 시 파란 배경
            borderLeft: isSelected
              ? "4px solid #2563eb"
              : "4px solid transparent",
          }}
        >
          {/* 🌟 체크박스 셀 */}
          <td
            style={{ textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleSelectRow(item.id)}
              disabled={!item.id} // ID 없는(신규) 항목은 선택 불가
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
                alt=""
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "4px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <HiPhoto size={24} color="#cbd5e1" />
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
              {displayContent}{" "}
              {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#cbd5e1" }}>
              {item.item_key}
            </div>
          </td>
          <td>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {(
                item.item_tag_map?.map((m) => m.tag_id) ||
                item.tag_ids ||
                []
              ).map((tagId) => (
                <span
                  key={tagId}
                  style={{
                    fontSize: "0.7rem",
                    background: "#f1f5f9",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  #{categories.find((c) => c.id === tagId)?.tag_key || "tag"}
                </span>
              ))}
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
              onClick={() => item.id && deleteItem(item.id)}
            />
          </td>
        </tr>

        {/* 아코디언 내용은 기존과 동일하므로 생략 (위 코드 참고) */}
        {isExpanded && (
          <tr>
            <td colSpan="7" className="admin-accordion-panel">
              {/* colSpan을 6에서 7로 증가 (체크박스 때문) */}
              <div
                style={{ display: "flex", gap: "24px", marginBottom: "20px" }}
              >
                <div style={{ flex: "0 0 200px" }}>
                  <label className="admin-lang-label">이미지 URL</label>
                  <input
                    className="admin-inline-input"
                    style={{ width: "100%" }}
                    value={editData.image_url || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, image_url: e.target.value })
                    }
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="admin-lang-label">관련 태그 설정</label>
                  <div className="admin-tag-selection-group">
                    {categories.map((cat) => {
                      const isTagSelected = editData.tag_ids.includes(cat.id);
                      return (
                        <label
                          key={cat.id}
                          className={`admin-tag-chip ${isTagSelected ? "active" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isTagSelected}
                            onChange={(e) => {
                              const newTags = e.target.checked
                                ? [...editData.tag_ids, cat.id]
                                : editData.tag_ids.filter(
                                    (id) => id !== cat.id,
                                  );
                              setEditData({ ...editData, tag_ids: newTags });
                            }}
                          />
                          <span>{cat.icon_emoji}</span>
                          <span>{cat.tag_key}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* ... 언어 입력 그리드 등 ... */}
              <div className="admin-lang-grid">
                {languages.map((lang) => {
                  const info = editData.langs[lang.code] || {
                    content: "",
                    example: "",
                  };
                  return (
                    <div key={lang.code} className="admin-lang-item">
                      <span className="admin-lang-label">{lang.name}</span>
                      <input
                        className="admin-inline-input"
                        style={{ width: "100%", marginBottom: "4px" }}
                        placeholder="내용"
                        value={info.content || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            langs: {
                              ...editData.langs,
                              [lang.code]: { ...info, content: e.target.value },
                            },
                          })
                        }
                      />
                      <textarea
                        className="admin-inline-input"
                        style={{
                          width: "100%",
                          height: "60px",
                          fontSize: "0.8rem",
                        }}
                        placeholder="예문"
                        value={info.example || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            langs: {
                              ...editData.langs,
                              [lang.code]: { ...info, example: e.target.value },
                            },
                          })
                        }
                      />
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <Button variant="ghost" onClick={() => setExpandedId(null)}>
                  취소
                </Button>
                <Button
                  icon={<HiCheck />}
                  onClick={async () => {
                    if (item.id) {
                      await updateItem(item.id, editData);
                      setExpandedId(null);
                    }
                  }}
                >
                  수정사항 저장
                </Button>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  // 🌟 상단 툴바 (선택된 것만 복사)
  const renderAddForm = (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "10px",
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
        variant={selectedIds.size > 0 ? "primary" : "secondary"} // 선택되면 파란색
        icon={<HiDocumentDuplicate />}
        onClick={handleCopySelectedIds}
        disabled={selectedIds.size === 0}
      >
        선택한 ID 복사 ({selectedIds.size})
      </Button>
    </div>
  );

  return (
    <AdminPageContainer
      title="🗂️ 콘텐츠 관리"
      data={items}
      onRefresh={fetchAdminItems}
      onUpload={addItemsBulk}
      onLoadData={handleConvertIdsToText} // 🌟 컨테이너에게 ID -> Text 변환 함수 전달
      renderListHeader={renderHeader}
      renderListRow={renderRow}
      renderAddForm={renderAddForm}
      // ...
    />
  );
};

export default AdminItems;
