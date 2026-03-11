import { io } from "socket.io-client";

let socket = null;

const API_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

export const connectSocket = (accessToken) => {
  if (socket) return socket;

  socket = io(API_URL, {
    transports: ["websocket"],
    auth: { token: accessToken },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("⚠️ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket error:", err.message);

    if (err.message.includes("expired")) {
      localStorage.clear();
      window.location.reload();
    }
  });

  return socket;
};

export const getSocket = () => socket;