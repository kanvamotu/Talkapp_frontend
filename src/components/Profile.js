import React from "react";
import Logout from "./Logout";

const Profile = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>

        {/* Close Button */}
        <div style={styles.close} onClick={onClose}>✕</div>

        {/* Avatar and Basic Info */}
        <div style={styles.header}>
          <div style={styles.avatar}>
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <h2>{user.username}</h2>
          <p>{user.email}</p>
        </div>

        {/* Additional User Details */}
        <div style={styles.details}>
          {user.fullName && (
            <div style={styles.detailItem}><strong>Full Name:</strong> {user.fullName}</div>
          )}
          {user.phone && (
            <div style={styles.detailItem}><strong>Phone:</strong> {user.phone}</div>
          )}
          {user.bio && (
            <div style={styles.detailItem}><strong>Bio:</strong> {user.bio}</div>
          )}
          {user.joined && (
            <div style={styles.detailItem}><strong>Joined:</strong> {new Date(user.joined).toLocaleDateString()}</div>
          )}
          {user.role && (
            <div style={styles.detailItem}><strong>Role:</strong> {user.role}</div>
          )}
          {user.location && (
            <div style={styles.detailItem}><strong>Location:</strong> {user.location}</div>
          )}
          {user.dob && (
            <div style={styles.detailItem}><strong>Date of Birth:</strong> {new Date(user.dob).toLocaleDateString()}</div>
          )}
          {user.status && (
            <div style={styles.detailItem}><strong>Status:</strong> {user.status}</div>
          )}
          {user.social && user.social.length > 0 && (
            <div style={styles.detailItem}>
              <strong>Social:</strong> {user.social.map((link, i) => (
                <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{marginRight:8}}>
                  {link.replace(/^https?:\/\//, '')}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div style={styles.logoutBox}>
          <Logout />
        </div>

      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },

  container: {
    width: 360,
    background: "#fff",
    borderRadius: 16,
    padding: 25,
    position: "relative",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  close: {
    position: "absolute",
    right: 15,
    top: 10,
    fontSize: 20,
    cursor: "pointer",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "#2563EB",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    margin: "0 auto 10px",
  },

  header: {
    textAlign: "center",
    marginBottom: 20,
  },

  details: {
    padding: "10px 0",
    borderTop: "1px solid #ddd",
    borderBottom: "1px solid #ddd",
  },

  detailItem: {
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 1.5,
  },

  logoutBox: {
    marginTop: 20,
    textAlign: "center",
  },
};

export default Profile;