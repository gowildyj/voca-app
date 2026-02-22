import React, { useState, useEffect } from "react";
import BottomSheet from "./BottomSheet";
import Button from "@/components/common/Button";

const ScenarioSettingModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [tempSettings, setTempSettings] = useState(initialData);

  useEffect(() => {
    if (isOpen) setTempSettings(initialData);
  }, [isOpen, initialData]);

  const handleSave = () => {
    onSave(tempSettings);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="시나리오 설정">
      <div
        className="v-settings-modal-content"
        style={{ paddingBottom: "20px" }}
      >
        <div className="v-settings-list-card">
          {/* 1. 화자 성별 설정 (문장 변형 대응) */}
          <div className="v-list-item">
            <div className="v-item-left" style={{ fontWeight: 600 }}>
              <span>내 캐릭터 성별</span>
            </div>
            <div className="v-segmented-control">
              <button
                className={tempSettings.gender === "female" ? "active" : ""}
                onClick={() =>
                  setTempSettings((p) => ({ ...p, gender: "female" }))
                }
              >
                여성
              </button>
              <button
                className={tempSettings.gender === "male" ? "active" : ""}
                onClick={() =>
                  setTempSettings((p) => ({ ...p, gender: "male" }))
                }
              >
                남성
              </button>
            </div>
          </div>

          {/* 2. 재생 속도 조절 */}
          <div className="v-list-item">
            <div className="v-item-left" style={{ fontWeight: 600 }}>
              <span>재생 속도</span>
            </div>
            <select
              className="v-inline-select"
              value={tempSettings.speed}
              onChange={(e) =>
                setTempSettings((p) => ({ ...p, speed: e.target.value }))
              }
              style={{
                border: "none",
                background: "none",
                color: "var(--primary)",
                fontWeight: 700,
              }}
            >
              <option value="0.8">0.8x (느림)</option>
              <option value="1.0">1.0x (보통)</option>
              <option value="1.2">1.2x (빠름)</option>
            </select>
          </div>

          {/* 3. 자동 연속 재생 */}
          <div className="v-list-item">
            <div className="v-item-left" style={{ fontWeight: 600 }}>
              <span>자동 연속 재생</span>
            </div>
            <div className="v-toggle-wrapper">
              <input
                type="checkbox"
                id="scenario-auto-next"
                className="v-real-toggle"
                checked={tempSettings.autoNext}
                onChange={() =>
                  setTempSettings((p) => ({ ...p, autoNext: !p.autoNext }))
                }
              />
              <label htmlFor="scenario-auto-next" className="v-toggle-label" />
            </div>
          </div>
        </div>

        <div className="mt-24">
          <Button variant="primary" fullWidth onClick={handleSave}>
            설정 완료
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default ScenarioSettingModal;
