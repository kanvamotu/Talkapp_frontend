import React from "react";
import Logout from "./Logout";

const Profile = ({ user }) => {
  if (!user) return null;

  return (
    <div
      style={{
        width: 320,
        background: "#ffffff",
        borderRadius: 12,
        boxShadow: "0px 8px 25px rgba(0,0,0,0.15)",
        padding: 25,
        display: "flex",
        flexDirection: "column",
        gap: 15,
      }}
    >
      {/* Avatar */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "#3B82F6",
            color: "#fff",
            fontSize: 36,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 15px",
          }}
        >
          {user.username?.charAt(0).toUpperCase()}
        </div>

        <h2 style={{ margin: 0 }}>{user.username}</h2>
        <p style={{ margin: 0, color: "#64748B" }}>{user.email}</p>
      </div>

      <hr />

      {/* User Information */}
      <div style={{ fontSize: 14, color: "#334155" }}>
        <p>
          <strong>User ID:</strong> {user.id}
        </p>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      {/* Logout Button */}
      <div style={{ marginTop: "auto" }}>
        <Logout
          style={{
            width: "100%",
            padding: 12,
            border: "none",
            borderRadius: 8,
            background: "#EF4444",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
};

export default Profile;
