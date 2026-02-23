import { io } from "socket.io-client";

let socket = null;

 const API_URL = "http://localhost:10000"
export const connectSocket = (accessToken) => {
  if (socket) return socket;

  socket = io(`${API_URL}`, {
    transports: ["websocket"],
    auth: { token: accessToken },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
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
