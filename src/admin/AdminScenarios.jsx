import React, { useEffect } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import AdminScenarioContainer from "@/admin/AdminScenarioContainer";
import Button from "@/components/common/Button";
import { HiPlus, HiCheck, HiTrash } from "react-icons/hi2";

const AdminScenarios = () => {
  const {
    scenarios,
    fetchAdminScenarios,
    saveScenario,
    saveDialogue,
    deleteScenario,
    deleteDialogue,
  } = useGlobalStore();

  useEffect(() => {
    fetchAdminScenarios();
  }, []);

  // 🌟 오른쪽 상세: 대화 흐름 편집 UI
  const renderDetail = (scenario) => {
    const koTitle =
      scenario.scenario_translations?.find((t) => t.lang_code === "ko-KR")
        ?.title || "제목 없음";

    // 대화 추가 핸들러
    const handleAddDialogue = async () => {
      const newOrder = (scenario.scenario_dialogues?.length || 0) + 1;
      await saveDialogue({
        scenario_id: scenario.id,
        order_index: newOrder,
        speaker_type: "A",
        template_text: "새로운 대화 내용을 입력하세요.",
      });
    };

    return (
      <div className="scenario-editor">
        {/* 상단 헤더 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "16px",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{koTitle}</h3>
            <span
              className={`badge ${scenario.difficulty_level}`}
              style={{ marginTop: "4px", display: "inline-block" }}
            >
              {scenario.difficulty_level}
            </span>
          </div>
          <Button variant="danger" size="sm" icon={<HiTrash />}>
            시나리오 삭제
          </Button>
        </div>

        {/* 대화 타임라인 */}
        <div
          className="chat-timeline"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {scenario.scenario_dialogues
            ?.sort((a, b) => a.order_index - b.order_index)
            .map((chat) => (
              <div
                key={chat.id}
                className={`dialogue-item ${chat.speaker_type}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    chat.speaker_type === "A" ? "flex-start" : "flex-end",
                  gap: "8px",
                }}
              >
                {/* 화자 선택 및 컨트롤 */}
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <select
                    value={chat.speaker_type}
                    className="admin-inline-input"
                    style={{ fontSize: "0.75rem", padding: "2px 4px" }}
                    onChange={(e) =>
                      saveDialogue({ ...chat, speaker_type: e.target.value })
                    }
                  >
                    <option value="A">상대방 (A)</option>
                    <option value="B">나 (B)</option>
                  </select>
                  <button
                    onClick={() => deleteDialogue(chat.id)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    삭제
                  </button>
                </div>

                {/* 문장 입력창 (말풍선 스타일) */}
                <textarea
                  className="admin-inline-input"
                  value={chat.template_text}
                  placeholder="문장 템플릿 입력 (예: I'd like {option}.)"
                  onChange={(e) => {
                    // 실시간 저장은 부담스러우므로 onBlur나 별도 저장 버튼을 권장하지만, 일단 구조 확인용
                  }}
                  onBlur={(e) =>
                    saveDialogue({ ...chat, template_text: e.target.value })
                  }
                  style={{
                    width: "80%",
                    borderRadius: "12px",
                    padding: "12px",
                    fontSize: "0.95rem",
                    background:
                      chat.speaker_type === "A" ? "#f8fafc" : "#eff6ff",
                    border:
                      chat.speaker_type === "A"
                        ? "1px solid #e2e8f0"
                        : "1px solid #bfdbfe",
                    color: "#1e293b",
                    resize: "none",
                  }}
                />

                {/* 선택지(Options) 연결 영역 - 다음 단계 예정 */}
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  {chat.template_text.includes("{option}") ? (
                    <span style={{ color: "#2563eb", fontWeight: "bold" }}>
                      ✨ 선택지 설정 필요
                    </span>
                  ) : (
                    "일반 문장"
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

  return (
    <AdminScenarioContainer
      title="🎬 시나리오 관리"
      data={scenarios}
      onRefresh={fetchAdminScenarios}
      renderScenarioDetail={renderDetail}
      searchPlaceholder="시나리오 제목으로 검색..."
    />
  );
};

export default AdminScenarios;
