import React from "react";
import BottomSheet from "./BottomSheet";
import { StyledInput, StyledTextArea } from "@/components/common/StyledInput";
import Button from "@/components/common/Button";

const WordEditForm = ({ isOpen, onClose, onSave, initialData = {} }) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="단어 추가/수정">
      <div className="form-container" style={{ paddingBottom: "20px" }}>
        <StyledInput
          label="단어 (Word)"
          placeholder="영단어나 문장을 입력하세요"
          defaultValue={initialData.word || ""}
        />
        <StyledTextArea
          label="뜻 (Meaning)"
          placeholder="한글 뜻을 입력하세요"
          defaultValue={initialData.meaning || ""}
        />
        <Button fullWidth onClick={onClose} className="mt-16">
          저장하기
        </Button>
      </div>
    </BottomSheet>
  );
};

export default WordEditForm;
