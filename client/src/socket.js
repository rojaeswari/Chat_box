
import { io } from "socket.io-client";

const socket = io("https://chat-box-2-hyl4.onrender.com", {
  
  autoConnect: false,

  transports: ["websocket"],

  auth: (callback) => {
    const token = localStorage.getItem("token");

    callback({
      token: token || "",
    });
  },

  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("SOCKET CONNECTED:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("SOCKET ERROR:", err.message);
});

export default socket;
