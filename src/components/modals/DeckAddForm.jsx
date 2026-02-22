import React from "react";
import BottomSheet from "@/components/modals/BottomSheet";
import { StyledInput, StyledTextArea } from "@/components/common/StyledInput";
import Button from "@/components/common/Button";

const DeckAddForm = ({ isOpen, onClose, initialData, isEdit = false }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("단어장 저장");
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "단어장 수정" : "새 단어장 만들기"}
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <StyledInput
          label="단어장 이름"
          defaultValue={initialData?.title}
          placeholder="예: 스페인어 여행 회화"
          autoFocus
        />
        <StyledInput
          label="간단 설명"
          defaultValue={initialData?.description}
          placeholder="예: 프랑스 음식 이름 정복하기"
        />

        <Button
          fullWidth
          onClick={() => setIsModalOpen(false)}
          className="mt-16"
        >
          저장하기
        </Button>
      </form>
    </BottomSheet>
  );
};

export default DeckAddForm;
