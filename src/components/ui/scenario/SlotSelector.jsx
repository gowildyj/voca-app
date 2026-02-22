import React from "react";

const SlotSelector = ({ activeSelector, selections, onSelect, onClose }) => (
  <div className="mini-selector-overlay" onClick={onClose}>
    <div
      className="mini-selector-content slim-list"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="list-group">
        {activeSelector.options.map((opt, idx) => (
          <button
            key={idx}
            className={`list-item ${selections[activeSelector.varName]?.word === opt.word ? "active" : ""}`}
            onClick={() => onSelect(activeSelector.varName, opt)}
          >
            <div className="item-info">
              <span className="item-word">{opt.word}</span>
              <span className="item-meaning">{opt.meaning}</span>
            </div>
            {selections[activeSelector.varName]?.word === opt.word && (
              <span className="check-mark">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default SlotSelector;
