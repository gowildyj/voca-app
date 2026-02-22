import React, { forwardRef } from "react";
import "@/styles/components/common/styledInput.css";

export const StyledInput = forwardRef(({ label, ...props }, ref) => (
  <div className="input-group">
    <label className="input-label-pink">{label}</label>
    <input ref={ref} className="styled-input-pink" {...props} />
  </div>
));

export const StyledTextArea = forwardRef(({ label, ...props }, ref) => (
  <div className="input-group">
    <label className="input-label-pink">{label}</label>
    <textarea ref={ref} className="styled-input-pink" rows="3" {...props} />
  </div>
));
