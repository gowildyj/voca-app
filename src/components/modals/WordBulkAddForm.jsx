import React from "react";
import Button from "@/components/common/Button";
import BottomSheet from "@/components/modals/BottomSheet";
import { StyledInput, StyledTextArea } from "@/components/common/FormElements";
import "@/styles/components/modals/bottomSheet.css";

const WordBulkAddForm = ({ isOpen, onClose }) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="여러 단어 추가">
      <div className="form-container" style={{ paddingBottom: "20px" }}>
        <div
          className="bulk-guide"
          style={{ marginBottom: "16px", fontSize: "0.85rem", color: "#666" }}
        >
          단어와 뜻을 <strong>줄바꿈</strong>이나 <strong>쉼표</strong>로
          구분해서 입력해주세요.
          <br />
          (예: Apple 사과)
        </div>
        <StyledTextArea
          label="단어 목록 붙여넣기"
          placeholder="Apple 사과&#10;Banana 바나나"
          style={{ minHeight: "200px" }}
        />
        <Button fullWidth onClick={onClose} variant="primary">
          저장하기
        </Button>
      </div>
    </BottomSheet>
  );
};

export default WordBulkAddForm;
