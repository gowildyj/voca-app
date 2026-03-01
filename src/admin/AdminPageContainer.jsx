import React, { useState, useMemo } from "react";
import Button from "@/components/common/Button";
import {
  HiClipboardDocumentCheck,
  HiListBullet,
  HiCodeBracket,
  HiMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import "@/styles/admin/adminContent.css";

const AdminPageContainer = ({
  title,
  aiGuide,
  jsonPlaceholder,
  data = [],
  onUpload,
  onRefresh,
  renderListHeader,
  renderListRow,
  renderAddForm, // 🌟 UI 요소(React Element)로 받음
  searchPlaceholder = "검색어를 입력하세요...",
  itemsPerPage = 10,
}) => {
  const [activeTab, setActiveTab] = useState("list");
  const [jsonInput, setJsonInput] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 1. 데이터 필터링 (검색)
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data, searchTerm]);

  // 2. 페이지네이션 계산
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleParse = () => {
    try {
      const sanitizedInput = jsonInput
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, '"');
      const parsed = JSON.parse(sanitizedInput);
      if (!Array.isArray(parsed))
        throw new Error("데이터는 배열([]) 형태여야 합니다.");
      setPreviewData(parsed);
    } catch (e) {
      alert("JSON 형식이 올바르지 않습니다.\n" + e.message);
    }
  };

  const handleUpload = async () => {
    if (!previewData || !onUpload) return;
    if (!confirm(`총 ${previewData.length}건의 데이터를 등록하시겠습니까?`))
      return;
    const success = await onUpload(previewData);
    if (success) {
      alert("등록 완료!");
      setJsonInput("");
      setPreviewData(null);
      if (onRefresh) onRefresh();
      setActiveTab("list");
    }
  };

  const getDisplayNo = (index) => (currentPage - 1) * itemsPerPage + index + 1;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>
          {title} ({filteredData.length})
        </h2>
        <div className="tabs">
          <button
            className={activeTab === "list" ? "active" : ""}
            onClick={() => setActiveTab("list")}
          >
            <HiListBullet size={20} /> 목록 조회
          </button>
          <button
            className={activeTab === "json" ? "active" : ""}
            onClick={() => setActiveTab("json")}
          >
            <HiCodeBracket size={20} /> JSON 일괄 등록
          </button>
        </div>
      </div>

      {activeTab === "json" ? (
        <div className="json-uploader-container">
          <div className="guide-box">
            <p>
              💡 <strong>AI Native 등록 방식</strong>
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(aiGuide)}
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
            <Button onClick={handleParse} disabled={!jsonInput}>
              검증 및 미리보기
            </Button>
          </div>
          {previewData && (
            <div className="preview-area">
              <h3>미리보기 ({previewData.length}건)</h3>
              <div className="table-wrapper">
                <table>
                  {renderListHeader}
                  <tbody>
                    {previewData.map((item, idx) =>
                      renderListRow(item, idx, idx + 1),
                    )}
                  </tbody>
                </table>
              </div>
              <Button fullWidth onClick={handleUpload} className="mt-4">
                DB에 저장하기
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="list-view">
          {/* 🌟 [수정] 단건 추가 폼: 목록 조회 탭일 때 상단에 항상 노출 */}
          {renderAddForm && (
            <div
              className="admin-single-add-wrapper"
              style={{ marginBottom: "20px" }}
            >
              {renderAddForm}
            </div>
          )}

          <div
            className="view-status"
            style={{
              marginBottom: "10px",
              fontSize: "0.85rem",
              color: "#64748b",
            }}
          >
            총 <strong>{filteredData.length}</strong>개 중{" "}
            {Math.min(
              filteredData.length,
              (currentPage - 1) * itemsPerPage + 1,
            )}{" "}
            - {Math.min(filteredData.length, currentPage * itemsPerPage)} 표시
          </div>

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
    </div>
  );
};

export default AdminPageContainer;
