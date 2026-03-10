import React from "react";

const ChatHeader = ({ receiver, onlineUsers, darkMode, openProfile, startCall, startVideoCall }) => {
  if (!receiver) return <div style={styles.emptyHeader}>Select a user to start chatting</div>;

  const isOnline = onlineUsers?.includes(String(receiver.id));

  return (
    <div style={{ ...styles.container, background: darkMode ? "#202c33" : "#ffffff", color: darkMode ? "#e9edef" : "#111" }}>
      <div style={styles.userSection} onClick={openProfile}>
        <div style={styles.avatar}>{receiver.username?.charAt(0).toUpperCase()}</div>
        <div>
          <div style={styles.username}>{receiver.username}</div>
          <div style={styles.status}>{isOnline ? "🟢 Online" : "⚪ Offline"}</div>
        </div>
      </div>
      <div style={styles.actions}>
        <button style={styles.iconBtn} onClick={startCall} title="Voice Call">📞</button>
        <button style={styles.iconBtn} onClick={startVideoCall} title="Video Call">🎥</button>
      </div>
    </div>
  );
};

const styles = {
  container: { height: 60, borderBottom: "1px solid #e5e7eb", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  emptyHeader: { height: 60, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", borderBottom: "1px solid #e5e7eb" },
  userSection: { display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
  avatar: { width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#6366F1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18 },
  username: { fontWeight: 600, fontSize: 15 },
  status: { fontSize: 12, color: "#64748B" },
  actions: { display: "flex", gap: 10 },
  iconBtn: { border: "none", background: "transparent", fontSize: 20, cursor: "pointer" },
};

export default ChatHeader;