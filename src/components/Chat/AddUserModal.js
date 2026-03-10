import React, { useState } from "react";

const AddUserModal = ({ users, onClose, addUser, darkMode }) => {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.overlay}>
      <div
        style={{
          ...styles.modal,
          background: darkMode ? "#202c33" : "#ffffff",
          color: darkMode ? "#e9edef" : "#111",
        }}
      >
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>Add User</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            ✖
          </button>
        </div>

        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...styles.search,
            background: darkMode ? "#2a3942" : "#f1f5f9",
            color: darkMode ? "#e9edef" : "#111",
          }}
        />

        <div style={styles.list}>
          {filteredUsers.length === 0 && (
            <div style={styles.empty}>No users found</div>
          )}

          {filteredUsers.map((u) => (
            <div key={u.id} style={styles.userRow}>
              <div style={styles.userInfo}>
                <div style={styles.avatar}>
                  {u.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={styles.username}>{u.username}</div>
                  <div style={styles.email}>{u.email}</div>
                </div>
              </div>
              <button style={styles.addBtn} onClick={() => addUser(u)}>
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    width: 400,
    borderRadius: 12,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  closeBtn: { border: "none", background: "transparent", fontSize: 18, cursor: "pointer" },
  search: { padding: "10px 12px", borderRadius: 8, border: "none", outline: "none", fontSize: 14 },
  list: { maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 },
  empty: { textAlign: "center", color: "#64748B", padding: 20 },
  userRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" },
  userInfo: { display: "flex", gap: 10, alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: "#2563EB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  username: { fontWeight: 600, fontSize: 14 },
  email: { fontSize: 12, color: "#64748B" },
  addBtn: { border: "none", background: "#22c55e", color: "#fff", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 500 },
};

export default AddUserModal;