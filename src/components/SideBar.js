import React from "react";

const Sidebar = ({
  chats = [],
  selectChat,
  darkMode,
  currentChat,
  openAddUser,
}) => {
  return (
    <div
      style={{
        ...styles.container,
        background: darkMode ? "#202c33" : "#ffffff",
      }}
    >
      {/* ADD USER BUTTON */}
      <button onClick={openAddUser} style={styles.addBtn}>
        ➕ Add User
      </button>
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => selectChat(chat)}
          style={{
            ...styles.chatRow,
            background: currentChat?.id === chat.id ? "#3B82F6" : "transparent",
            color: darkMode ? "#e9edef" : "#111",
          }}
        >
          <div style={styles.avatar}>
            {chat.username?.charAt(0).toUpperCase()}
          </div>

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
  },

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

  addBtn: {
  width: "90%",
  margin: "10px",
  padding: "8px",
  background: "#2563EB",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 500,
},

  lastMsg: {
    fontSize: 12,
    color: "#64748B",
  },
};

export default Sidebar;
