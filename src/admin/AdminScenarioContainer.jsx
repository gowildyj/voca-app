import React, { useState, useMemo } from "react";
import Button from "@/components/common/Button";
import { toast } from "react-hot-toast";
import {
  HiListBullet,
  HiPlus,
  HiMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
  HiPencilSquare,
  HiCodeBracket,
  HiClipboardDocumentCheck,
} from "react-icons/hi2";
import "@/styles/admin/adminContent.css";

const AdminScenarioContainer = ({
  title,
  data = [],
  onRefresh,
  onUpload,
  aiGuide,
  jsonPlaceholder,
  renderScenarioDetail,
  renderAddForm,
  searchPlaceholder = "시나리오 제목 검색...",
  itemsPerPage = 10,
}) => {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddMode, setIsAddMode] = useState(false);

  // JSON 관련 상태
  const [jsonInput, setJsonInput] = useState("");
  const [previewData, setPreviewData] = useState(null);

  // 1. 검색 필터링
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data, searchTerm]);

  // 2. 페이지네이션
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const selectedItem = data.find((item) => item.id === selectedId);

  // 3. JSON 파싱 핸들러 (스마트 따옴표 & 배열 처리 추가)
  const handleParse = () => {
    try {
      const sanitizedInput = jsonInput
        .replace(/[\u201C\u201D]/g, '"') // “ ” -> "
        .replace(/[\u2018\u2019]/g, "'"); // ‘ ’ -> '

      let parsed = JSON.parse(sanitizedInput);

      // 배열로 들어오면 첫 번째 객체만 추출
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) throw new Error("빈 배열입니다.");
        parsed = parsed[0];
        toast("배열이 감지되어 첫 번째 시나리오를 선택했습니다.", {
          icon: "ℹ️",
        });
      }

      setPreviewData(parsed);
      toast.success("JSON 형식이 올바릅니다. 미리보기를 확인하세요.");
    } catch (e) {
      alert("JSON 형식이 올바르지 않습니다.\n" + e.message);
    }
  };

  const handleUpload = async () => {
    if (!previewData || !onUpload) return;
    // 제목이 객체일 경우 처리
    const titleText =
      previewData.title?.["ko-KR"] || previewData.title || "제목 없음";

    if (!confirm(`시나리오 '${titleText}'를 등록하시겠습니까?`)) return;

    const success = await onUpload(previewData);
    if (success) {
      setJsonInput("");
      setPreviewData(null);
      setActiveTab("list");
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="admin-page" style={{ maxWidth: "1400px" }}>
      <div className="page-header">
        <h2>
          {title} ({filteredData.length})
        </h2>
        <div className="tabs">
          <button
            className={activeTab === "list" ? "active" : ""}
            onClick={() => setActiveTab("list")}
          >
            <HiListBullet size={20} /> 목록 및 편집
          </button>
          <button
            className={activeTab === "json" ? "active" : ""}
            onClick={() => setActiveTab("json")}
          >
            <HiCodeBracket size={20} /> AI 일괄 등록
          </button>
        </div>
      </div>

      {activeTab === "list" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "350px 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* --- 왼쪽: 목록 사이드바 --- */}
          <div
            className="scenario-sidebar"
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <div className="search-bar" style={{ flex: 1, marginBottom: 0 }}>
                <HiMagnifyingGlass className="search-icon" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Button
                size="sm"
                icon={<HiPlus />}
                onClick={() => {
                  setIsAddMode(true);
                  setSelectedId(null);
                }}
              />
            </div>

            <div
              className="scenario-list"
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {currentItems.map((item) => {
                const titleInfo =
                  item.scenario_translations?.find(
                    (t) => t.lang_code === "ko-KR",
                  ) || item.scenario_translations?.[0];
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      setIsAddMode(false);
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: `2px solid ${selectedId === item.id ? "#2563eb" : "#f1f5f9"}`,
                      background: selectedId === item.id ? "#eff6ff" : "white",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        marginBottom: "4px",
                      }}
                    >
                      {titleInfo?.title || "제목 없음"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.75rem",
                        color: "#64748b",
                      }}
                    >
                      <span className={`badge ${item.difficulty_level}`}>
                        {item.difficulty_level}
                      </span>
                      <span>대화 {item.scenario_dialogues?.length || 0}개</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div
                className="pagination"
                style={{ marginTop: "16px", justifyContent: "center" }}
              >
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  <HiChevronLeft />
                </button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  <HiChevronRight />
                </button>
              </div>
            )}
          </div>

          {/* --- 오른쪽: 상세 편집창 --- */}
          <div
            className="scenario-detail-view"
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              minHeight: "600px",
            }}
          >
            {isAddMode ? (
              <div style={{ padding: "24px" }}>
                <h3>🆕 새 시나리오 생성</h3>
                {renderAddForm}
              </div>
            ) : selectedItem ? (
              <div style={{ padding: "24px" }}>
                {renderScenarioDetail(selectedItem)}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "600px",
                  color: "#94a3b8",
                }}
              >
                <HiPencilSquare
                  size={48}
                  style={{ marginBottom: "16px", opacity: 0.3 }}
                />
                <p>시나리오를 선택하거나 새로 생성해주세요.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- AI 일괄 등록 탭 --- */
        <div className="json-uploader-container">
          <div className="guide-box">
            <p>
              💡 <strong>AI 시나리오 생성 프롬프트</strong>
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(aiGuide);
                toast.success("프롬프트가 복사되었습니다!");
              }}
              icon={<HiClipboardDocumentCheck />}
            >
              프롬프트 복사
            </Button>
          </div>
          <textarea
            className="json-textarea"
            placeholder={jsonPlaceholder}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <div className="action-area" style={{ marginTop: "16px" }}>
            <Button onClick={handleParse} disabled={!jsonInput}>
              데이터 검증하기
            </Button>
          </div>

          {previewData && (
            <div
              className="preview-area"
              style={{
                marginTop: "24px",
                padding: "20px",
                background: "#f8fafc",
                borderRadius: "12px",
              }}
            >
              <h3>
                미리보기:{" "}
                {previewData.title?.["ko-KR"] ||
                  previewData.title?.["en-US"] ||
                  previewData.title}
              </h3>
              <p>
                {previewData.description?.["ko-KR"] ||
                  previewData.description?.["en-US"] ||
                  previewData.description}
              </p>

              <div style={{ marginTop: "16px" }}>
                {previewData.dialogues?.map((d) => {
                  // 1. 템플릿 텍스트 추출 (한국어 우선)
                  const langCode = d.template?.["ko-KR"] ? "ko-KR" : "en-US"; // 언어 감지
                  const templateText =
                    typeof d.template === "object"
                      ? d.template[langCode]
                      : d.template;

                  // 2. 🌟 [핵심] 옵션을 넣은 완성 문장 만들기
                  let completeSentence = null;
                  if (d.has_choices && d.options && d.options.length > 0) {
                    const defaultOpt =
                      d.options.find((o) => o.is_default) || d.options[0];

                    const optText =
                      defaultOpt.content?.[langCode] ||
                      Object.values(defaultOpt.content || {})[0] ||
                      "???";

                    completeSentence = templateText.replace(
                      /{\s*option\s*}/gi,
                      optText,
                    );
                  }

                  return (
                    <div
                      key={d.order}
                      style={{
                        fontSize: "0.95rem",
                        marginBottom: "12px",
                        padding: "12px",
                        background: "white",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ marginBottom: "4px" }}>
                        <span
                          className={`badge ${d.speaker === "A" ? "neutral" : "primary"}`}
                          style={{ marginRight: "8px" }}
                        >
                          {d.speaker}
                        </span>
                        {/* 원본 템플릿 표시 */}
                        <span style={{ color: "#64748b" }}>{templateText}</span>
                      </div>

                      {/* 🌟 3. 완성된 예시 문장 보여주기 */}
                      {completeSentence && (
                        <div
                          style={{
                            paddingLeft: "34px",
                            color: "#059669",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>👉 예시:</span>
                          <span>"{completeSentence}"</span>
                        </div>
                      )}

                      {/* 옵션 목록 */}
                      {d.options && d.options.length > 0 && (
                        <div
                          style={{
                            marginTop: "8px",
                            paddingLeft: "34px",
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          {d.options.map((o, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: "0.75rem",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                background: o.is_default
                                  ? "#dbeafe"
                                  : "#f1f5f9",
                                color: o.is_default ? "#1e40af" : "#64748b",
                                border: o.is_default
                                  ? "1px solid #93c5fd"
                                  : "1px solid #e2e8f0",
                              }}
                            >
                              {o.is_default && "★ "}
                              {o.content?.["ko-KR"] || o.content?.["en-US"]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <Button fullWidth onClick={handleUpload} className="mt-4">
                이 시나리오를 DB에 저장하기
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminScenarioContainer;
