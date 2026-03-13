import React, { useState } from "react";
import Logout from "./Logout";

const Profile = ({ user, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    bio: user.bio || "",
    location: user.location || "",
    dob: user.dob || "",
    social: user.social?.join(", ") || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    Object.assign(user, {
      ...formData,
      social: formData.social.split(",").map((s) => s.trim()),
    });
    setIsEditing(false);
    alert("Profile updated locally!");
  };

  if (!user) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.close} onClick={onClose}>
          ✕
        </div>

        <div style={styles.header}>
          <div style={styles.avatar}>{user.username?.charAt(0).toUpperCase()}</div>
          <h2 style={styles.username}>{user.username}</h2>
          <p style={styles.email}>{user.email}</p>
        </div>

        {!isEditing ? (
          <>
            <div style={styles.details}>
              {user.fullName && (
                <div style={styles.detailItem}>
                  <span style={styles.label}>Full Name:</span> {user.fullName}
                </div>
              )}
              {user.phone && (
                <div style={styles.detailItem}>
                  <span style={styles.label}>Phone:</span> {user.phone}
                </div>
              )}
              {user.bio && (
                <div style={styles.detailItem}>
                  <span style={styles.label}>Bio:</span> {user.bio}
                </div>
              )}
              {user.location && (
                <div style={styles.detailItem}>
                  <span style={styles.label}>Location:</span> {user.location}
                </div>
              )}
              {user.dob && (
                <div style={styles.detailItem}>
                  <span style={styles.label}>DOB:</span> {new Date(user.dob).toLocaleDateString()}
                </div>
              )}
              {user.social?.length > 0 && (
                <div style={styles.detailItem}>
                  <span style={styles.label}>Social:</span> {user.social.join(", ")}
                </div>
              )}
            </div>

            <button style={{ ...styles.button, ...styles.editButton }} onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </>
        ) : (
          <>
            <div style={styles.details}>
              {["fullName", "phone", "bio", "location", "dob", "social"].map((field) => (
                <div key={field} style={styles.detailItem}>
                  <span style={styles.label}>
                    {field === "dob" ? "DOB:" : field.charAt(0).toUpperCase() + field.slice(1) + ":"}
                  </span>
                  {field === "bio" ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      style={styles.input}
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field === "dob" ? "date" : "text"}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={styles.buttonGroup}>
              <button style={{ ...styles.button, ...styles.saveButton }} onClick={handleSave}>
                Save
              </button>
              <button style={{ ...styles.button, ...styles.cancelButton }} onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </>
        )}

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
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  container: {
    width: 400,
    maxHeight: "90vh",
    background: "#f9f9f9",
    borderRadius: 20,
    padding: 30,
    position: "relative",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
    overflowY: "auto",
  },
  close: {
    position: "absolute",
    right: 20,
    top: 15,
    fontSize: 22,
    fontWeight: "bold",
    color: "#555",
    cursor: "pointer",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: "#2563EB",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    margin: "0 auto 12px",
    fontWeight: "bold",
    boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
  },
  header: {
    textAlign: "center",
    marginBottom: 25,
  },
  username: {
    margin: 0,
    fontSize: 22,
    color: "#111",
  },
  email: {
    margin: 0,
    fontSize: 14,
    color: "#666",
  },
  details: {
    padding: "15px 0",
    borderTop: "1px solid #e0e0e0",
    borderBottom: "1px solid #e0e0e0",
  },
  detailItem: {
    marginBottom: 15,
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    padding: 8,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14,
    width: "100%",
    outline: "none",
    transition: "border 0.2s",
  },
  inputFocus: {
    border: "1px solid #2563EB",
  },
  button: {
    padding: 10,
    borderRadius: 8,
    border: "none",
    fontWeight: "600",
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  editButton: {
    width: "100%",
    background: "#2563EB",
    color: "#fff",
  },
  saveButton: {
    width: "48%",
    background: "#16A34A",
    color: "#fff",
  },
  cancelButton: {
    width: "48%",
    background: "#EF4444",
    color: "#fff",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 20,
  },
  logoutBox: {
    marginTop: 25,
    textAlign: "center",
  },
};

export default Profile;