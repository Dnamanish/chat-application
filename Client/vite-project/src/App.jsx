import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";
import Chats from "./Components/Chats";

const socket = io.connect("http://localhost:5173");

function App() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [rooms, setRooms] = useState([]);

  // Fetch available rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const response = await fetch("http://localhost:5173/rooms");
      const data = await response.json();
      setRooms(data);
    };

    fetchRooms();
  }, []);

  // Create Room
  const createRoom = async () => {
    if (!username) return alert("Enter your name first");

    const response = await fetch("http://localhost:5173/create-room", {
      method: "POST",
    });

    const data = await response.json();

    setRoomId(data.roomId);
    socket.emit("join_room", data.roomId);
    setShowChat(true);
  };

  return (
    <div className="pp">
      {!showChat ? (
        <div className="lobby-container">

          {/* LEFT SIDE - LIVE ROOMS */}
          <div className="rooms-panel">
            <h3>Live Rooms</h3>

            {rooms.length === 0 && <p>No rooms yet</p>}

            {rooms.map((room) => (
              <div key={room.id} className="room-card">
                <button
                  onClick={() => {
                    if (!username) {
                      alert("Enter your name first");
                      return;
                    }

                    setRoomId(room.id);
                    socket.emit("join_room", room.id);
                    setShowChat(true);
                  }}
                >
                  Room {room.id.slice(0, 6)}
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE - CREATE */}
          <div className="join-panel">
            <h3>Join a Chat</h3>

            <input
              className="name"
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <button className="createBtn" onClick={createRoom}>
              Create Room
            </button>
          </div>

        </div>
      ) : (
        <Chats socket={socket} username={username} roomId={roomId} />
      )}
    </div>
  );
}

export default App;
