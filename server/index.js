require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const groupRoutes = require("./routes/groupRoutes");
const groupMessageRoutes = require("./routes/groupMessageRoutes");


app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/group-messages", groupMessageRoutes);


app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database Connected Successfully!",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Connection Failed");
  }
});


const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const { setIO } = require("./socket");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
setIO(io);

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

   socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

   socket.on("join_group", (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`Joined group_${groupId}`);
  });

//  socket.on("send_group_message", (data) => {
//   console.log("send_group_message fired");

//   io.to(`group_${data.group_id}`).emit(
//     "receive_group_message",
//     data
//   );
// });


  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
  });

  //  socket.on("send_group_message", (data) => {
  //   io.emit("receive_group_message", data);
  // });

  socket.on("mention_notification", (data) => {
  io.to(`user_${data.user_id}`).emit("mention_notification", data);
});

  socket.on("message_delivered", (data) => {
    io.emit("message_delivered", data);
 
});
 socket.on("message_seen", (data) => {
    io.emit("message_seen", data);
 });
socket.on("group_message_delivered", (data) => {
    io.emit("group_message_delivered", data);

});

socket.on("group_message_seen", (data) => {
    io.emit("group_message_seen", data);

});



// socket.on("typing", (data) => {
//   socket.broadcast.emit("typing", data);
// });

// socket.on("stop_typing", (data) => {
//   socket.broadcast.emit("stop_typing", data);
// });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
module.exports = { io };