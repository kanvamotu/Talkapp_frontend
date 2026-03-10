import React from "react";
import Logout from "../Logout";

const Profile = ({ user }) => {
  if (!user) return null;

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.avatar}>
          {user.username?.charAt(0).toUpperCase()}
        </div>

        <h2 style={styles.name}>{user.username}</h2>
        <p style={styles.email}>{user.email}</p>

        <span style={styles.status}>Active</span>
      </div>

      <div style={styles.divider}></div>

      {/* USER DETAILS */}
      <div style={styles.details}>
        <Detail label="User ID" value={user.id} />
        <Detail label="Username" value={user.username} />
        <Detail label="Email" value={user.email} />
        <Detail label="Role" value={user.role || "User"} />
        <Detail label="Account Status" value="Verified" green />
        <Detail
          label="Member Since"
          value={new Date(user.createdAt || Date.now()).toLocaleDateString()}
        />
      </div>

      {/* LOGOUT */}
      <div style={styles.logoutBox}>
        <Logout style={styles.logoutBtn} />
      </div>
    </div>
  );
};

const Detail = ({ label, value, green }) => {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <span
        style={{
          ...styles.value,
          color: green ? "#16A34A" : "#0F172A",
        }}
      >
        {value}
      </span>
    </div>
  );
};

const styles = {
  container: {
    width: 360,
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
    padding: 28,
    display: "flex",
    flexDirection: "column",
    fontFamily: "Segoe UI, sans-serif",
  },

  header: {
    textAlign: "center",
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#2563EB,#6366F1)",
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },

  name: {
    margin: "6px 0",
    fontSize: 22,
    fontWeight: 600,
    color: "#0F172A",
  },

  email: {
    margin: 0,
    fontSize: 14,
    color: "#64748B",
  },

  status: {
    display: "inline-block",
    marginTop: 10,
    padding: "5px 12px",
    fontSize: 12,
    background: "#DCFCE7",
    color: "#166534",
    borderRadius: 20,
    fontWeight: 500,
  },

  divider: {
    height: 1,
    background: "#E2E8F0",
    margin: "22px 0",
  },

  details: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    fontSize: 14,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #F1F5F9",
    paddingBottom: 8,
  },

  label: {
    color: "#64748B",
    fontWeight: 500,
  },

  value: {
    fontWeight: 500,
  },

  logoutBox: {
    marginTop: 25,
  },

  logoutBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "none",
    background: "#EF4444",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.2s",
  },
};

export default Profile;