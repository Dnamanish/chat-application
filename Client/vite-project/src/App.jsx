import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";
import Chats from "./Components/Chats";

const socket = io.connect(import.meta.env.VITE_BACKEND_URL);

function App() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  
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
      }
    );
  }, []);

  //Fetch nearby rooms when location is available
  useEffect(() => {
    if (!userLocation) return;

    const fetchRooms = async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userLocation),
      });

      const data = await response.json();
      setRooms(data);
    };

    fetchRooms();
  }, [userLocation]);

  //  Create Room with location
  const createRoom = async () => {
    if (!username) return alert("Enter your name first");
    if (!userLocation) return alert("Location not ready");

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create-room`, {
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
        !userLocation ? (
          <div className="lobby-container">
            <div style={{ padding: "40px", textAlign: "center", width: "100%" }}>
              <h3>📍 Getting your location...</h3>
            </div>
          </div>
        ) : (
          <div className="lobby-container">
            {/* LEFT SIDE */}
            <div className="rooms-panel">
              <h3>Live Rooms Nearby 📍</h3>

              {rooms.length === 0 && <p>No nearby rooms found</p>}

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

            {/* RIGHT SIDE */}
            <div className="join-panel">
              <h3>Create Nearby Room</h3>

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
        )
      ) : (
        <Chats socket={socket} username={username} roomId={roomId} />
      )}
    </div>
  );
}

export default App;