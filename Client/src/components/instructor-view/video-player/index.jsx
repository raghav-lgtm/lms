import React from "react";
import ReactPlayer from "react-player";

function VideoPlayer({ videoUrl, width = "100%", height = "100%" }) {
  const normalizedUrl = React.useMemo(() => {
    if (!videoUrl) return videoUrl;

    // For older saved Cloudinary URLs (or non-mp4 formats), force mp4 delivery.
    // Example: .../video/upload/v123/abc.mov -> .../video/upload/f_mp4/v123/abc.mov
    if (
      typeof videoUrl === "string" &&
      videoUrl.includes("res.cloudinary.com") &&
      videoUrl.includes("/video/upload/") &&
      !videoUrl.includes("/video/upload/f_mp4/")
    ) {
      return videoUrl.replace("/video/upload/", "/video/upload/f_mp4/");
    }

    return videoUrl;
  }, [videoUrl]);

  const isDirectMp4 =
    typeof normalizedUrl === "string" &&
    (normalizedUrl.toLowerCase().includes(".mp4") ||
      normalizedUrl.toLowerCase().includes("format=mp4"));

  return (
    <div
      className="w-full h-full"
      style={{
        width,
        height,
      }}
    >
      {isDirectMp4 ? (
        <video
          src={normalizedUrl}
          controls
          preload="metadata"
          playsInline
          className="h-full w-full"
          style={{ width: "100%", height: "100%" }}
          crossOrigin="anonymous"
          onError={(e) => {
            // Native video gives better signal than react-player for mp4 delivery issues.
            // eslint-disable-next-line no-console
            console.error("Video element error:", e?.currentTarget?.error);
          }}
        />
      ) : (
        <ReactPlayer
          url={normalizedUrl}
          controls
          width="100%"
          height="100%"
          onError={(e) => {
            // eslint-disable-next-line no-console
            console.error("ReactPlayer error:", e);
          }}
          config={{
            file: {
              attributes: {
                crossOrigin: "anonymous",
                playsInline: true,
                preload: "metadata",
              },
            },
          }}
        />
      )}
    </div>
  );
}

export default VideoPlayer;
