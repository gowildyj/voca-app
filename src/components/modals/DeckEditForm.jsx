// src/components/modals/DeckEditForm.jsx
import React from "react";
import BottomSheet from "@/components/modals/BottomSheet";
import { StyledInput } from "@/components/common/StyledInput";
import { StyledSelect } from "@/components/common/StyledSelect";
import Button from "@/components/common/Button";
import { LANG_OPTIONS } from "@/constants/languages";

const DeckEditForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = true,
}) => {
  console.log("initialData", { initialData });
  const defaultLang =
    !initialData?.language || initialData?.language === "all"
      ? "ko-KR"
      : initialData.language;

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const title = formData.get("title");
    const description = formData.get("description");
    const language = formData.get("language");

    console.log({ title, description }); // [디버깅용]

    if (!title || !title.trim()) {
      console.warn("⚠️ 제목이 비어있어서 함수 종료");
      alert("단어장 이름을 입력해주세요!");
      return;
    }

    if (onSubmit) {
      onSubmit({ title, description, language });
    } else {
      console.error("❌ [Error] Modal: 실행할 onSubmit이 없습니다!");
    }

    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="단어장 수정">
      <form className="modal-form" onSubmit={handleSubmit}>
        <StyledSelect
          name="language"
          label="학습 언어"
          options={LANG_OPTIONS.filter((l) => l.value !== "all")}
          defaultValue={initialData?.language || defaultLang}
        />
        <StyledInput
          name="title"
          label="단어장 이름"
          defaultValue={initialData?.name || initialData?.title}
          placeholder="예: 스페인어 여행 회화"
          autoFocus
        />
        <StyledInput
          name="description"
          label="간단 설명"
          defaultValue={initialData?.description}
          placeholder="예: 프랑스 음식 이름 정복하기"
        />

        <Button type="submit" fullWidth className="mt-16">
          수정하기
        </Button>
      </form>
    </BottomSheet>
  );
};

export default DeckEditForm;
