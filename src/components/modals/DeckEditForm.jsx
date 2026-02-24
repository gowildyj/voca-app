// src/components/modals/DeckEditForm.jsx
import React from "react";
import BottomSheet from "@/components/modals/BottomSheet";
import Button from "@/components/common/Button";
import { StyledInput, StyledSelect } from "@/components/common/FormElements";
import { LANG_OPTIONS } from "@/constants/languages";
import { getDefaultLang, getFormData } from "@/utils/commonUtils";
import { toast } from "react-hot-toast";

/**
 * @param {boolean} isEdit - 수정 모드 여부 (add, edit)
 * @param {object} initialData - 수정 시 불러올 기존 데이터
 */
const DeckEditForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}) => {
  const defaultLang = getDefaultLang(initialData?.lang_code);

  const handleSubmit = (e) => {
    const data = getFormData(e);

    if (!data.title || !data.title.trim()) {
      toast.error("단어장 이름을 입력해주세요!", { id: "deck-name-error" });
      return;
    }

    if (onSubmit) {
      onSubmit(data);
      toast.success("성공!");
      onClose();
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "단어장 수정" : "새 단어장 만들기"}
    >
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
          placeholder="단어장 이름"
          autoFocus
        />
        <StyledInput
          name="description"
          label="간단한 설명"
          defaultValue={initialData?.description}
          placeholder="간단한 설명"
        />

        <Button type="submit" fullWidth className="mt-16">
          저장하기
        </Button>
      </form>
    </BottomSheet>
  );
};

export default DeckEditForm;
