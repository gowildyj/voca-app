import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({
  messages,
  isTextHidden,
  isMeaningHidden,
  onSlotChange,
}) => {
  const bottomRef = useRef(null);

  // 새 메시지가 오면 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="message-list-container">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          data={msg}
          isMe={msg.role === "me"}
          hideText={isTextHidden}
          hideMeaning={isMeaningHidden}
          onSlotChange={onSlotChange}
        />
      ))}
      <div ref={bottomRef} style={{ height: "20px" }} />
    </div>
  );
};

export default MessageList;
