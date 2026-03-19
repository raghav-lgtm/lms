import { useCallback, useEffect, useRef, useState } from "react";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import {
    Maximize,
    Minimize,
    Pause,
    Play,
    RotateCcw,
    RotateCw,
    Volume2,
    VolumeX,
} from "lucide-react";

function VideoPlayer({
    width = "100%",
    height = "100%",
    url,
    onProgressUpdate,
    progressData,
}) {
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const hasMarkedComplete = useRef(false);

    function handlePlayAndPause() {
        const video = videoRef.current;
        if (!video) return;
        if (playing) {
            video.pause();
        } else {
            video.play();
        }
        setPlaying(!playing);
    }

    function handleRewind() {
        if (videoRef.current) videoRef.current.currentTime -= 5;
    }

    function handleForward() {
        if (videoRef.current) videoRef.current.currentTime += 5;
    }

    function handleToggleMute() {
        if (videoRef.current) videoRef.current.muted = !muted;
        setMuted(!muted);
    }

    function handleSeekChange(newValue) {
        const newTime = (newValue[0] / 100) * duration;
        if (videoRef.current) videoRef.current.currentTime = newTime;
        setPlayed(newValue[0] / 100);
    }

    function handleVolumeChange(newValue) {
        const newVolume = newValue[0] / 100;
        if (videoRef.current) videoRef.current.volume = newVolume;
        setVolume(newVolume);
    }

    function handleTimeUpdate() {
        const video = videoRef.current;
        if (!video) return;
        const progress = video.currentTime / video.duration;
        setPlayed(progress);

        if (progress >= 0.99 && !hasMarkedComplete.current) {
            hasMarkedComplete.current = true;
            onProgressUpdate({
                ...progressData,
                progressValue: progress,
            });
        }
    }

    function handleLoadedMetadata() {
        if (videoRef.current) setDuration(videoRef.current.duration);
    }

    function pad(string) {
        return ("0" + string).slice(-2);
    }

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "0:00";
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = pad(date.getUTCSeconds());
        if (hh) return `${hh}:${pad(mm)}:${ss}`;
        return `${mm}:${ss}`;
    }

    const handleFullScreen = useCallback(() => {
        if (!isFullScreen) {
            if (playerContainerRef?.current?.requestFullscreen) {
                playerContainerRef?.current?.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, [isFullScreen]);

    function handleMouseMove() {
        setShowControls(true);
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }

    useEffect(() => {
        setPlayed(0);
        setDuration(0);
        setPlaying(false);
        hasMarkedComplete.current = false;
    }, [url]);

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };
    }, []);

    return (
        <div
            ref={playerContainerRef}
            className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out ${isFullScreen ? "w-screen h-screen" : ""}`}
            style={{ width, height }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowControls(false)}
        >
            {url ? (
                <video
                    ref={videoRef}
                    src={url}
                    className="absolute top-0 left-0 w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setPlaying(false)}
                    controlsList="nodownload"
                />
            ) : (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white text-sm opacity-60">
                    Loading video...
                </div>
            )}
            {showControls && (
                <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 p-4 transition-opacity duration-300 opacity-100">
                    <Slider
                        value={[played * 100]}
                        max={100}
                        step={0.1}
                        onValueChange={(value) => handleSeekChange(value)}
                        className="w-full mb-4"
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePlayAndPause}
                                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                            >
                                {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                            </Button>
                            <Button
                                onClick={handleRewind}
                                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                                variant="ghost"
                                size="icon"
                            >
                                <RotateCcw className="h-6 w-6" />
                            </Button>
                            <Button
                                onClick={handleForward}
                                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                                variant="ghost"
                                size="icon"
                            >
                                <RotateCw className="h-6 w-6" />
                            </Button>
                            <Button
                                onClick={handleToggleMute}
                                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                                variant="ghost"
                                size="icon"
                            >
                                {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                            </Button>
                            <Slider
                                value={[volume * 100]}
                                max={100}
                                step={1}
                                onValueChange={(value) => handleVolumeChange(value)}
                                className="w-24"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="text-white">
                                {formatTime(played * duration)} / {formatTime(duration)}
                            </div>
                            <Button
                                className="text-white bg-transparent hover:text-white hover:bg-gray-700"
                                variant="ghost"
                                size="icon"
                                onClick={handleFullScreen}
                            >
                                {isFullScreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoPlayer;