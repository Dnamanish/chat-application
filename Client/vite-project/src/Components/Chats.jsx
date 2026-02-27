import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { getAnonUserId } from "../utils/anonUser";

const Chats = ({ socket, username, roomId }) => {
  const [currentMessage, setcurrentMessage] = useState("");
  const [messageList, setmessageList] = useState([]);
  const bottomRef = useRef(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUser, setTypingUser] = useState("");

  const typingTimeoutRef = useRef(null);

  const userId = getAnonUserId();

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        id: Date.now(),
        room: roomId,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
        user_id: userId,
      };

      await socket.emit("send_message", messageData);

      setmessageList((list) => [...list, messageData]);

      setcurrentMessage("");
    }
  };

  useEffect(() => {
    if (!roomId) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.log("Error loading messages :", error);
        return;
      }

      const formatted = data.map((msg) => ({
        id: msg.id,
        room: msg.room_id,
        author: msg.username,
        message: msg.text,
        time:
          new Date(msg.created_at).getHours() +
          ":" +
          new Date(msg.created_at).getMinutes(),
        user_id: msg.user_id,
      }));

      setmessageList(formatted);
    };

    loadMessages();
  }, [roomId]);

  useEffect(() => {
    socket.on("show_typing", (data) => {
      setTypingUser(data.user);
    });

    socket.on("hide_typing", () => {
      setTypingUser("");
    });

    return () => {
      socket.off("show_typing");
      socket.off("hide_typing");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("room_count", (count) => {
      setOnlineCount(count);
    });

    return () => {
      socket.off("room_count");
    };
  }, [socket]);

  useEffect(() => {
    const handler = (data) => {
      setmessageList((list) => [...list, data]);
    };

    socket.on("received_message", handler);

    return () => {
      socket.off("received_message", handler);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="header-top">
          <p>Live Chat • {onlineCount} online</p>
        </div>

        {typingUser && (
          <div className="typing-indicator">{typingUser} is typing...</div>
        )}
      </div>

      <div className="chat-body">
        <div className="message-container">
          {messageList.map((messageContent) => {
            // messageContent we'll get this from backend
            return (
              <div
                className="message"
                key={messageContent.id}
                id={userId === messageContent.user_id ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p>
                      {messageContent.author} • {messageContent.time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(e) => {
            setcurrentMessage(e.target.value);

            // clear previous timer
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }

            socket.emit("typing", roomId);

            typingTimeoutRef.current = setTimeout(() => {
              socket.emit("stop_typing", roomId);
            }, 1000); // just 1 sec after stop typing
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
};

export default Chats;
