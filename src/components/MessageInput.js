import React, { useState, useRef } from "react";

const MessageInput = ({ sendMessage, darkMode }) => {
  const [text, setText] = useState("");
  const fileRef = useRef();

  const handleSend = () => {
    if (!text.trim()) return;

    sendMessage({
      type: "text",
      message: text,
    });

    setText("");
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("video")
      ? "video"
      : "file";

    sendMessage({
      type,
      file,
      message: file.name,
    });
  };

  return (
    <div
      style={{
        ...styles.container,
        background: darkMode ? "#202c33" : "#fff",
      }}
    >
      {/* Emoji Button */}
      <button style={styles.iconBtn} title="Emoji">
        😊
      </button>

      {/* File Upload */}
      <button
        style={styles.iconBtn}
        title="Attach file"
        onClick={() => fileRef.current.click()}
      >
        📎
      </button>

      <input
        ref={fileRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFile}
      />

      {/* Text Input */}
      <input
        type="text"
        value={text}
        placeholder="Type a message"
        onChange={(e) => setText(e.target.value)}
        style={{
          ...styles.input,
          background: darkMode ? "#2a3942" : "#f1f5f9",
          color: darkMode ? "#e9edef" : "#111",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      {/* Voice Button */}
      <button style={styles.iconBtn} title="Voice message">
        🎤
      </button>

      {/* Send Button */}
      <button
        style={styles.sendBtn}
        onClick={handleSend}
        disabled={!text.trim()}
      >
        ➤
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderTop: "1px solid #e5e7eb",
  },

  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 20,
    border: "none",
    outline: "none",
  },

  sendBtn: {
    padding: "8px 14px",
    border: "none",
    borderRadius: 20,
    background: "#2563EB",
    color: "#fff",
    cursor: "pointer",
  },

  iconBtn: {
    border: "none",
    background: "transparent",
    fontSize: 20,
    cursor: "pointer",
  },
};

export default MessageInput;