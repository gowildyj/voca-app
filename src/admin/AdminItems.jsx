import React, { useEffect, useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import AdminPageContainer from "@/admin/AdminPageContainer";
import Button from "@/components/common/Button";

import {
  HiTrash,
  HiCheck,
  HiXMark,
  HiPlus,
  HiChevronDown,
  HiChevronUp,
  HiPhoto,
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

  // AI 프롬프트 생성
  const tagGuide = categories
    .map((c) => `${c.icon_emoji}${c.tag_key}(ID:${c.id})`)
    .join(", ");
  const currentLangCodes = languages.map((l) => l.code).join(", ");
  const AI_PROMPT = `
너는 다국어 학습 콘텐츠 생성 전문가야. 아래 규칙으로 JSON 배열을 만들어줘.
JSON은 반드시 **”(ASCII 쌍따옴표)** 만 허용하며, 유니코드 스마트 문자 ’ (U+2019) 말고, 일반 아포스트로피(’) 사용해. 여러 객체는[] 배열로 감싸.

- 형식: { 
    "item_key": "apple", 
    "item_type": "WORD", 
    "tag_ids": ["해당하는_태그_ID_넣기"], // 위 목록에서 적절한 ID를 찾아 배열로 넣을 것
    "langs": { ... } 
   }
- 언어 목록: ${currentLangCodes}
- 지원 태그 목록: ${tagGuide}
- 요청 단어: 사과, 바나나, 포도, 안녕하세요, 감사합니다, 미안합니다,
  `;

  // 🌟 아코디언 토글 시 데이터 매핑 보정
  const handleToggle = (item) => {
    if (expandedId === item.id) {
      setExpandedId(null);
    } else {
      setExpandedId(item.id);

      const langMap = {};
      // 1. 기존 DB 번역 데이터가 있다면 매핑
      item.item_translations?.forEach((t) => {
        langMap[t.lang_code] = {
          content: t.content || "",
          example: t.example_sentence || "",
        };
      });

      // 2. 만약 JSON 미리보기 중이라면 (id가 없음) langs에서 바로 가져옴
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
        image_url: item.image_url || "", // 🌟 null 방지
        tag_ids: item.item_tag_map?.map((t) => t.tag_id) || item.tag_ids || [],
        langs: langMap,
      });
    }
  };

  const renderHeader = (
    <thead>
      <tr>
        <th style={{ width: "50px", textAlign: "center" }}>No.</th>
        <th style={{ width: "80px", textAlign: "center" }}>Type</th>
        <th style={{ width: "100px", textAlign: "center" }}>Image</th>
        <th>Content (Target / Native)</th>
        <th style={{ width: "150px" }}>Tags</th>
        <th style={{ width: "100px", textAlign: "center" }}>Action</th>
      </tr>
    </thead>
  );

  const renderRow = (item, index, no) => {
    const isExpanded = expandedId === item.id;

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
            background: isExpanded ? "#f1f5f9" : "transparent",
          }}
        >
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
              {displayContent}
              {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#cbd5e1" }}>
              {item.id ? `ID: ${item.id}` : "신규 등록 예정"}
            </div>
          </td>
          <td>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {/* DB에서 온 데이터(item_tag_map)와 미리보기 데이터(tag_ids) 모두 대응 */}
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

        {isExpanded && (
          <tr>
            <td colSpan="6" className="admin-accordion-panel">
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

              <div className="admin-lang-grid">
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
                        style={{ width: "100%", marginBottom: "4px" }}
                        placeholder="단어/문장 내용"
                        value={info.content || ""} // 🌟 명시적 빈 문자열 처리
                        onChange={(e) => {
                          setEditData({
                            ...editData,
                            langs: {
                              ...editData.langs,
                              [lang.code]: { ...info, content: e.target.value },
                            },
                          });
                        }}
                      />
                      <textarea
                        className="admin-inline-input"
                        style={{
                          width: "100%",
                          height: "60px",
                          fontSize: "0.8rem",
                        }}
                        placeholder="예문 입력"
                        value={info.example || ""} // 🌟 명시적 빈 문자열 처리
                        onChange={(e) => {
                          setEditData({
                            ...editData,
                            langs: {
                              ...editData.langs,
                              [lang.code]: { ...info, example: e.target.value },
                            },
                          });
                        }}
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
                      const success = await updateItem(item.id, editData);
                      if (success) setExpandedId(null);
                    } else {
                      alert(
                        "이 데이터는 아직 DB에 저장되지 않은 미리보기 상태입니다. 'JSON 일괄 등록' 탭 하단의 저장 버튼을 이용해 주세요.",
                      );
                    }
                  }}
                >
                  {item.id ? "수정사항 저장" : "미리보기 모드"}
                </Button>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <AdminPageContainer
      title="🗂️ 콘텐츠 관리"
      data={items}
      onRefresh={fetchAdminItems}
      onUpload={addItemsBulk}
      renderListHeader={renderHeader}
      renderListRow={renderRow}
      aiGuide={AI_PROMPT}
      jsonPlaceholder='[ { "item_key": "apple", "item_type": "WORD", "langs": { "en-US": { "content": "Apple", "example": "I like apples." } } } ]'
    />
  );
};

export default AdminItems;
