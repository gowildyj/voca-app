import React, { useState, useMemo } from "react";
import Button from "@/components/common/Button";
import {
  HiListBullet,
  HiPlus,
  HiMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
  HiPencilSquare,
} from "react-icons/hi2";
import "@/styles/admin/adminContent.css";

const AdminScenarioContainer = ({
  title,
  data = [],
  onRefresh,
  renderScenarioDetail, // 🌟 오른쪽 상세 편집 UI
  renderAddForm, // 🌟 신규 시나리오 추가 폼
  searchPlaceholder = "시나리오 제목 검색...",
  itemsPerPage = 10,
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddMode, setIsAddMode] = useState(false);

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

  return (
    <div className="admin-page" style={{ maxWidth: "1400px" }}>
      <div className="page-header">
        <h2>
          {title} ({filteredData.length})
        </h2>
        <Button
          icon={<HiPlus />}
          onClick={() => {
            setIsAddMode(true);
            setSelectedId(null);
          }}
        >
          새 시나리오 생성
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "350px 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* --- 왼쪽: 검색 및 목록 (Paging 포함) --- */}
        <div
          className="scenario-sidebar"
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "16px",
          }}
        >
          <div className="search-bar" style={{ marginBottom: "16px" }}>
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
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "0.95rem",
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
                    <span>말풍선 {item.scenario_dialogues?.length || 0}개</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 목록 하단 페이징 */}
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
              <span style={{ fontSize: "0.8rem" }}>
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

        {/* --- 오른쪽: 상세 편집 (대화문 Timeline) --- */}
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
              <h3>🆕 새 시나리오 기본 정보</h3>
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
    </div>
  );
};

export default AdminScenarioContainer;
