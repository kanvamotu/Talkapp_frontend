import React from "react";

const Sidebar = ({
  chats = [],
  selectChat,
  darkMode,
  currentChat,
  openAddUser,
  openProfile
}) => {
  return (
    <div
      style={{
        ...styles.container,
        background: darkMode ? "#202c33" : "#ffffff",
        color: darkMode ? "#e9edef" : "#111"
      }}
    >

      {/* TOP BAR */}
      <div style={styles.topBar}>
        <button onClick={openProfile} style={styles.profileBtn}>
          👤 Profile
        </button>

        <button onClick={openAddUser} style={styles.addBtn}>
          ➕ Add User
        </button>
      </div>

      {/* USER LIST */}
      <div style={styles.chatList}>
        {chats.length === 0 && (
          <div style={styles.empty}>
            No chats yet
          </div>
        )}

        {chats.map((chat) => {
          const active = currentChat?.id === chat.id;

          return (
            <div
              key={chat.id}
              onClick={() => selectChat(chat)}
              style={{
                ...styles.chatRow,
                background: active
                  ? darkMode
                    ? "#2a3942"
                    : "#e0f2fe"
                  : "transparent"
              }}
            >
              {/* AVATAR */}
              <div style={styles.avatar}>
                {chat.username?.charAt(0).toUpperCase()}
              </div>

              {/* USER INFO */}
              <div style={styles.userInfo}>
                <div style={styles.username}>
                  {chat.username}
                </div>

                <div style={styles.lastMsg}>
                  {chat.lastMessage || "No messages yet"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: 300,
    borderRight: "1px solid #e5e7eb",
    height: "100vh",
    display: "flex",
    flexDirection: "column"
  },

  /* TOP BAR */
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    borderBottom: "1px solid #e5e7eb"
  },

  profileBtn: {
    padding: "7px 12px",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 500
  },

  addBtn: {
    padding: "7px 12px",
    background: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 500
  },

  /* CHAT LIST */
  chatList: {
    flex: 1,
    overflowY: "auto"
  },

  empty: {
    padding: 20,
    textAlign: "center",
    color: "#64748B"
  },

  /* CHAT ROW */
  chatRow: {
    display: "flex",
    padding: "12px 16px",
    gap: 12,
    cursor: "pointer",
    alignItems: "center",
    borderBottom: "1px solid #f1f5f9"
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
    fontSize: 16
  },

  userInfo: {
    display: "flex",
    flexDirection: "column"
  },

  username: {
    fontWeight: 600,
    fontSize: 14
  },

  lastMsg: {
    fontSize: 12,
    color: "#64748B"
  }
};

export default Sidebar;

