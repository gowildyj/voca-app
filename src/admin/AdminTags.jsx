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
    icon_emoji: "",
    is_main: false,
    langs: {},
  });

  // 단건 추가용 상태
  const [newTag, setNewTag] = useState({
    icon_emoji: "",
    langs: { "ko-KR": "", "en-US": "" },
  });

  // AI 프롬프트 (BCP 47 대응)
  const currentLangCodes = languages.map((l) => l.code).join(", ");

  const AI_PROMPT = `
너는 다국어 카테고리 데이터 생성 전문가야.
요청하는 카테고리들을 아래 언어 코드들에 맞춰 JSON 배열로 변환해줘.

언어 목록: ${currentLangCodes}
카테고리 목록: 음식, 쇼핑, 교통, 호텔, 여행, 병원, 날씨, 감정

[규칙]
1. 형식: { "tag_key": "영문키", "icon_emoji": "...", "langs": { "언어코드": "번역명칭" } }
2. tag_key 예시: 'food', 'shopping', 'transport', 'hotel' 등 소문자 영문.
3. 순수 JSON 배열만 출력해.
`;

  useEffect(() => {
    fetchLanguages();
    fetchAdminCategories();
  }, []);

  // 🌟 아코디언 토글: 클릭 시 해당 데이터를 수정 상태로 복사
  const handleToggle = (cat) => {
    if (expandedId === cat.id) {
      setExpandedId(null);
    } else {
      setExpandedId(cat.id);
      const langMap = {};
      // DB에 있는 기존 번역 데이터 매핑
      cat.hashtag_translations?.forEach((t) => {
        langMap[t.lang_code] = t.tag_name;
      });
      // 혹시 DB에 없더라도 현재 지원하는 모든 언어 키를 미리 생성 (빈값)
      languages.forEach((l) => {
        if (!langMap[l.code]) langMap[l.code] = "";
      });

      setEditData({
        icon_emoji: cat.icon_emoji,
        is_main: cat.is_main_category,
        langs: langMap,
      });
    }
  };

  // 🌟 상세 편집 저장
  const handleSaveAll = async (id) => {
    const success = await updateCategory(id, {
      icon_emoji: editData.icon_emoji,
      is_main_category: editData.is_main,
      langs: editData.langs,
    });
    if (success) setExpandedId(null);
  };

  const handleSingleAdd = async (e) => {
    e.preventDefault();
    if (!newTag.icon_emoji || !newTag.langs["ko-KR"])
      return alert("아이콘과 한국어 이름은 필수입니다.");

    const success = await addCategoriesBulk([newTag]);
    if (success)
      setNewTag({ icon_emoji: "", langs: { "ko-KR": "", "en-US": "" } });
  };

  const AddFormUI = (
    <div
      className="guide-box"
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        padding: "12px",
      }}
    >
      <form
        onSubmit={handleSingleAdd}
        style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}
      >
        <div style={{ flex: "0 0 70px" }}>
          <label style={{ fontSize: "0.75rem", color: "#64748b" }}>Icon</label>
          <input
            className="admin-inline-input"
            style={{ width: "100%", height: "36px", textAlign: "center" }}
            value={newTag.icon_emoji}
            onChange={(e) =>
              setNewTag({ ...newTag, icon_emoji: e.target.value })
            }
            placeholder="🍎"
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "0.75rem", color: "#64748b" }}>
            Name (ko-KR)
          </label>
          <input
            className="admin-inline-input"
            style={{ width: "100%", height: "36px" }}
            value={newTag.langs["ko-KR"]}
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
          <label style={{ fontSize: "0.75rem", color: "#64748b" }}>
            Name (en-US)
          </label>
          <input
            className="admin-inline-input"
            style={{ width: "100%", height: "36px" }}
            value={newTag.langs["en-US"]}
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
  );

  const renderHeader = (
    <thead>
      <tr>
        <th style={{ width: "50px", textAlign: "center" }}>No.</th>
        <th style={{ width: "60px", textAlign: "center" }}>Icon</th>
        <th>Category Names (Summary)</th>
        <th style={{ width: "80px", textAlign: "center" }}>Main</th>
        <th style={{ width: "100px", textAlign: "center" }}>Action</th>
      </tr>
    </thead>
  );

  const renderRow = (cat, index, no) => {
    const isExpanded = expandedId === cat.id;

    // 요약 이름 로직 (미리보기/실데이터 대응)
    let namesSummary = "";
    if (cat.hashtag_translations?.length > 0) {
      namesSummary =
        cat.hashtag_translations
          .slice(0, 3)
          .map((t) => t.tag_name)
          .join(", ") + "...";
    } else if (cat.langs) {
      namesSummary = Object.values(cat.langs).slice(0, 3).join(", ") + "...";
    } else {
      namesSummary = "No Data";
    }

    return (
      <React.Fragment key={cat.id || index}>
        <tr
          onClick={() => handleToggle(cat)}
          style={{
            cursor: "pointer",
            background: isExpanded ? "#f1f5f9" : "transparent",
          }}
        >
          <td style={{ textAlign: "center" }}>{no || "-"}</td>
          <td style={{ textAlign: "center", fontSize: "1.5rem" }}>
            {cat.icon_emoji}
          </td>
          <td>
            <div
              style={{
                fontWeight: "bold",
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
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
              {cat.id ? `ID: ${cat.id}` : "신규 등록 예정"}
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

        {/* 🌟 아코디언 상세 편집 패널 */}
        {isExpanded && (
          <tr>
            <td
              colSpan="5"
              style={{
                background: "#f8fafc",
                padding: "24px",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "24px",
                  marginBottom: "20px",
                }}
              >
                {/* 아이콘 수정 */}
                <div style={{ flex: "0 0 100px" }}>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    아이콘
                  </label>
                  <input
                    className="admin-inline-input"
                    style={{
                      fontSize: "1.5rem",
                      width: "100%",
                      textAlign: "center",
                    }}
                    value={editData.icon_emoji}
                    onChange={(e) =>
                      setEditData({ ...editData, icon_emoji: e.target.value })
                    }
                  />
                </div>
                {/* 메인 노출 여부 수정 */}
                <div style={{ flex: "0 0 200px" }}>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    메인 화면 노출
                  </label>

                  <label
                    className={`admin-toggle-wrapper ${editData.is_main ? "active" : ""}`}
                  >
                    <div className="toggle-track">
                      <div className="toggle-handle" />
                    </div>
                    <input
                      type="checkbox"
                      style={{ display: "none" }}
                      checked={editData.is_main}
                      onChange={(e) =>
                        setEditData({ ...editData, is_main: e.target.checked })
                      }
                    />
                    <span className="toggle-label">
                      {editData.is_main ? "메인 노출 중" : "일반 카테고리"}
                    </span>
                  </label>
                </div>
              </div>

              {/* 다국어 이름 수정 그리드 부분 */}
              <div className="admin-lang-grid">
                {languages.map((lang) => (
                  <div key={lang.code} className="admin-lang-item">
                    <span className="admin-lang-label">
                      {lang.name} ({lang.code})
                    </span>
                    <input
                      className="admin-inline-input"
                      style={{
                        width: "100%",
                        border: "none",
                        padding: "0",
                        background: "transparent",
                      }}
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

              {/* 하단 저장/취소 버튼 */}
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
                <Button
                  onClick={() => handleSaveAll(cat.id)}
                  icon={<HiCheck />}
                >
                  변경사항 전체 저장
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
      title="🏷️ 태그 관리"
      data={categories}
      onUpload={addCategoriesBulk}
      onRefresh={fetchAdminCategories}
      renderListHeader={renderHeader}
      renderListRow={renderRow}
      renderAddForm={AddFormUI}
      aiGuide={AI_PROMPT}
      searchPlaceholder="태그 이름으로 검색..."
    />
  );
};

export default AdminTags;
