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
JSON은 반드시 **"(ASCII 쌍따옴표)** 만 허용하며, 유니코드 스마트 문자 ’ (U+2019) 말고, 일반 아포스트로피(’) 사용해. 여러 객체는[] 배열로 감싸.

[필수 규칙]
1. 출력 형식: 마크다운 코드블록(\`\`\`json) 없이, **오직 순수 JSON 문자열만** 반환할 것. (주석 금지)
2. 언어: 모든 텍스트 필드(title, description, template, content)는 반드시 "en-US"(영어)와 "ko-KR"(한국어)를 모두 포함해야 함.
3. item_key: 옵션 아이템의 고유 키는 "category_word" 형태의 snake_case로 작성 (예: food_steak, place_hotel).
4. has_choices 규칙:
   - true일 경우: template 문장에 반드시 "{option}" 문자열이 포함되어야 함.
   - true일 경우: options 배열에 최소 2개 이상의 선택지 아이템을 포함해야 함.
   - false일 경우: options 배열은 비워둘 것([]).

[JSON 스키마 예시]
{
  "difficulty": "Easy", // Easy, Medium, Hard 중 택1
  "title": { "ko-KR": "주제(한)", "en-US": "Topic(Eng)" },
  "description": { "ko-KR": "상황 설명...", "en-US": "Description..." },
  "dialogues": [
    {
      "order": 1,
      "speaker": "A", // A(상대방), B(나)
      "template": { 
        "en-US": "Hello. (English)", 
        "ko-KR": "안녕하세요. (한국어)" 
      },
      "has_choices": false,
      "options": []
    },
    {
      "order": 2,
      "speaker": "B",
      "template": { 
        "en-US": "I'd like {option}, please.", 
        "ko-KR": "{option}으로 부탁합니다." 
      },
      "has_choices": true,
      "options": [
        {
          "item_key": "food_pasta",
          "item_type": "WORD",
          "content": { "en-US": "Pasta", "ko-KR": "파스타" }
        },
        {
          "item_key": "food_steak",
          "item_type": "WORD",
          "content": { "en-US": "Steak", "ko-KR": "스테이크" }
        }
      ]
    }
  ]
}

[사용자 요청 상황]
`;

const AdminScenarios = () => {
  const {
    items,
    scenarios,
    fetchAdminScenarios,
    saveScenario,
    saveDialogue,
    deleteScenario,
    deleteDialogue,
    addScenarioBulk,
    addDialogueOption,
    deleteDialogueOption,
    exportScenarioToJson, // 🌟 Export 함수
  } = useGlobalStore();

  useEffect(() => {
    fetchAdminScenarios();
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
                        {chat.scenario_options?.map((opt) => (
                          <span
                            key={opt.id}
                            className="admin-tag-chip active"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {opt.choice_item?.item_translations?.[0]?.content}
                            <HiXMark
                              style={{ cursor: "pointer", marginLeft: "4px" }}
                              onClick={() => deleteDialogueOption(opt.id)}
                            />
                          </span>
                        ))}
                        <button
                          className="admin-tag-chip"
                          onClick={() => {
                            setTargetDialogueId(chat.id);
                            setIsModalOpen(true);
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
