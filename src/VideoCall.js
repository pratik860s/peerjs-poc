import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import "./App.css";

const VideoCall = () => {
  const [peerId, setPeerId] = useState(null);
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const currentUserVideoRef = useRef(null);
  const [isCallActive, setIsCallActive] = useState(false);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  useEffect(() => {
    // Initialize PeerJS
    peerInstance.current = new Peer();

    // Set up event listeners
    peerInstance.current.on("open", function (id) {
      setPeerId(id);
    });
    peerInstance.current.on("call", (call) => {
      // Answer incoming call
      var getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      getUserMedia({ video: true, audio: true }, function (mediaStream) {
        currentUserVideoRef.current.srcObject = mediaStream;
        console.log("MediaStreamLocal", mediaStream);
        currentUserVideoRef.current.onloadedmetadata = function () {
          currentUserVideoRef.current.play();
        };
        call.answer(mediaStream);
        call.on("stream", function (remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.onloadedmetadata = function () {
            remoteVideoRef.current.play();
            setIsCallActive(true);
          };
          remoteVideoRef.current.muted = true;
        });
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
    var getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    getUserMedia({ video: true, audio: true }, function (mediaStream) {
      currentUserVideoRef.current.srcObject = mediaStream;
      currentUserVideoRef.current.onloadedmetadata = function () {
        currentUserVideoRef.current.play();
      };
      const call = peerInstance.current.call(remotePeerId, mediaStream);
      call.on("stream", function (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.onloadedmetadata = function () {
          remoteVideoRef.current.play();
          setIsCallActive(true);
        };
        currentUserVideoRef.current.muted = true;
      });
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
    currentUserVideoRef.current.muted = false;
    remoteVideoRef.current.muted = false;
  };

  return (
    <div className="App">
      <button onClick={handleBack}>Back</button>
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

export default VideoCall;
