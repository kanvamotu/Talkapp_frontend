import { io } from "socket.io-client";

let socket = null;

const API_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

export const connectSocket = (accessToken) => {
  if (!socket) {
    socket = io(API_URL, {
      transports: ["websocket"],
      auth: { token: accessToken },
      withCredentials: true,
    });

    socket.on("connect", () => {
      
    });

    socket.on("disconnect", (reason) => {
      
    });

    socket.on("connect_error", (err) => {
      
    });
  }

  return socket;
};

export const getSocket = () => socket;