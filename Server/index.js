const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();
const supabase = require("./supabaseClient");

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected : ${socket.id}`);

  socket.on("join_room", (data) => {
    // frontend se roomId send krenge and it will be in data variable
    socket.join(data);
    console.log(`User with ID : ${socket.id} joined the room : ${data}`);
  });

  socket.on("send_message", async (data) => {
    const { room, user_id, message } = data;

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000 * 2).toISOString(); // 1hr*2=2hr
    const { error } = await supabase.from("messages").insert([
      {
        room_id: "2687ecff-6051-42b1-9a78-9701b3c8bae0" , //room 
        user_id: user_id,
        text: message,
        expires_at: expiresAt,
      },
    ]);

    if (error) {
      console.log("Failed to save message", error);
      return;
    }

    socket.to(data.room).emit("received_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("server is running");
});
