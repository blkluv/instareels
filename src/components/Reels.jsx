import React, { useRef, useState, useEffect, useCallback } from "react";
import throttle from "lodash/throttle";
import videolinks from "./videolinks";
import {
  FaShareAlt,
  FaThumbsUp,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import { motion } from "framer-motion";

const Reel = ({
  src,
  isPlaying,
  isMuted,
  toggleMute,
  onLike,
  onShare,
  isLiked,
  id,
  tags,
}) => {
  const videoRef = useRef(null);
  const [animateThumb, setAnimateThumb] = useState(false);
  const [animateSpeaker, setAnimateSpeaker] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    const playVideo = () => {
      if (isPlaying) {
        video
          .play()
          .catch((err) => console.error("Playback error:", err.message || err));
      } else {
        video.pause();
      }
    };

    const handleScroll = () => {
      if (video && isPlaying) {
        video.play().catch((err) => {
          console.error("Playback error:", err.message || err);
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    playVideo();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isPlaying]);

  const handleLikeClick = () => {
    onLike();
    setAnimateThumb(true);
    setTimeout(() => setAnimateThumb(false), 1000);
  };

  const handleMuteClick = () => {
    toggleMute();
    setAnimateSpeaker(true);
    setTimeout(() => setAnimateSpeaker(false), 1000);
  };

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

      {animateThumb && (
        <motion.div
          className="absolute z-20"
          animate={{ scale: 2, opacity: 1 }}
          initial={{ scale: 1, opacity: 0 }}
          transition={{ duration: 2 }}
        >
          <FaThumbsUp className="text-6xl text-sky-500" />
        </motion.div>
      )}

      {animateSpeaker && (
        <motion.div
          className="absolute z-20"
          animate={{ scale: 2, opacity: 1 }}
          initial={{ scale: 1, opacity: 0 }}
          transition={{ duration: 2 }}
        >
          {isMuted ? (
            <FaVolumeMute className="text-6xl text-sky-500" />
          ) : (
            <FaVolumeUp className="text-6xl text-sky-500" />
          )}
        </motion.div>
      )}

      <div className="absolute z-10 flex items-center justify-center gap-2 bottom-5 left-5">
        <motion.button
          onClick={handleMuteClick}
          className="px-4 py-2 text-base text-white transition-colors duration-300 rounded-md bg-black/50 hover:bg-black/70"
        >
          {isMuted ? "Unmute" : "Mute"}
        </motion.button>

        <motion.button
          onClick={handleLikeClick}
          className={`text-base px-4 py-2 rounded-md transition-colors duration-300 ${
            isLiked
              ? "bg-blue-500 text-white"
              : "bg-black/50 text-white hover:bg-black/70"
          }`}
        >
          <FaThumbsUp />
        </motion.button>

        <motion.button
          onClick={onShare}
          className="px-4 py-2 text-base text-white transition-colors duration-300 rounded-md bg-black/50 hover:bg-black/70"
        >
          <FaShareAlt />
        </motion.button>
      </div>

      <motion.div
        className="absolute px-4 py-2 text-base text-white rounded-md top-10 left-5 bg-black/70"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        #CASINOW3W id: {id}
      </motion.div>
      <div className="absolute left-0 flex flex-wrap justify-center w-full gap-2 px-4 py-2 text-sm text-white rounded-md bottom-20 bg-black/70">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="text-blue-400 transition duration-200 cursor-pointer hover:text-blue-500 hover:underline"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const Reels = () => {
  const [reelsData, setReelsData] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [loadedVideos, setLoadedVideos] = useState(3);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [likedVideos, setLikedVideos] = useState({});

  useEffect(() => {
    setReelsData(videolinks);
  }, []);

  const loadMoreVideos = useCallback(() => {
    if (loading || loadedVideos >= reelsData.length) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoadedVideos((prev) => Math.min(prev + 3, reelsData.length));
      setLoading(false);
    }, 1000);
  }, [loading, loadedVideos, reelsData.length]);

  const handleScroll = throttle(() => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const { innerHeight } = window;

    const nextReelIndex = Math.floor(
      (scrollTop + innerHeight / 2) / innerHeight
    );

    if (nextReelIndex !== currentReelIndex) {
      setCurrentReelIndex(nextReelIndex);
    }

    if (scrollTop + innerHeight >= scrollHeight - 10) {
      loadMoreVideos();
    }
  }, 200);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  const handleLike = (id) => {
    setLikedVideos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleShare = (id) => {
    const shareUrl = `https://tv.casinow3w.com/video/`;
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this Casino reel!",
          text: "Check out this Casino video reel on CASINOW3W!",
          url: shareUrl,
        })
        .catch((err) => console.error("Share failed", err));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Link copied to clipboard!");
      });
    }
  };

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
            isLiked={likedVideos[reel.id]}
            id={reel.id}
            tags={reel.tags}
          />
        </div>
      ))}

      {loading && (
        <div className="fixed z-50 flex items-center justify-center font-bold text-center text-white transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <div className="text-white spinner-border animate-spin" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          Loading more reels...
        </div>
      )}
    </div>
  );
};

export default Reels;
