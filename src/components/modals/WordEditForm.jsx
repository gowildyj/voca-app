// src/components/modals/WordEditForm.jsx
import React from "react";
import BottomSheet from "@/components/modals/BottomSheet";
import { StyledInput } from "@/components/common/FormElements";
import Button from "@/components/common/Button";

const WordEditForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // 변경된 데이터 수집
    const updates = {
      word: formData.get("word"),
      meaning: formData.get("meaning"),
      example: formData.get("example"),
    };

    if (onSubmit) {
      onSubmit(updates);
    }

    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="단어 수정">
      <form
        className="modal-form"
        onSubmit={handleSubmit}
        key={initialData?.id || "edit-form"}
      >
        <StyledInput
          name="word"
          label="단어"
          defaultValue={initialData?.word}
        />
        <StyledInput
          name="meaning"
          label="뜻"
          defaultValue={initialData?.meaning}
        />
        <StyledInput
          name="example"
          label="예문"
          defaultValue={initialData?.example}
        />

        <Button type="submit" fullWidth className="mt-16">
          수정 완료
        </Button>
      </form>
    </BottomSheet>
  );
};

export default WordEditForm;
