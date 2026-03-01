import React, { useState } from "react";
import Button from "@/components/common/Button";
import {
  HiClipboardDocumentCheck,
  HiListBullet,
  HiCodeBracket,
} from "react-icons/hi2";
import "@/styles/admin/adminContent.css"; // 기존 스타일 활용

/**
 * @param {string} title 페이지 제목
 * @param {string} aiGuide AI에게 시킬 프롬프트 내용
 * @param {string} jsonPlaceholder JSON 입력창 예시
 * @param {Array} data 현재 리스트 데이터
 * @param {Function} onUpload JSON 데이터 업로드 함수 (Store Action)
 * @param {Function} onRefresh 데이터 새로고침 함수
 * @param {ReactNode} renderListHeader 테이블 헤더 (<thead>)
 * @param {Function} renderListRow 테이블 행 렌더링 함수 (item => <tr>)
 */
const AdminPageContainer = ({
  title,
  aiGuide,
  jsonPlaceholder,
  data = [],
  onUpload,
  onRefresh,
  renderListHeader,
  renderListRow,
}) => {
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'json'
  const [jsonInput, setJsonInput] = useState("");
  const [previewData, setPreviewData] = useState(null);

  // JSON 파싱
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

  // 업로드 실행
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

  const copyPrompt = () => {
    navigator.clipboard.writeText(aiGuide);
    alert("AI 프롬프트 복사 완료! ChatGPT에 붙여넣으세요.");
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>{title}</h2>
        <div className="tabs">
          <button
            className={activeTab === "list" ? "active" : ""}
            onClick={() => setActiveTab("list")}
          >
            <HiListBullet size={20} />
            목록 조회
          </button>

          <button
            className={activeTab === "json" ? "active" : ""}
            onClick={() => setActiveTab("json")}
          >
            <HiCodeBracket size={20} />
            JSON 일괄 등록
          </button>
        </div>
      </div>

      {activeTab === "json" ? (
        <div className="json-uploader-container">
          {/* 가이드 영역 */}
          <div className="guide-box">
            <p>
              💡 <strong>AI Native 등록 방식</strong>
            </p>
            <p>1. [프롬프트 복사] 후 AI에게 붙여넣으세요.</p>
            <p>2. 생성된 JSON을 아래에 붙여넣고 [검증하기]를 누르세요.</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={copyPrompt}
              icon={<HiClipboardDocumentCheck />}
            >
              프롬프트 복사
            </Button>
          </div>

          {/* 에디터 영역 */}
          <textarea
            className="json-textarea"
            placeholder={jsonPlaceholder}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />

          <div className="action-area">
            <Button onClick={handleParse} disabled={!jsonInput}>
              JSON 검증 및 미리보기
            </Button>
          </div>

          {/* 미리보기 영역 */}
          {previewData && (
            <div className="preview-area">
              <h3>미리보기 ({previewData.length}건)</h3>
              <div className="table-wrapper">
                <table>
                  {renderListHeader}
                  <tbody>
                    {previewData.map((item, idx) => renderListRow(item, idx))}
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
        /* 리스트 뷰 영역 */
        <div className="list-view">
          <div className="table-wrapper">
            <table>
              {renderListHeader}
              <tbody>{data.map((item, idx) => renderListRow(item, idx))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPageContainer;
