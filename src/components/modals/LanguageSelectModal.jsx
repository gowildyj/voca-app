import React from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import Button from "@/components/common/Button";
import { HiXMark, HiCheck } from "react-icons/hi2";

const LanguageSelectModal = ({ isOpen, onClose, type }) => {
  const {
    languages,
    learningLang,
    nativeLang,
    setLearningLang,
    setNativeLang,
    t,
  } = useGlobalStore();

  if (!isOpen) return null;

  const currentVal = type === "learning" ? learningLang : nativeLang;
  const setFunc = type === "learning" ? setLearningLang : setNativeLang;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {type === "learning" ? "배울 언어" : "모국어"} 선택
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
            }}
          >
            <HiXMark size={24} />
          </button>
        </div>
        <div className="lang-list">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className={`lang-item ${currentVal === lang.code ? "active" : ""}`}
              onClick={() => {
                setFunc(lang.code);
                onClose();
              }}
            >
              <span className="lang-emoji">{lang.emoji || "🌐"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold" }}>{lang.name}</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>
                  {lang.code}
                </div>
              </div>
              {currentVal === lang.code && <HiCheck size={20} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectModal;
