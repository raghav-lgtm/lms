import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function MediaProgressbar({ isMediaUploading }) {
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (isMediaUploading) {
      setShowProgress(true);
    } else {
      const timer = setTimeout(() => {
        setShowProgress(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isMediaUploading]);

  if (!showProgress) return null;

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 mt-5 mb-5 overflow-hidden relative">
      <motion.div
        className="bg-blue-600 h-3 absolute rounded-full"
        initial={{ x: "-100%", width: "40%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export default MediaProgressbar;
