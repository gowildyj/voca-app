import React, { useState, useMemo } from "react";
import Button from "@/components/common/Button";
import { toast } from "react-hot-toast";
import {
  HiClipboardDocumentCheck,
  HiListBullet,
  HiCodeBracket,
  HiMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
  HiPencilSquare,
  HiArrowPath,
} from "react-icons/hi2";
import "@/styles/admin/adminContent.css";

const AdminPageContainer = ({
  title,
  aiGuide,
  jsonPlaceholder,
  data = [],
  onUpload,
  onRefresh,
  onLoadData,
  renderListHeader,
  renderListRow,
  renderAddForm,
  searchPlaceholder = "검색어를 입력하세요...",
  itemsPerPage = 10,
}) => {
  // 탭 상태: list | text | json
  const [activeTab, setActiveTab] = useState("list");

  // 입력 상태
  const [jsonInput, setJsonInput] = useState("");
  const [textInput, setTextInput] = useState("");

  // 결과 상태
  const [previewData, setPreviewData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 1. 검색 및 페이징
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const getDisplayNo = (index) => (currentPage - 1) * itemsPerPage + index + 1;

  // 2. JSON 파싱
  const handleParseJson = () => {
    if (!jsonInput.trim()) {
      toast.error("JSON 데이터를 입력해주세요.");
      return;
    }

    try {
      const sanitizedInput = jsonInput
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");
      let parsed = JSON.parse(sanitizedInput);
      if (!Array.isArray(parsed))
        throw new Error("데이터는 배열([]) 형태여야 합니다.");

      setPreviewData(parsed);
      toast.success(
        `${parsed.length}건 검증 성공! (아래 미리보기를 확인하세요)`,
      );
    } catch (e) {
      alert("JSON 형식이 올바르지 않습니다.\n" + e.message);
    }
  };

  // 3. ID로 데이터 불러오기
  const handleLoadFromIds = () => {
    if (!textInput.trim()) {
      toast.error("불러올 ID들을 입력창에 붙여넣어 주세요.");
      return;
    }

    const ids = textInput.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    );

    if (!ids || ids.length === 0) {
      toast.error("유효한 ID(UUID)를 찾을 수 없습니다.");
      return;
    }

    if (onLoadData) {
      const formattedText = onLoadData(ids);
      setTextInput(formattedText);
      toast.success(`${ids.length}개의 데이터를 불러왔습니다.`);
    } else {
      toast.error("데이터 불러오기 기능이 연결되지 않았습니다.");
    }
  };

  // 4. Bulk Text 파싱
  const handleParseText = () => {
    if (!textInput.trim()) {
      toast.error("변환할 텍스트가 없습니다.");
      return;
    }

    try {
      const lines = textInput.split("\n").filter((line) => line.trim() !== "");
      if (lines.length < 2)
        throw new Error("데이터가 없습니다. 첫 줄은 헤더여야 합니다.");

      const headerLine = lines[0];
      const headers = headerLine.split("|").map((h) => h.trim());

      const parsed = lines
        .slice(1)
        .map((line, idx) => {
          const parts = line.split("|").map((s) => s.trim());
          if (parts.length <= 1 && !parts[0]) return null;

          const item = {
            id: null,
            _tempId: `temp_${Date.now()}_${idx}`,
            item_type: "WORD",
            langs: {},
            unique_key: null,
            icon_emoji: null,
            is_main_category: false,
          };

          headers.forEach((header, colIdx) => {
            const value = parts[colIdx];
            if (!value) return;

            const lowerHeader = header.toLowerCase();

            if (lowerHeader === "id") item.id = value;
            else if (lowerHeader === "key" || lowerHeader === "unique_key")
              item.unique_key = value;
            else if (lowerHeader === "type" || lowerHeader === "item_type")
              item.item_type = value;
            else if (lowerHeader === "unique_key") item.unique_key = value;
            else if (lowerHeader === "emoji" || lowerHeader === "icon_emoji")
              item.icon_emoji = value;
            else if (lowerHeader === "main" || lowerHeader === "is_main")
              item.is_main_category = value === "TRUE";
            else {
              let langCode = header;
              let field = "content";

              if (header.includes(":")) {
                const split = header.split(":");
                langCode = split[0];
                field = split[1];
              }

              if (!item.langs[langCode]) item.langs[langCode] = {};
              item.langs[langCode][field] = value;
            }
          });

          if (item.item_type && !item.unique_key && !item.id) {
            const firstContent = Object.values(item.langs)[0]?.content;
            if (firstContent)
              item.unique_key = firstContent.toLowerCase().replace(/\s+/g, "_");
          }

          return item;
        })
        .filter(Boolean);

      setPreviewData(parsed);
      toast.success(`${parsed.length}건 변환 성공!`);
    } catch (e) {
      alert("텍스트 변환 실패:\n" + e.message);
    }
  };

  // 5. 업로드 실행
  const handleUpload = async () => {
    if (!previewData || !onUpload) return;
    const mode = activeTab === "text" ? "Bulk Text" : "JSON";
    if (
      !confirm(`[${mode}] 총 ${previewData.length}건을 DB에 저장하시겠습니까?`)
    )
      return;

    const success = await onUpload(previewData);
    if (success) {
      setJsonInput("");
      setTextInput("");
      setPreviewData(null);
      if (onRefresh) onRefresh();
      setActiveTab("list");
    }
  };

  // 🌟 공통 미리보기 테이블 렌더러 (디자인 통일의 핵심)
  const renderPreviewTable = () => {
    if (!previewData || previewData.length === 0) return null;

    return (
      <div className="preview-area">
        <h3 style={{ margin: "20px 0 10px", color: "#2563eb" }}>
          미리보기 ({previewData.length}건)
        </h3>
        <div className="table-wrapper" style={{ border: "2px solid #2563eb" }}>
          <table>
            {/* 부모가 전달해준 헤더 그대로 사용 */}
            {renderListHeader}
            <tbody>
              {/* 부모가 전달해준 행 렌더러 그대로 사용 */}
              {previewData.map((item, idx) =>
                renderListRow(item, idx, idx + 1),
              )}
            </tbody>
          </table>
        </div>
        <Button
          fullWidth
          onClick={handleUpload}
          className="mt-4"
          icon={<HiClipboardDocumentCheck />}
        >
          DB에 저장하기
        </Button>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>
          {title} ({filteredData.length})
        </h2>
        <div className="tabs">
          <button
            className={activeTab === "list" ? "active" : ""}
            onClick={() => {
              setActiveTab("list");
              setPreviewData(null);
            }}
          >
            <HiListBullet size={20} /> 목록 조회
          </button>
          <button
            className={activeTab === "text" ? "active" : ""}
            onClick={() => {
              setActiveTab("text");
              setPreviewData(null);
            }}
          >
            <HiPencilSquare size={20} /> Bulk 수정 (AI)
          </button>
          <button
            className={activeTab === "json" ? "active" : ""}
            onClick={() => {
              setActiveTab("json");
              setPreviewData(null);
            }}
          >
            <HiCodeBracket size={20} /> JSON (Raw)
          </button>
        </div>
      </div>

      {/* 1. 목록 조회 탭 */}
      {activeTab === "list" && (
        <div className="list-view">
          {renderAddForm && (
            <div
              className="admin-single-add-wrapper"
              style={{ marginBottom: "20px" }}
            >
              {renderAddForm}
            </div>
          )}

          <div className="search-bar">
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

          <div className="table-wrapper">
            <table>
              {renderListHeader}
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, idx) =>
                    renderListRow(item, idx, getDisplayNo(idx)),
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
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
      )}

      {/* 2. Bulk Text 탭 */}
      {activeTab === "text" && (
        <div className="json-uploader-container">
          <div
            className="guide-box"
            style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#0284c7" }}>
              📝 Bulk Text 수정 가이드
            </h4>
            <div
              style={{
                fontSize: "0.9rem",
                color: "#334155",
                lineHeight: "1.6",
              }}
            >
              <p>
                1. <strong>[목록 조회]</strong> 탭에서 수정할 항목들을 체크하고{" "}
                <strong>ID 복사</strong>하세요.
              </p>
              <p>
                2. 아래 입력창에 붙여넣고 <strong>[IDs로 불러오기]</strong>{" "}
                버튼을 누르세요.
              </p>
              <p>
                3. 텍스트가 변환되면, 이를 복사해{" "}
                <strong>AI에게 수정을 요청</strong>하세요.
              </p>
              <p>
                4. AI의 답변(Pipe <code>|</code> 형식)을 다시 여기에 붙여넣고
                변환하세요.
              </p>
            </div>
          </div>

          <div
            className="action-area"
            style={{ marginBottom: "10px", justifyContent: "flex-start" }}
          >
            <Button
              variant="secondary"
              size="sm"
              icon={<HiArrowPath />}
              onClick={handleLoadFromIds}
            >
              입력된 IDs로 데이터 불러오기
            </Button>
          </div>

          <textarea
            className="json-textarea"
            placeholder={`[여기에 ID 목록이나 Pipe(|) 데이터를 붙여넣으세요]\n\n예시:\nid | key | ko-KR | en-US\n(비워둠) | apple | 사과 | Apple`}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            style={{
              minHeight: "300px",
              whiteSpace: "pre",
              fontFamily: "monospace",
            }}
          />

          <div className="action-area">
            <Button onClick={handleParseText} disabled={!textInput}>
              데이터 변환 및 미리보기
            </Button>
          </div>

          {/* 🌟 공통 미리보기 테이블 렌더링 */}
          {renderPreviewTable()}
        </div>
      )}

      {/* 3. JSON 탭 */}
      {activeTab === "json" && (
        <div className="json-uploader-container">
          <div className="guide-box">
            <p>
              💡 <strong>AI JSON 프롬프트</strong>
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(aiGuide);
                toast.success("프롬프트 복사됨!");
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
          <div className="action-area">
            <Button onClick={handleParseJson} disabled={!jsonInput}>
              JSON 검증 및 미리보기
            </Button>
          </div>

          {/* 🌟 공통 미리보기 테이블 렌더링 */}
          {renderPreviewTable()}
        </div>
      )}
    </div>
  );
};

export default AdminPageContainer;
