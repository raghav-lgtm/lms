import React from "react";
import ReactPlayer from "react-player";

function VideoPlayer({ videoUrl }) {
  return (
    <div>
      <ReactPlayer
        url={videoUrl} // ✅ THIS is the key
        controls
        width="30%"
        height="50%"
      />
    </div>
  );
}

export default VideoPlayer;
