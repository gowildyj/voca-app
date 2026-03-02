import React, { useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore"; // 아까 만든 스토어
import { logger } from "@/utils/logger";
import Button from "@/components/common/Button";
import { HiClipboardDocumentCheck } from "react-icons/hi2";
import "@/styles/admin/adminContent.css";

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState("json"); // 'list' | 'json'
  const [jsonInput, setJsonInput] = useState("");
  const [previewData, setPreviewData] = useState(null);

  // 스토어에서 데이터 처리 함수 가져오기 (실제 구현 필요)
  // const { uploadBulkData } = useGlobalStore();

  // 1. JSON 파싱 및 미리보기
  const handleParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed))
        throw new Error("데이터는 배열([]) 형태여야 합니다.");
      setPreviewData(parsed);
      logger.success("JSON Parse", parsed);
    } catch (e) {
      alert("JSON 형식이 올바르지 않습니다.\n" + e.message);
      console.log("JSON 형식이 올바르지 않습니다.\n" + e.message);
    }
  };

  // 2. AI 프롬프트 복사
  const copyPrompt = () => {
    const promptText = `(아까 알려드린 프롬프트 내용...)`;
    navigator.clipboard.writeText(promptText);
    alert("AI 프롬프트가 복사되었습니다! ChatGPT에 붙여넣으세요.");
  };

  // 3. 최종 업로드 (여기서 DB와 통신)
  const handleUpload = async () => {
    if (!previewData) return;
    if (!confirm(`총 ${previewData.length}건의 데이터를 등록하시겠습니까?`))
      return;

    // TODO: useGlobalStore의 bulkInsert 함수 호출
    // await uploadBulkData(previewData);

    alert("등록 완료! (콘솔 확인)");
    setJsonInput("");
    setPreviewData(null);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>콘텐츠 관리</h2>
        <div className="tabs">
          <button
            className={activeTab === "list" ? "active" : ""}
            onClick={() => setActiveTab("list")}
          >
            목록 조회
          </button>
          <button
            className={activeTab === "json" ? "active" : ""}
            onClick={() => setActiveTab("json")}
          >
            JSON 등록
          </button>
        </div>
      </div>

      {activeTab === "json" ? (
        <div className="json-uploader-container">
          <div className="guide-box">
            <p>
              💡 <strong>AI Native 등록 방식</strong>
            </p>
            <p>1. 아래 [프롬프트 복사] 버튼을 누르세요.</p>
            <p>2. ChatGPT에게 단어 목록과 함께 프롬프트를 보내세요.</p>
            <p>3. AI가 준 JSON 코드를 아래에 붙여넣고 [검증하기]를 누르세요.</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={copyPrompt}
              icon={<HiClipboardDocumentCheck />}
            >
              프롬프트 복사
            </Button>
          </div>

          <div className="editor-area">
            <textarea
              className="json-textarea"
              placeholder='[ { "item_type": "WORD", ... } ]'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
          </div>

          <div className="action-area">
            <Button onClick={handleParse} disabled={!jsonInput}>
              JSON 검증 및 미리보기
            </Button>
          </div>

          {/* 미리보기 테이블 */}
          {previewData && (
            <div className="preview-area">
              <h3>미리보기 ({previewData.length}건)</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Tags</th>
                      <th>Content (EN)</th>
                      <th>Content (KO)</th>
                      <th>Reading</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`badge ${item.item_type}`}>
                            {item.item_type}
                          </span>
                        </td>
                        <td>{item.tags?.join(", ")}</td>
                        <td>{item.langs?.en?.content}</td>
                        <td>{item.langs?.ko?.content}</td>
                        <td>{item.langs?.ko?.reading}</td>
                      </tr>
                    ))}
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
          <p>여기에 기존 목록 테이블이 들어갑니다.</p>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
