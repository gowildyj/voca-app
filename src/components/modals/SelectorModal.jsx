import React from "react";
import BottomSheet from "./BottomSheet";
import { Check } from "lucide-react";
import "@/styles/components/modals/selectorModal.css";

const SelectorModal = ({
  isOpen,
  onClose,
  options = [],
  selectedValue,
  onSelect,
  title = "단어 선택",
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="v-selector-container">
        <ul className="v-selector-list">
          {options.map((option, index) => {
            const isSelected = selectedValue?.word === option.word;

            return (
              <li
                key={index}
                className={`v-selector-item-slim ${isSelected ? "active" : ""}`}
                onClick={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <div className="v-item-text">
                  <span className="v-word">{option.word}</span>
                  <span className="v-meaning">{option.meaning}</span>
                </div>
                {isSelected && <Check size={18} className="v-check-icon" />}
              </li>
            );
          })}
        </ul>
      </div>
    </BottomSheet>
  );
};

export default SelectorModal;
