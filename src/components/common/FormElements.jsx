// src/components/common/FormElements.jsx
import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import "@/styles/components/common/formElements.css";

/**
 * @param {string} label - 입력창 상단에 표시될 이름표
 */
export const StyledInput = forwardRef(({ label, ...props }, ref) => {
  const inputId = props.id || props.name;

  return (
    <div className="input-group">
      <label className="input-label" htmlFor={inputId}>
        {label}
      </label>
      <input ref={ref} id={inputId} className="styled-input" {...props} />
    </div>
  );
});

/**
 * @param {string} label - 텍스트 영역 상단 이름표
 */
export const StyledTextArea = forwardRef(({ label, ...props }, ref) => {
  const inputId = props.id || props.name;

  return (
    <div className="input-group">
      <label className="input-label" htmlFor={inputId}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={inputId}
        className="styled-input"
        rows="3"
        {...props}
      />
    </div>
  );
});

/**
 * @param {string} label - 셀렉트 박스 상단 이름표
 * @param {Array<{value: string, label: string, icon?: string}>} options - 선택 목록 배열
 */
export const StyledSelect = forwardRef(({ label, options, ...props }, ref) => {
  const inputId = props.id || props.name;

  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className="select-wrapper">
        <select
          ref={ref}
          id={inputId}
          className="styled-input custom-select"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="select-arrow-icon" size={20} />
      </div>
    </div>
  );
});
