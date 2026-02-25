const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();
const supabase = require("./supabaseClient");

const PORT = process.env.PORT || 3001;


app.use(express.json());
app.use(cors());
const server = http.createServer(app);

const roomUsers = {};

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

//<----> room id generation
app.post("/create-room", async (req, res) => {
  const { latitude, longitude } = req.body;
  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Location required" });
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert([{ latitude, longitude }])
    .select();

  if (error) {
    console.log("Error creating room:", error);
    return res.status(500).json({ error: "Room creation failed" });
  }

  res.json({ roomId: data[0].id });
});

io.on("connection", (socket) => {
  console.log(`User Connected : ${socket.id}`);

  socket.on("join_room", ({ roomId, username }) => {
    // frontend se roomId send krenge and it will be in data variable

    socket.join(roomId);
    socket.username = username;
    socket.room = roomId;

    // room exist or not shit
    if (!roomUsers[roomId]) {
      roomUsers[roomId] = 0;
    }

    roomUsers[roomId]++;

    console.log(`User joined ${roomId}`);
    console.log("Room users:", roomUsers);
    console.log(`User with ID : ${socket.id} joined the room : ${roomId}`);

    io.to(roomId).emit("room_count", roomUsers[roomId]);
    socket.roomId = roomId;
  });

  // typing indicator
  socket.on("typing", (roomId) => {
    socket.to(roomId).emit("show_typing", {
      user: socket.username,
    });
  });

  // stop typing event
  socket.on("stop_typing", (roomId) => {
    socket.to(roomId).emit("hide_typing");
  });

  socket.on("send_message", async (data) => {
    const { room, user_id, message, author } = data;

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000 * 2).toISOString(); // 1hr*2=2hr
    const { error } = await supabase.from("messages").insert([
      {
        room_id: room, //"2687ecff-6051-42b1-9a78-9701b3c8bae0"
        user_id: user_id,
        username: author,
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
    const room = socket.room;

    if (room && roomUsers[room]) {
      roomUsers[room]--;

      if (roomUsers[room] <= 0) {
        delete roomUsers[room];
      } else {
        io.to(room).emit("room_count", roomUsers[room]);
      }
    }

    console.log("User disconnected");
  });
});


app.post("/rooms", async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude==null || longitude==null) {
    return res.status(400).json({ error: "Location required" });
  }

  const { data, error } = await supabase
    .from("rooms")
    .select("*");

  if (error) {
    return res.status(500).json({ error });
  }

  const nearbyRooms = data.filter((room) => {
    if (!room.latitude || !room.longitude) return false;

    const distance = getDistance(
      latitude,
      longitude,
      room.latitude,
      room.longitude
    );

    return distance <= 5; // 5 KM radius
  });

  res.json(nearbyRooms);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
