import React from "react";

const ReplyBar = ({ replyMessage, cancelReply, darkMode }) => {
  if (!replyMessage) return null;

  return (
    <div style={{ ...styles.container, background: darkMode ? "#2a3942" : "#f1f5f9" }}>
      <div>
        Replying to: {replyMessage.message.slice(0, 50)}{replyMessage.message.length > 50 && "..."}
      </div>
      <button onClick={cancelReply} style={styles.closeBtn}>✖</button>
    </div>
  );
};

const styles = {
  container: { display: "flex", justifyContent: "space-between", padding: 10, borderBottom: "1px solid #e5e7eb" },
  closeBtn: { border: "none", background: "transparent", fontSize: 16, cursor: "pointer" },
};

export default ReplyBar;