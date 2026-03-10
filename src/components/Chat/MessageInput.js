import React, { useState } from "react";

const MessageInput = ({ sendMessage, darkMode }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage({ type: "text", message: text });
    setText("");
  };

  return (
    <div style={{ ...styles.container, background: darkMode ? "#202c33" : "#fff" }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
        style={{ ...styles.input, background: darkMode ? "#2a3942" : "#f1f5f9", color: darkMode ? "#e9edef" : "#111" }}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button style={styles.sendBtn} onClick={handleSend}>Send</button>
    </div>
  );
};

const styles = {
  container: { display: "flex", gap: 8, padding: "8px 16px", borderTop: "1px solid #e5e7eb" },
  input: { flex: 1, padding: "10px 12px", borderRadius: 8, border: "none", outline: "none" },
  sendBtn: { padding: "10px 16px", border: "none", borderRadius: 8, background: "#2563EB", color: "#fff", cursor: "pointer" },
};

export default MessageInput;