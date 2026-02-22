import React, { useState, useEffect } from "react";
import BottomSheet from "./BottomSheet";
import Button from "@/components/common/Button";

const StudySettingModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [tempSettings, setTempSettings] = useState(initialData);

  // 모달이 열릴 때 부모의 최신 설정을 동기화
  useEffect(() => {
    if (isOpen) setTempSettings(initialData);
  }, [isOpen, initialData]);

  const handleSave = () => {
    onSave(tempSettings);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="학습 설정">
      {/* 🌟 디자인 가이드의 컨텐츠 여백 준수 */}
      <div
        className="study-setting-modal-content"
        style={{ paddingBottom: "20px" }}
      >
        {/* 🌟 디자인 가이드: v-settings-list-card 구조 사용 */}
        <div className="v-settings-list-card">
          {/* 1. 자동 재생 토글 */}
          <div className="v-list-item">
            <div
              className="v-item-left"
              style={{ fontWeight: 600, color: "var(--text-main)" }}
            >
              <span>자동 재생</span>
            </div>
            <div className="v-toggle-wrapper">
              <input
                type="checkbox"
                id="study-auto-play-toggle"
                className="v-real-toggle"
                checked={tempSettings.isAutoPlay}
                onChange={() =>
                  setTempSettings((p) => ({ ...p, isAutoPlay: !p.isAutoPlay }))
                }
              />
              {/* 🌟 label이 실제로 그려지는 스위치 역할을 합니다 */}
              <label
                htmlFor="study-auto-play-toggle"
                className="v-toggle-label"
              />
            </div>
          </div>

          {/* 2. 카드 표시 순서 (세그먼트 컨트롤) */}
          <div className="v-list-item">
            <div
              className="v-item-left"
              style={{ fontWeight: 600, color: "var(--text-main)" }}
            >
              <span>카드 표시 순서</span>
            </div>
            <div className="v-segmented-control">
              <button
                className={
                  tempSettings.viewMode === "frontFirst" ? "active" : ""
                }
                onClick={() =>
                  setTempSettings((p) => ({ ...p, viewMode: "frontFirst" }))
                }
              >
                앞면 먼저
              </button>
              <button
                className={
                  tempSettings.viewMode === "backFirst" ? "active" : ""
                }
                onClick={() =>
                  setTempSettings((p) => ({ ...p, viewMode: "backFirst" }))
                }
              >
                뒷면 먼저
              </button>
            </div>
          </div>
        </div>

        {/* 🌟 하단 버튼: 공통 Button 컴포넌트의 fullWidth 활용 */}
        <div className="mt-24">
          <Button variant="primary" fullWidth onClick={handleSave}>
            설정 완료
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default StudySettingModal;
