import React, { useState, useEffect } from "react";

const Chats = ({ socket, username, roomId }) => {
  const [currentMessage, setcurrentMessage] = useState("");
  const [messageList, setmessageList] = useState([]);

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
      };

      await socket.emit("send_message", messageData);
      
      setmessageList((list)=>[...list,messageData])

      setcurrentMessage("")
    }
  };

  useEffect(() => {
    const handler = (data) => {
      setmessageList((list) => [...list, data]);
    };

    socket.on("received_message", handler);

    return () => {
      socket.off("received_message", handler);
    };
    // socket.on("received_message", (data) => {
    //   setmessageList((list)=>[...list,data])
    // });
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>

      <div className="chat-body">
        <div className="message-container">
          {messageList.map((messageContent) => {
            // messageContent we'll get this from backend
            return <div className="message" key={messageContent.id} id={username===messageContent.author ? "you" : "other"}>
              <div>
                <div className="message-content">
                  <p>{messageContent.message}</p>
                </div>
                <div className="message-meta">
                  <p>{messageContent.author}</p>
                  <p>{messageContent.time}</p>  
                </div>
              </div>
            </div> 
          })}
        </div>
      </div>

      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(e) => setcurrentMessage(e.target.value)}
          onKeyDown={(e)=>e.key==="Enter" && sendMessage()}
        />
        <button onClick={sendMessage} >&#9658;</button>
      </div>
    </div>
  );
};

export default Chats;

