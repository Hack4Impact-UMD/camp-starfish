"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import loadingAnimation25 from "@/assets/loading/loadingAnimation25.svg";
import loadingAnimation50 from "@/assets/loading/loadingAnimation50.svg";
import loadingAnimation75 from "@/assets/loading/loadingAnimation75.svg";
import loadingAnimation100 from "@/assets/loading/loadingAnimation100.svg";

const svgFiles = [
  loadingAnimation25,
  loadingAnimation50,
  loadingAnimation75,
  loadingAnimation100,
];

function LoadingAnimation() {
  const [animationIdx, setAnimationIdx] = useState(0); // Track current loading animation

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimationIdx((prev) => (prev < svgFiles.length - 1 ? prev + 1 : 0));
    }, 400);
    return () => clearTimeout(timeout);
  }, [animationIdx, svgFiles.length]);

  return (
    <div className="flex flex-col items-center justify-center border-4 border-green-5">
      <motion.img
        src={svgFiles[animationIdx]?.src} // Load current SVG file
        alt={`Loading animation ${animationIdx + 1}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }} // Show active animation
        transition={{ duration: 0.5 }} // Smooth fading transition
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
}

export default LoadingAnimation;
