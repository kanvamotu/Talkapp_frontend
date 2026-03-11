import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages = [], userId, darkMode, openDeletePopup }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        ...styles.container,
        background: darkMode ? "#111b21" : "#f9fafb",
      }}
    >
      {messages.map((msg) => (
        <MessageBubble
          key={msg?.id}
          msg={msg}
          isMine={msg?.sender === userId}   // ✅ FIX
          darkMode={darkMode}
          openDeletePopup={openDeletePopup}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};

export default MessageList;