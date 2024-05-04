import React from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import VideoCall from "./VideoCall";
import ChatApp from "./Chat";
// import Audio from "./Audio";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/video-call" element={<VideoCall />} />
          <Route path="/chat" element={<ChatApp />} />
          {/* <Route path="/audio-call" element={<Audio />} /> */}
        </Routes>
        <Buttons />
      </div>
    </Router>
  );
};

const Buttons = () => {
  const location = useLocation();

  return (
    location.pathname !== "/video-call" && location.pathname !== "/chat" && location.pathname !== "/audio-call" && (
      <div className="buttons">
        <Link to="/video-call">
          <button>Video Call</button>
        </Link>
        <Link to="/chat">
          <button>Chat</button>
        </Link>
        {/* <Link to="/audio-call">
          <button>Audio Call</button>
        </Link> */}
      </div>
    )
  );
};

export default App;
