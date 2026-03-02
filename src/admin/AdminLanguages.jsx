import React, { useEffect, useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import AdminPageContainer from "@/admin/AdminPageContainer";
import Button from "@/components/common/Button";
import { HiTrash, HiPencil, HiCheck, HiXMark, HiPlus } from "react-icons/hi2";

const AI_PROMPT = `
너는 다국어 데이터 생성 전문가야. 아래 요청하는 언어 목록을 JSON 배열 형식으로 변환해줘.

[데이터 규격 규칙]
1. code: 반드시 BCP 47 형식을 준수할 것 (예: 언어는 소문자, 지역은 대문자 'ko-KR', 'en-US', 'ja-JP').
2. name: 해당 언어의 원어 명칭으로 표기 (예: '한국어', 'English', '日本語').
3. emoji: 해당 언어를 대표하는 국가의 국기 이모지.

[출력 형식 예시]
[
  { "code": "ko-KR", "name": "한국어", "emoji": "🇰🇷" },
  { "code": "en-US", "name": "English", "emoji": "🇺🇸" },
  { "code": "ja-JP", "name": "日本語", "emoji": "🇯🇵" }
]

주의: 마크다운 코드 블록 없이 순수 JSON 배열만 출력해.
JSON은 반드시 **”(ASCII 쌍따옴표)** 만 허용하며, 유니코드 스마트 문자 ’ (U+2019) 말고, 일반 아포스트로피(’) 사용해. 여러 객체는[] 배열로 감싸.

[요청 목록]
다음 언어들을 포함해서 JSON으로 만들어줘: 
영어, 한국어, 스페인어, 프랑스어, 독일어, 이탈리아어, 중국어(간체), 일본어, 베트남어, 태국어, 필리핀어, 러시아어, 아랍어.
`;

const AdminLanguages = () => {
  const {
    languages,
    fetchLanguages,
    addLanguage,
    addLanguagesBulk,
    updateLanguage,
    deleteLanguage,
  } = useGlobalStore();

  // 1. 단건 추가용 상태 (한 줄 인풋 박스용)
  const [newData, setNewData] = useState({ code: "", name: "", emoji: "" });

  // 2. 인라인 수정용 상태
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", emoji: "" });

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleSingleAdd = async (e) => {
    e.preventDefault();
    if (!newData.code || !newData.name)
      return alert("코드와 이름을 입력해주세요.");
    const success = await addLanguage(newData);
    if (success) setNewData({ code: "", name: "", emoji: "" });
  };

  const handleSaveEdit = async (code) => {
    if (!editForm.name) return alert("이름을 입력해주세요.");
    const success = await updateLanguage(code, editForm);
    if (success) setEditId(null);
  };

  // 🌟 [핵심] 목록 상단에 항상 보일 한 줄 인풋 박스 UI
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
        <div style={{ flex: "0 0 100px" }}>
          <label style={{ fontSize: "0.75rem", color: "#64748b" }}>Code</label>
          <input
            className="admin-inline-input"
            value={newData.code}
            onChange={(e) => {
              let val = e.target.value;
              if (val.includes("-")) {
                const parts = val.split("-");
                val = parts[0].toLowerCase() + "-" + parts[1].toUpperCase();
              } else {
                val = val.toLowerCase();
              }
              setNewData({ ...newData, code: val });
            }}
            placeholder="en-US"
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "0.75rem", color: "#64748b" }}>Name</label>
          <input
            className="admin-inline-input"
            style={{ width: "100%", height: "36px" }}
            value={newData.name}
            onChange={(e) => setNewData({ ...newData, name: e.target.value })}
            placeholder="English"
          />
        </div>
        <div style={{ flex: "0 0 80px" }}>
          <label style={{ fontSize: "0.75rem", color: "#64748b" }}>Emoji</label>
          <input
            className="admin-inline-input"
            style={{ width: "100%", height: "36px", textAlign: "center" }}
            value={newData.emoji}
            onChange={(e) => setNewData({ ...newData, emoji: e.target.value })}
            placeholder="🇺🇸"
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
        <th style={{ width: "80px", textAlign: "center" }}>Flag</th>
        <th style={{ width: "100px" }}>Code</th>
        <th>Name</th>
        <th style={{ width: "120px", textAlign: "center" }}>Action</th>
      </tr>
    </thead>
  );

  const renderRow = (lang, index, no) => {
    const isEditing = editId === lang.code;
    return (
      <tr key={lang.code || index}>
        <td
          style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}
        >
          {no}
        </td>
        <td style={{ textAlign: "center" }}>
          {isEditing ? (
            <input
              className="admin-inline-input"
              style={{ width: "50px", textAlign: "center" }}
              value={editForm.emoji}
              onChange={(e) =>
                setEditForm({ ...editForm, emoji: e.target.value })
              }
            />
          ) : (
            <span style={{ fontSize: "1.5rem" }}>{lang.emoji}</span>
          )}
        </td>
        <td>
          <span className="badge WORD">{lang.code}</span>
        </td>
        <td>
          {isEditing ? (
            <input
              className="admin-inline-input"
              style={{ width: "100%" }}
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
          ) : (
            <span style={{ fontWeight: "bold" }}>{lang.name}</span>
          )}
        </td>
        <td>
          <div
            style={{ display: "flex", gap: "6px", justifyContent: "center" }}
          >
            {isEditing ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSaveEdit(lang.code)}
                  icon={<HiCheck />}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditId(null)}
                  icon={<HiXMark />}
                />
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditId(lang.code);
                    setEditForm({ name: lang.name, emoji: lang.emoji });
                  }}
                  icon={<HiPencil />}
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteLanguage(lang.code)}
                  icon={<HiTrash />}
                />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <AdminPageContainer
      title="🌐 언어 관리"
      data={languages}
      onUpload={addLanguagesBulk}
      onRefresh={fetchLanguages}
      renderListHeader={renderHeader}
      renderListRow={renderRow}
      renderAddForm={AddFormUI}
      aiGuide={AI_PROMPT}
      jsonPlaceholder='[ { "code": "ko-KR", "name": "한국어", "emoji": "🇰🇷" } ]'
    />
  );
};

export default AdminLanguages;
