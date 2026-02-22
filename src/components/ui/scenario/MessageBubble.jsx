import React, { useState } from "react";
import { Volume2 } from "lucide-react";
import SlotPicker from "./SlotPicker";
import "@/styles/components/ui/scenario/messageBubble.css";

const MessageBubble = ({ data, isMe, hideText, hideMeaning, onSlotChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e) => {
    // 슬롯 변경 클릭 시 재생 방지
    if (e.target.closest(".slot-picker")) return;

    setIsPlaying(true);
    console.log(`Playing audio for: ${data.id}`);
    setTimeout(() => setIsPlaying(false), 2000); // 더미 재생 시간
  };

  // 텍스트 안에 있는 {key}를 찾아서 SlotPicker로 교체하는 함수
  const renderContent = () => {
    // 템플릿이 없으면 일반 텍스트 사용
    const content = data.template || data.text;
    if (!data.slots) return content;

    // 정규식으로 {key} 분리
    const parts = content.split(/\{(\w+)\}/g);

    return parts.map((part, index) => {
      // part가 slots에 있는 키라면 SlotPicker 렌더링
      if (data.slots[part]) {
        return (
          <SlotPicker
            key={index}
            messageId={data.id}
            slotKey={part}
            slotData={data.slots[part]}
            onChange={onSlotChange}
          />
        );
      }
      return part;
    });
  };

  // 해석(Meaning)에도 슬롯 값을 반영해서 보여주기
  const renderMeaning = () => {
    let text = data.meaning;
    if (data.slots) {
      Object.keys(data.slots).forEach((key) => {
        const val = data.slots[key].selected;
        // 한글 매핑이 필요하면 여기서 변환 로직 추가
        text = text.replace(`{${key}}`, val);
      });
    }
    return text;
  };

  return (
    <div className={`message-row ${isMe ? "me" : "other"}`}>
      <div
        className={`message-bubble ${isPlaying ? "playing" : ""}`}
        onClick={handlePlay}
      >
        {/* 스피커 아이콘 (재생 중일 때만 표시하거나 항상 작게 표시) */}
        <div className="bubble-icon">
          <Volume2 size={16} className={isPlaying ? "animate-pulse" : ""} />
        </div>

        {/* 1. 문장 영역 */}
        <div className={`bubble-content ${hideText ? "blurred" : ""}`}>
          {renderContent()}
        </div>

        {/* 2. 해석 영역 */}
        {!hideMeaning && (
          <div className="bubble-meaning">{renderMeaning()}</div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
