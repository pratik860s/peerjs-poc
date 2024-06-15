import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import "./App.css";

const App = () => {
  const [peerId, setPeerId] = useState(null);
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const currentUserVideoRef = useRef(null);
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    // Initialize PeerJS
    peerInstance.current = new Peer({
      host: "peer.harshjmhr.xyz",
      // port: 9000,
      path: "/myapp",
    });

    // Set up event listeners
    peerInstance.current.on("open", function (id) {
      setPeerId(id);
    });
    peerInstance.current.on("call", (call) => {
      // Answer incoming call
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((mediaStream) => {
          currentUserVideoRef.current.srcObject = mediaStream;
          currentUserVideoRef.current.muted = true;
          currentUserVideoRef.current.onloadedmetadata = () => {
            currentUserVideoRef.current.play();
          };
          setIsCallActive(true);
          call.answer(mediaStream);
          call.on("stream", (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.onloadedmetadata = () => {
              remoteVideoRef.current.play();
            };
          });
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
        });
    });

    // Clean up PeerJS instance on unmount
    return () => {
      if (peerInstance.current) {
        peerInstance.current.destroy();
      }
    };
  }, []);

  const call = (remotePeerId) => {
    // Validate remote peer ID
    if (!remotePeerId.trim()) {
      alert("Please enter a valid remote peer ID");
      return;
    }

    // Start call
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.onloadedmetadata = () => {
          currentUserVideoRef.current.play();
        };
        const call = peerInstance.current.call(remotePeerId, mediaStream);
        setIsCallActive(true);
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.onloadedmetadata = () => {
            remoteVideoRef.current.play();
          };
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  };

  const endCall = () => {
    setIsCallActive(false);

    // Stop the video and audio tracks of the local stream
    const localStream = currentUserVideoRef.current.srcObject;
    localStream.getTracks().forEach((track) => {
      track.stop();
    });

    currentUserVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = null;
  };

  return (
    <div className="App">
      <p>Peer Id Is: {peerId}</p>
      <input
        type="text"
        value={remotePeerIdValue}
        onChange={(e) => setRemotePeerIdValue(e.target.value)}
      ></input>
      {isCallActive ? (
        <button onClick={endCall}>End Call</button>
      ) : (
        <button onClick={() => call(remotePeerIdValue)}>Call</button>
      )}
      <div className="videos">
        <div>
          <video ref={currentUserVideoRef} />
        </div>
        <div>
          <video ref={remoteVideoRef} />
        </div>
      </div>
    </div>
  );
};

export default App;
