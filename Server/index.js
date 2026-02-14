const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();
const supabase = require("./supabaseClient");

app.use(express.json());
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

//<----> room id generation
app.post("/create-room", async (req, res) => {
  const { data, error } = await supabase.from("rooms").insert([{}]).select();

  if (error) {
    console.log("Error creating room:", error);
    return res.status(500).json({ error: "Room creation failed" });
  }

  res.json({ roomId: data[0].id });
});

io.on("connection", (socket) => {
  console.log(`User Connected : ${socket.id}`);

  socket.on("join_room", (data) => {
    // frontend se roomId send krenge and it will be in data variable
    socket.join(data);
    console.log(`User with ID : ${socket.id} joined the room : ${data}`);
  });

  socket.on("send_message", async (data) => {
    const { room, user_id, message,author } = data;

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000 * 2).toISOString(); // 1hr*2=2hr
    const { error } = await supabase.from("messages").insert([
      {
        room_id: room, //"2687ecff-6051-42b1-9a78-9701b3c8bae0"
        user_id: user_id,
        username:author,
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


app.get("/rooms", async (req, res) => {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error });
  }

  res.json(data);
});


server.listen(3001, () => {
  console.log("server is running");
});
