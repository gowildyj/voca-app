import React, { useState, useEffect } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import AdminScenarioContainer from "@/admin/AdminScenarioContainer";
import ItemSearchModal from "@/admin/ItemSearchModal";
import Button from "@/components/common/Button";
import {
  HiPlus,
  HiCheck,
  HiTrash,
  HiXMark,
  HiCodeBracket,
} from "react-icons/hi2";

const AI_PROMPT = `
너는 '다국어 회화 학습 앱'의 콘텐츠를 생성하는 백엔드 API 시스템이야.
사용자의 요청을 분석하여, 아래 [엄격한 JSON 스키마]에 맞춰 시나리오 데이터를 생성해.
JSON은 반드시 **"(ASCII 쌍따옴표)** 만 허용하며, 유니코드 스마트 문자 ’ (U+2019) 말고, 일반 아포스트로피(’) 사용해.

[필수 규칙]
1. 출력 형식: 마크다운 코드블록(\`\`\`json) 없이, **오직 순수 JSON 문자열만** 반환할 것.
2. 언어: 모든 텍스트(title, description, template, content)는 "en-US", "ko-KR" 필수.
3. unique_key: "category_word" 형태의 snake_case (예: food_steak).
4. has_choices 규칙:
   - true일 경우: template에 "{option}" 포함 필수.
   - true일 경우: options 배열 최소 2개 이상.
   - 🌟 중요: options 중 **가장 일반적인 하나**를 선택하여 반드시 "is_default": true 로 설정할 것. (나머지는 false)

[JSON 스키마 예시]
{
  "difficulty": "Easy",
  "title": { "ko-KR": "...", "en-US": "..." },
  "description": { "ko-KR": "...", "en-US": "..." },
  "dialogues": [
    {
      "order": 1,
      "speaker": "B",
      "template": { "en-US": "I'd like {option}.", "ko-KR": "{option} 주세요." },
      "has_choices": true,
      "options": [
        {
          "unique_key": "food_pasta",
          "is_default": true,  // 👈 여기가 핵심!
          "content": { "en-US": "Pasta", "ko-KR": "파스타" }
        },
        {
          "unique_key": "food_steak",
          "is_default": false,
          "content": { "en-US": "Steak", "ko-KR": "스테이크" }
        }
      ]
    }
  ]
}
`;

