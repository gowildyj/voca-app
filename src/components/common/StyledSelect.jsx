// src/components/common/StyledSelect.jsx
import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import "@/styles/components/common/styledInput.css";

export const StyledSelect = forwardRef(({ label, options, ...props }, ref) => (
  <div className="input-group">
    {label && <label className="input-label-pink">{label}</label>}

    <div className="select-wrapper">
      <select ref={ref} className="styled-input-pink custom-select" {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="select-arrow-icon" size={20} />
    </div>
  </div>
));
