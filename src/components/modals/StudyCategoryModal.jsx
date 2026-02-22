import React from "react";
import BottomSheet from "./BottomSheet";
import { Check } from "lucide-react";
import "@/styles/components/modals/studyCategoryModal.css";
import { LANG_OPTIONS } from "@/constants/languages";

/**
 * 설정의 '디자인 테마' 선택 카드와 유사한 UI로 구성된 언어 선택 모달입니다.
 */
const StudyCategoryModal = ({ isOpen, onClose, onSelect, currentCategory }) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="학습 언어 선택">
      <div className="v-category-modal-content">
        <div className="v-category-grid">
          {LANG_OPTIONS.map((lang) => (
            <button
              key={lang.value}
              className={`v-category-card ${currentCategory === lang.value ? "active" : ""}`}
              onClick={() => onSelect(lang.value)}
            >
              {/* 국기 이미지 영역: 이모지 대신 이미지를 넣을 수 있게 img 태그 구조로 변경 */}
              <div className="v-category-flag-wrapper">
                {lang.flagUrl ? (
                  <img
                    src={lang.flagUrl}
                    alt={lang.label}
                    className="v-category-flag-img"
                  />
                ) : (
                  <span className="v-category-flag-emoji">{lang.icon}</span>
                )}
              </div>

              <div className="v-category-info">
                <span className="v-category-label">{lang.label}</span>
                <span> / </span>
                <span className="v-category-desc">
                  {lang.value.toUpperCase()}
                </span>
              </div>

              {/* 활성화 상태 표시 (체크 아이콘) */}
              {currentCategory === lang.value && (
                <div className="v-category-check">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
};

export default StudyCategoryModal;
