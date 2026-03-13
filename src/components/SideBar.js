import React from "react";

const Sidebar = ({
  chats = [],
  selectChat,
  darkMode,
  currentChat,
  openAddUser,
  openProfile,
}) => {
  return (
    <div
      style={{
        ...styles.container,
        background: darkMode ? "#202c33" : "#ffffff",
      }}
    >
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <button onClick={openProfile} style={styles.profileBtn}>
          👤 My Profile
        </button>

        <button onClick={openAddUser} style={styles.addBtn}>
          ➕ Add User
        </button>
      </div>

      {/* CHAT LIST */}
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => selectChat(chat)}
          style={{
            ...styles.chatRow,
            background:
              currentChat?.id === chat.id
                ? darkMode
                  ? "#2a3942"
                  : "#e0f2fe"
                : "transparent",
            color: darkMode ? "#e9edef" : "#111",
          }}
        >
          {/* AVATAR */}
          <div style={styles.avatar}>
            {chat.username?.charAt(0).toUpperCase()}
          </div>

          {/* USER INFO */}
          <div>
            <div style={styles.username}>{chat.username}</div>

            <div style={styles.lastMsg}>
              {chat.lastMessage || "No messages yet"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    width: 300,
    borderRight: "1px solid #e5e7eb",
    height: "100vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },

  /* TOP BAR */
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    borderBottom: "1px solid #e5e7eb",
  },

  profileBtn: {
    padding: "6px 10px",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 500,
  },

  addBtn: {
    padding: "6px 10px",
    background: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 500,
  },

  /* CHAT ROW */
  chatRow: {
    display: "flex",
    padding: "12px 16px",
    gap: 12,
    cursor: "pointer",
    alignItems: "center",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#2563EB",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  username: {
    fontWeight: 600,
  },

  lastMsg: {
    fontSize: 12,
    color: "#64748B",
  },
};

export default Sidebar;