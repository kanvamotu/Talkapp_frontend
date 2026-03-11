import React from "react";

const MessageBubble = ({ msg, isMine, darkMode, onReply, onEdit, openDeletePopup }) => {

  const time = msg?.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div
      style={{
        ...styles.wrapper,
        justifyContent: isMine ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          ...styles.bubble,
          background: isMine
            ? darkMode
              ? "#005c4b"
              : "#DCFCE7"
            : darkMode
            ? "#202c33"
            : "#ffffff",
          color: darkMode ? "#e9edef" : "#111",
        }}
        
          onContextMenu={(e) => {
  e.preventDefault();
  openDeletePopup(msg);

        }}
      >
        {msg?.reply_to && (
          <div style={styles.replyBox}>
            <div style={styles.replyLabel}>Reply</div>

            <div style={styles.replyText}>
              {msg?.reply_type === "image" && "📷 Photo"}
              {msg?.reply_type === "video" && "🎥 Video"}
              {msg?.reply_type === "audio" && "🎤 Voice"}
              {msg?.reply_type === "text" && msg?.reply_message}
            </div>
          </div>
        )}

        {msg?.type === "text" && <div style={styles.text}>{msg?.message}</div>}

        {msg?.type === "image" && (
          <img src={msg?.mediaUrl} alt="img" style={styles.image} />
        )}

        {msg?.type === "video" && (
          <video controls style={styles.video}>
            <source src={msg?.mediaUrl} type="video/mp4" />
          </video>
        )}

        {msg?.type === "audio" && (
          <audio controls>
            <source src={msg?.mediaUrl} type="audio/mpeg" />
          </audio>
        )}

        <div style={styles.footer}>
          <span style={styles.time}>{time}</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    width: "100%",
    marginBottom: 10,
  },

  bubble: {
    maxWidth: "65%",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    position: "relative",
  },

  text: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  image: {
    maxWidth: 230,
    borderRadius: 8,
  },

  video: {
    maxWidth: 240,
    borderRadius: 8,
  },

  replyBox: {
    background: "#e2e8f0",
    borderLeft: "3px solid #3B82F6",
    padding: "4px 8px",
    borderRadius: 4,
    marginBottom: 6,
  },

  replyLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },

  replyText: {
    fontSize: 12,
    color: "#334155",
  },

  footer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 5,
  },

  time: {
    fontSize: 10,
    opacity: 0.7,
  },
};

export default MessageBubble;