import React from "react";
import Logout from "./Logout";

const Profile = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>

        <div style={styles.close} onClick={onClose}>✕</div>

        <div style={styles.header}>
          <div style={styles.avatar}>
            {user.username?.charAt(0).toUpperCase()}
          </div>

          <h2>{user.username}</h2>
          <p>{user.email}</p>
        </div>

        <div style={styles.logoutBox}>
          <Logout />
        </div>

      </div>
    </div>
  );
};

const styles = {
  overlay:{
    position:"fixed",
    top:0,
    left:0,
    width:"100%",
    height:"100%",
    background:"rgba(0,0,0,0.4)",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    zIndex:50
  },

  container:{
    width:360,
    background:"#fff",
    borderRadius:16,
    padding:25,
    position:"relative"
  },

  close:{
    position:"absolute",
    right:15,
    top:10,
    fontSize:20,
    cursor:"pointer"
  },

  avatar:{
    width:80,
    height:80,
    borderRadius:"50%",
    background:"#2563EB",
    color:"#fff",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontSize:28,
    margin:"0 auto"
  },

  header:{
    textAlign:"center"
  },

  logoutBox:{
    marginTop:20
  }
};

export default Profile;