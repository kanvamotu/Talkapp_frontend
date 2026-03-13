import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/Chat";
import { connectSocket } from "./socket";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!accessToken || !storedUser?.id) return;

    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const expired = payload.exp * 1000 < Date.now();

      if (expired) {
        localStorage.clear();
        return;
      }

      const s = connectSocket(accessToken);

      setUser(storedUser);
      setSocket(s);
      setLoggedIn(true);
    } catch {
      localStorage.clear();
    }
  }, []);

  if (loggedIn && user && socket) {
    return <Chat user={user} socket={socket} darkMode={false} />;
  }

  return showRegister ? (
    <Register switchToLogin={() => setShowRegister(false)} />
  ) : (
    <Login
      setLoggedIn={setLoggedIn}
      setUser={setUser} // <-- add this
      setSocket={setSocket} // <-- add this
      switchToRegister={() => setShowRegister(true)}
    />
  );
}

export default App;
