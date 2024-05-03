import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import "./App.css";

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const peerInstance = useRef(null);
  const connInstance = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      console.log("My peer ID is: " + id);
      setPeerId(id);
    });

    peer.on("connection", (conn) => {
      connInstance.current = conn;
      setIsConnected(true);

      conn.on("data", (data) => {
        const newMessage = {
          sender: conn.peer,
          message: data,
          type: "received",
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    });

    peerInstance.current = peer;

    return () => {
      if (peerInstance.current) {
        peerInstance.current.disconnect();
      }
    };
  }, []);

  const connectToPeer = () => {
    if (!peerInstance.current) {
      console.error("Peer instance is not available.");
      return;
    }

    const conn = peerInstance.current.connect(remotePeerId);

    conn.on("open", () => {
      setIsConnected(true);
      connInstance.current = conn;
      console.log("Connected to: " + remotePeerId);
    });

    conn.on("data", (data) => {
      const newMessage = { sender: conn.peer, message: data, type: "received" };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    conn.on("error", (err) => {
      console.error("Error connecting to peer:", err);
    });
  };

  const sendMessage = () => {
    if (!connInstance.current) {
      console.error("Connection is not established.");
      return;
    }

    if (messageInput.trim() === "") {
      console.error("Message cannot be empty.");
      return;
    }

    const newMessage = { sender: peerId, message: messageInput, type: "sent" };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    connInstance.current.send(messageInput);
    setMessageInput("");
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
  };

  const endChat = () => {
    if (connInstance.current) {
      connInstance.current.close();
      setIsConnected(false);
      setMessages([]);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="chat-container">
      <h1>Chat Application</h1>
      <button onClick={handleBack}>Back</button>
      <div>
        <p>My Peer ID: {peerId}</p>
        <input
          type="text"
          value={remotePeerId}
          onChange={(e) => setRemotePeerId(e.target.value)}
          placeholder="Enter Remote Peer ID"
        />
        <button onClick={connectToPeer}>Connect</button>
      </div>
      {isConnected && (
        <>
          <div>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>
                  {msg.type === "sent" ? (
                    <strong>You: </strong>
                  ) : (
                    <strong>Remote: </strong>
                  )}
                  {msg.message}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <input
              type="text"
              value={messageInput}
              onChange={handleInputChange}
            />
            <button onClick={sendMessage}>Send</button>
            <button onClick={endChat}>End Chat</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatApp;
