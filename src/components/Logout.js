import React from "react";

const Logout = ({ style }) => {
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // optional: clear socket if needed
    // window.location.reload();

    window.location.href = "/"; // redirect to login
  };

  return (
    <button onClick={handleLogout} style={style}>
      Logout
    </button>
  );
};

export default Logout;
