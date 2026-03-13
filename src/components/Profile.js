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
    // Update the local user object (frontend only)
    Object.assign(user, {
      ...formData,
      social: formData.social.split(",").map(s => s.trim())
    });
    setIsEditing(false);
    alert("Profile updated locally!");
  };

  if (!user) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.close} onClick={onClose}>✕</div>

        <div style={styles.header}>
          <div style={styles.avatar}>{user.username?.charAt(0).toUpperCase()}</div>
          <h2>{user.username}</h2>
          <p>{user.email}</p>
        </div>

        {!isEditing ? (
          <>
            <div style={styles.details}>
              {user.fullName && <div style={styles.detailItem}><strong>Full Name:</strong> {user.fullName}</div>}
              {user.phone && <div style={styles.detailItem}><strong>Phone:</strong> {user.phone}</div>}
              {user.bio && <div style={styles.detailItem}><strong>Bio:</strong> {user.bio}</div>}
              {user.location && <div style={styles.detailItem}><strong>Location:</strong> {user.location}</div>}
              {user.dob && <div style={styles.detailItem}><strong>DOB:</strong> {new Date(user.dob).toLocaleDateString()}</div>}
              {user.social?.length > 0 && <div style={styles.detailItem}><strong>Social:</strong> {user.social.join(", ")}</div>}
            </div>

            <button style={styles.editButton} onClick={() => setIsEditing(true)}>Edit Profile</button>
          </>
        ) : (
          <>
            <div style={styles.details}>
              <div style={styles.detailItem}>
                <strong>Full Name:</strong>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
              </div>
              <div style={styles.detailItem}>
                <strong>Phone:</strong>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div style={styles.detailItem}>
                <strong>Bio:</strong>
                <textarea name="bio" value={formData.bio} onChange={handleChange} />
              </div>
              <div style={styles.detailItem}>
                <strong>Location:</strong>
                <input type="text" name="location" value={formData.location} onChange={handleChange} />
              </div>
              <div style={styles.detailItem}>
                <strong>DOB:</strong>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
              </div>
              <div style={styles.detailItem}>
                <strong>Social (comma separated):</strong>
                <input type="text" name="social" value={formData.social} onChange={handleChange} />
              </div>
            </div>

            <button style={styles.saveButton} onClick={handleSave}>Save</button>
            <button style={styles.cancelButton} onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        )}

        <div style={styles.logoutBox}><Logout /></div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 },
  container: { width: 360, background: "#fff", borderRadius: 16, padding: 25, position: "relative", maxHeight: "90vh", overflowY: "auto" },
  close: { position: "absolute", right: 15, top: 10, fontSize: 20, cursor: "pointer" },
  avatar: { width: 80, height: 80, borderRadius: "50%", background: "#2563EB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 10px" },
  header: { textAlign: "center", marginBottom: 20 },
  details: { padding: "10px 0", borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd" },
  detailItem: { marginBottom: 10, fontSize: 14, lineHeight: 1.5, display: "flex", flexDirection: "column" },
  logoutBox: { marginTop: 20, textAlign: "center" },
  editButton: { marginTop: 15, padding: 8, width: "100%", cursor: "pointer" },
  saveButton: { marginTop: 15, padding: 8, width: "48%", marginRight: "4%", cursor: "pointer" },
  cancelButton: { marginTop: 15, padding: 8, width: "48%", cursor: "pointer" },
};

export default Profile;