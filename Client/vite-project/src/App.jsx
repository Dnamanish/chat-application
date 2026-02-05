import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";
import Chats from "./Components/Chats";
import { supabase } from "./supabaseClient";

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const signup = async () => {
      await supabase.auth.signInAnonymously();
    };
    signup();
  },[]);

  const joinRoom = () => {
    if (username !== "" && roomId !== "") {
      socket.emit("join_room", roomId);
      setShowChat(true);
    }
  };

  return (
    <div className="pp">
      {!showChat ? (
        <div className="app">
          <h3>Join a chat</h3>

          <input
            type="text"
            placeholder="John..."
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter room ID"
            onChange={(e) => setRoomId(e.target.value)}
          />

          <button onClick={joinRoom}>Join a room</button>
        </div>
      ) : (
        <Chats socket={socket} username={username} roomId={roomId} />
      )}
    </div>
  );
}

export default App;
