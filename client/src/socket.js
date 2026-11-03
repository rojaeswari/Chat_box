import { io } from "socket.io-client";

const socket = io("https://chat-box-2-hyl4.onrender.com", {
  autoConnect: false,
  auth: (callback) => {
    const token = localStorage.getItem("token");

    callback({
      token: token || "",
    });
  },
});

export default socket;