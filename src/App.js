import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/Chat";
import { connectSocket } from "./socket";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!accessToken || !user?.id) return;

    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const expired = payload.exp * 1000 < Date.now();

      if (expired) {
        localStorage.clear();
        return;
      }

      connectSocket(accessToken);
      setLoggedIn(true);
    } catch {
      localStorage.clear();
    }
  }, []);

  if (loggedIn) return <Chat />;

  return showRegister ? (
    <Register switchToLogin={() => setShowRegister(false)} />
  ) : (
    <Login
      setLoggedIn={setLoggedIn}
      switchToRegister={() => setShowRegister(true)}
    />
  );
}

export default App;
