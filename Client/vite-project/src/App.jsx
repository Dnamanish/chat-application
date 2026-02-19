import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";
import Chats from "./Components/Chats";

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // Fetch available rooms
  useEffect(() => {
    if (!userLocation) return;

    const fetchRooms = async () => {
      const response = await fetch("http://localhost:3001/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userLocation),
      });

      const data = await response.json();
      setRooms(data);
    };

    fetchRooms();
  }, [userLocation]);

  // fetch location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log("Location error:", error);
      },
    );
  }, []);

  // Create Room
  const createRoom = async () => {
    if (!username) return alert("Enter your name first");
    if (!userLocation) return alert("Location not ready");

    const response = await fetch("http://localhost:3001/create-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userLocation),
    });
    
    const data = await response.json();

    setRoomId(data.roomId);
    socket.emit("join_room", {
      roomId: data.roomId,
      username: username,
    });
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
                    socket.emit("join_room", {
                      roomId: room.id,
                      username: username,
                    });
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
