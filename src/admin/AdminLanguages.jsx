import React, { useEffect, useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import AdminPageContainer from "@/admin/AdminPageContainer";
import Button from "@/components/common/Button";
import { HiTrash, HiPencil, HiPlus, HiCheck, HiXMark } from "react-icons/hi2";

const AI_PROMPT = `
너는 데이터 생성기야. 아래 언어 목록을 JSON 형식으로 변환해줘.
필드: code (ISO 2자리), name (해당 언어로 표기), emoji (국기)
[예시] [ { "code": "fr", "name": "Français", "emoji": "🇫🇷" } ]
[요청] 다음 언어들을 추가해줘: 프랑스어, 독일어, 이탈리아어, 베트남어.
`;

const AdminLanguages = () => {
  const {
    languages,
    fetchLanguages,
    addLanguage, // 추가
    updateLanguage, // 🌟 수정 함수 가져오기
    addLanguagesBulk,
    deleteLanguage,
  } = useGlobalStore();

  // 폼 상태 관리
  const [formData, setFormData] = useState({ code: "", name: "", emoji: "" });
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부

  useEffect(() => {
    fetchLanguages();
  }, []);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 폼 제출 (추가 or 수정)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name)
      return alert("코드와 이름은 필수입니다.");

    let success = false;
    if (isEditing) {
      // 수정 모드일 때
      success = await updateLanguage(formData.code, {
        name: formData.name,
        emoji: formData.emoji,
      });
    } else {
      // 추가 모드일 때
      success = await addLanguage(formData);
    }

    if (success) {
      resetForm();
    }
  };

  // 수정 버튼 클릭 시
  const handleEditClick = (lang) => {
    setFormData(lang); // 선택한 언어 정보로 폼 채우기
    setIsEditing(true); // 수정 모드 ON
    // 폼으로 스크롤 이동 (선택사항)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 취소/초기화
  const resetForm = () => {
    setFormData({ code: "", name: "", emoji: "" });
    setIsEditing(false);
  };

  // --- 렌더링 부분 ---

  const renderHeader = (
    <thead>
      <tr>
        <th style={{ width: "60px" }}>Flag</th>
        <th style={{ width: "80px" }}>Code</th>
        <th>Name</th>
        <th style={{ width: "120px" }}>Action</th>
      </tr>
    </thead>
  );

  const renderRow = (lang, index) => (
    <tr key={lang.code || index}>
      <td style={{ fontSize: "1.5rem", textAlign: "center" }}>{lang.emoji}</td>
      <td>
        <span className="badge WORD">{lang.code}</span>
      </td>
      <td style={{ fontWeight: "bold" }}>{lang.name}</td>
      <td>
        <div style={{ display: "flex", gap: "6px" }}>
          {/* 🌟 수정 버튼 */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditClick(lang)}
            icon={<HiPencil />}
          />
          {/* 삭제 버튼 */}
          {lang.code && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => deleteLanguage(lang.code)}
              icon={<HiTrash />}
            />
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div style={{ position: "relative" }}>
      {" "}
      {/* 컨테이너 감싸기 */}
      {/* 1. 상단: 입력 폼 (수정/추가 공용) */}
      <div
        className="guide-box"
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          margin: "20px",
          padding: "16px",
          borderRadius: "12px",
        }}
      >
        <h4
          style={{
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isEditing ? (
            <>
              <HiPencil /> 언어 수정 중: {formData.code}
            </>
          ) : (
            <>
              <HiPlus /> 새 언어 추가
            </>
          )}
        </h4>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "0 0 80px" }}>
            <label style={{ fontSize: "0.8rem", color: "#64748b" }}>Code</label>
            <input
              name="code"
              className="json-textarea"
              style={{
                height: "40px",
                padding: "8px",
                color: "white",
                background: isEditing ? "#94a3b8" : "#1e293b",
              }}
              value={formData.code}
              onChange={handleChange}
              placeholder="fr"
              disabled={isEditing} // 🌟 수정 시 코드는 변경 불가 (PK라서)
            />
          </div>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "0.8rem", color: "#64748b" }}>Name</label>
            <input
              name="name"
              className="json-textarea"
              style={{ height: "40px", padding: "8px", color: "white" }}
              value={formData.name}
              onChange={handleChange}
              placeholder="Français"
            />
          </div>
          <div style={{ flex: "0 0 60px" }}>
            <label style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Emoji
            </label>
            <input
              name="emoji"
              className="json-textarea"
              style={{ height: "40px", padding: "8px", color: "white" }}
              value={formData.emoji}
              onChange={handleChange}
              placeholder="🇫🇷"
            />
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              type="submit"
              size="sm"
              icon={isEditing ? <HiCheck /> : <HiPlus />}
            >
              {isEditing ? "저장" : "추가"}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
                icon={<HiXMark />}
              >
                취소
              </Button>
            )}
          </div>
        </form>
      </div>
      {/* 2. 하단: 리스트 및 JSON 업로더 */}
      <AdminPageContainer
        title="🌐 언어 관리"
        aiGuide={AI_PROMPT}
        jsonPlaceholder='[ { "code": "fr", "name": "Français", "emoji": "🇫🇷" } ]'
        data={languages}
        onUpload={addLanguagesBulk}
        onRefresh={fetchLanguages}
        renderListHeader={renderHeader}
        renderListRow={renderRow}
      />
    </div>
  );
};

export default AdminLanguages;