const AdminScenarios = () => {
  const {
    items,
    scenarios,
    fetchAdminScenarios,
    fetchItems,
    saveScenario,
    saveDialogue,
    deleteScenario,
    deleteDialogue,
    addScenarioBulk,
    addDialogueOption,
    deleteDialogueOption,
    exportScenarioToJson,
    setDialogueOptionDefault,
  } = useGlobalStore();

  useEffect(() => {
    fetchAdminScenarios();
    fetchItems();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetDialogueId, setTargetDialogueId] = useState(null);

  // 🌟 오른쪽 상세: 대화 흐름 편집 UI (클래스 적용)
  const renderDetail = (scenario) => {
    const koTitle =
      scenario.scenario_translations?.find((t) => t.lang_code === "ko-KR")
        ?.title || "제목 없음";

    const handleAddDialogue = async () => {
      const newOrder = (scenario.scenario_dialogues?.length || 0) + 1;
      await saveDialogue({
        scenario_id: scenario.id,
        order_index: newOrder,
        speaker_type: "A",
        template_text: "새로운 대화 내용을 입력하세요.",
      });
    };

    // 🌟 JSON 추출 핸들러
    const handleExport = async (scenarioId) => {
      const jsonString = await exportScenarioToJson(scenarioId);
      if (jsonString) {
        navigator.clipboard.writeText(jsonString);
        alert(
          "시나리오 JSON이 클립보드에 복사되었습니다! \n'AI 일괄 등록' 탭에 붙여넣어 수정하세요.",
        );
      } else {
        alert("데이터 추출 실패");
      }
    };

    return (
      <div className="scenario-editor">
        {/* 상단 헤더 */}
        <div className="scenario-editor-header">
          <div>
            <h3 className="scenario-title">{koTitle}</h3>
            <span className={`badge ${scenario.difficulty_level}`}>
              {scenario.difficulty_level}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {/* 🌟 JSON 내보내기 버튼 */}
            <Button
              size="sm"
              variant="secondary"
              icon={<HiCodeBracket />}
              onClick={() => handleExport(scenario.id)}
            >
              JSON 추출
            </Button>

            <Button
              variant="danger"
              size="sm"
              icon={<HiTrash />}
              onClick={() => {
                if (confirm("이 시나리오 전체를 삭제하시겠습니까?")) {
                  deleteScenario(scenario.id);
                }
              }}
            >
              삭제
            </Button>
          </div>
        </div>

        {/* 대화 타임라인 */}
        <div className="chat-timeline">
          {scenario.scenario_dialogues
            ?.sort((a, b) => a.order_index - b.order_index)
            .map((chat) => (
              <div
                key={chat.id}
                className={`dialogue-item ${chat.speaker_type}`}
              >
                <div className="dialogue-controls">
                  <select
                    value={chat.speaker_type}
                    className="admin-inline-input"
                    onChange={(e) =>
                      saveDialogue({ ...chat, speaker_type: e.target.value })
                    }
                  >
                    <option value="A">상대방 (A)</option>
                    <option value="B">나 (B)</option>
                  </select>
                  <button
                    className="delete-link"
                    onClick={() => deleteDialogue(chat.id)}
                  >
                    삭제
                  </button>
                </div>

                {/* 🌟 defaultValue 사용으로 입력 경고 해결 */}
                <textarea
                  className="dialogue-bubble"
                  key={chat.id + chat.template_text}
                  defaultValue={chat.template_text}
                  placeholder="문장 템플릿 입력 (예: I'd like {option}.)"
                  onBlur={(e) =>
                    saveDialogue({ ...chat, template_text: e.target.value })
                  }
                />

                {/* 선택지 영역 */}
                <div className="dialogue-info">
                  {chat.template_text.includes("{option}") && (
                    <div style={{ marginTop: "10px" }}>
                      <div className="admin-tag-selection-group">
                        {/* 1. 기존 옵션 칩들 (기본값 별표 포함) */}
                        {chat.scenario_options
                          ?.sort((a, b) =>
                            b.is_default === a.is_default
                              ? 0
                              : b.is_default
                                ? 1
                                : -1,
                          )
                          .map((opt) => (
                            <span
                              key={opt.id}
                              // 🌟 2. 칩을 클릭하면 기본값으로 설정!
                              onClick={() =>
                                setDialogueOptionDefault(chat.id, opt.id)
                              }
                              className={`admin-tag-chip ${opt.is_default ? "default-option" : ""}`}
                              style={{
                                fontSize: "0.75rem",
                                background: opt.is_default
                                  ? "#2563eb"
                                  : "#f1f5f9",
                                color: opt.is_default ? "white" : "#64748b",
                                border: opt.is_default
                                  ? "none"
                                  : "1px solid #e2e8f0",
                                cursor: "pointer", // 🌟 3. 클릭 가능하다는 표시(손가락 모양)
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title="클릭하여 기본값(Default)으로 설정" // 툴팁 추가
                            >
                              {opt.is_default && "★ "}
                              {opt.choice_item?.item_translations?.[0]?.content}

                              <HiXMark
                                style={{ cursor: "pointer", opacity: 0.7 }}
                                onClick={(e) => {
                                  e.stopPropagation(); // 🌟 4. 삭제 버튼 누를 땐 기본값 설정 방지
                                  if (
                                    confirm("이 선택지를 삭제하시겠습니까?")
                                  ) {
                                    deleteDialogueOption(opt.id);
                                  }
                                }}
                              />
                            </span>
                          ))}

                        {/* 🌟 2. [복구] 선택지 추가 버튼 */}
                        <button
                          className="admin-tag-chip"
                          onClick={() => {
                            setTargetDialogueId(chat.id);
                            setIsModalOpen(true);
                          }}
                          style={{
                            background: "white",
                            border: "1px dashed #cbd5e1",
                            color: "#2563eb",
                            fontWeight: "bold",
                          }}
                        >
                          <HiPlus /> 선택지 추가
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
        <Button
          fullWidth
          variant="secondary"
          icon={<HiPlus />}
          onClick={handleAddDialogue}
        >
          말풍선 추가하기
        </Button>
      </div>
    );
  };

  // 신규 시나리오 마스터 추가 폼
  const renderAddForm = (
    <div className="admin-form-group">
      <input
        className="admin-inline-input"
        placeholder="시나리오 제목 (ko-KR)"
        id="new-title"
        style={{ width: "100%", marginBottom: "12px", height: "40px" }}
        defaultValue=""
      />
      <textarea
        className="admin-inline-input"
        placeholder="시나리오 설명"
        id="new-desc"
        style={{ width: "100%", marginBottom: "16px", height: "80px" }}
        defaultValue=""
      />
      <Button
        fullWidth
        icon={<HiCheck />}
        onClick={() => {
          const title = document.getElementById("new-title").value;
          const description = document.getElementById("new-desc").value;
          if (!title) return alert("제목을 입력해주세요.");
          saveScenario({ langs: { "ko-KR": { title, description } } });
        }}
      >
        시나리오 생성 시작
      </Button>
    </div>
  );

  return (
    <>
      <AdminScenarioContainer
        title="🎬 시나리오 관리"
        data={scenarios}
        onRefresh={fetchAdminScenarios}
        onUpload={addScenarioBulk}
        aiGuide={AI_PROMPT}
        jsonPlaceholder='{ "title": { "ko-KR": "..." }, "dialogues": [...] }'
        renderScenarioDetail={renderDetail}
        renderAddForm={renderAddForm}
      />

      <ItemSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        items={items}
        onSelect={(itemId) => addDialogueOption(targetDialogueId, itemId)}
      />
    </>
  );
};

export default AdminScenarios;
