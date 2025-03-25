import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import throttle from "lodash/throttle";
import videolinks from "./videolinks";
import { FaShareAlt, FaThumbsUp, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { motion } from "framer-motion";

// Memoized Reel component to prevent unnecessary re-renders
const Reel = React.memo(({
  src,
  isPlaying,
  isMuted,
  toggleMute,
  onLike,
  onShare,
  isLiked,
  id,
  tags
}) => {
  const videoRef = useRef(null);
  const [animateThumb, setAnimateThumb] = useState(false);
  const [animateSpeaker, setAnimateSpeaker] = useState(false);

  // Video playback control
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        isPlaying ? await video.play() : video.pause();
      } catch (err) {
        console.error("Playback error:", err);
      }
    };

    playVideo();
  }, [isPlaying]);

  // Animation handlers
  const triggerAnimation = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 1000);
  };

  const handleLikeClick = () => {
    onLike();
    triggerAnimation(setAnimateThumb);
  };

  const handleMuteClick = () => {
    toggleMute();
    triggerAnimation(setAnimateSpeaker);
  };

  // Memoized buttons to prevent unnecessary re-renders
  const ControlButtons = useMemo(() => (
    <div className="absolute z-10 flex items-center justify-center gap-2 bottom-5 left-5">
      <motion.button
        onClick={handleMuteClick}
        className="px-4 py-2 text-base text-white transition-colors duration-300 rounded-md bg-black/50 hover:bg-black/70"
        whileTap={{ scale: 0.95 }}
      >
        {isMuted ? "Unmute" : "Mute"}
      </motion.button>

      <motion.button
        onClick={handleLikeClick}
        className={`text-base px-4 py-2 rounded-md transition-colors duration-300 ${
          isLiked ? "bg-blue-500 text-white" : "bg-black/50 text-white hover:bg-black/70"
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <FaThumbsUp />
      </motion.button>

      <motion.button
        onClick={onShare}
        className="px-4 py-2 text-base text-white transition-colors duration-300 rounded-md bg-black/50 hover:bg-black/70"
        whileTap={{ scale: 0.95 }}
      >
        <FaShareAlt />
      </motion.button>
    </div>
  ), [isMuted, isLiked]);

  return (
    <div className="box-border relative flex items-center justify-center w-full h-screen p-4 bg-black border-4 border-white shadow-lg">
      <video
        ref={videoRef}
        src={src}
        className="object-contain w-full h-full transition-opacity duration-300 ease-in-out rounded-lg cursor-pointer"
        loop
        muted={isMuted}
        playsInline
        onClick={handleMuteClick}
      />

      {/* Animation overlays */}
      {animateThumb && (
        <motion.div
          className="absolute z-20"
          animate={{ scale: [1, 1.5, 2], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5 }}
        >
          <FaThumbsUp className="text-6xl text-sky-500" />
        </motion.div>
      )}

      {animateSpeaker && (
        <motion.div
          className="absolute z-20"
          animate={{ scale: [1, 1.5, 2], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5 }}
        >
          {isMuted ? (
            <FaVolumeMute className="text-6xl text-sky-500" />
          ) : (
            <FaVolumeUp className="text-6xl text-sky-500" />
          )}
        </motion.div>
      )}

      {ControlButtons}

      {/* Video info */}
      <motion.div
        className="absolute px-4 py-2 text-base text-white rounded-md top-10 left-5 bg-black/70"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        🤳 ZATV id: {id}
      </motion.div>

      {/* Tags */}
      <div className="absolute left-0 flex flex-wrap justify-center w-full gap-2 px-4 py-2 text-sm text-white rounded-md bottom-20 bg-black/70">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="text-blue-400 transition duration-200 cursor-pointer hover:text-blue-500 hover:underline"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
});

const Reels = () => {
  const [reelsData, setReelsData] = useState(videolinks);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [loadedVideos, setLoadedVideos] = useState(3);
  const [isMuted, setIsMuted] = useState(true);
  const [likedVideos, setLikedVideos] = useState({});
  const loadingRef = useRef(false);

  // Throttled scroll handler
  const handleScroll = useMemo(() => throttle(() => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const { innerHeight } = window;

    const nextReelIndex = Math.floor((scrollTop + innerHeight / 2) / innerHeight);
    if (nextReelIndex !== currentReelIndex) {
      setCurrentReelIndex(nextReelIndex);
    }

    if (scrollTop + innerHeight >= scrollHeight - 100 && !loadingRef.current) {
      loadingRef.current = true;
      setLoadedVideos(prev => Math.min(prev + 3, reelsData.length));
      setTimeout(() => loadingRef.current = false, 1000);
    }
  }, 200), [currentReelIndex, reelsData.length]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);

  const handleLike = useCallback((id) => {
    setLikedVideos(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleShare = useCallback((id) => {
    const shareUrl = `https://zatv.weedw3w.com/video/${id}`;
    if (navigator.share) {
      navigator.share({
        title: "Check out this WEEDW3W reel!",
        text: "WEEDW3W is the 3-word weed maps customers can re-sell.",
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert("Link copied to clipboard!"))
        .catch(console.error);
    }
  }, []);

  return (
    <div className="relative w-full min-h-screen p-0 m-0 overflow-y-auto">
      {reelsData.slice(0, loadedVideos).map((reel, index) => (
        <div key={reel.id} className="relative">
          <Reel
            src={reel.src}
            isPlaying={currentReelIndex === index}
            isMuted={isMuted}
            toggleMute={toggleMute}
            onLike={() => handleLike(reel.id)}
            onShare={() => handleShare(reel.id)}
            isLiked={!!likedVideos[reel.id]}
            id={reel.id}
            tags={reel.tags}
          />
        </div>
      ))}

      {loadingRef.current && (
        <div className="fixed z-50 flex items-center justify-center gap-2 font-bold text-center text-white transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading more reels...
        </div>
      )}
    </div>
  );
};

export default Reels;
