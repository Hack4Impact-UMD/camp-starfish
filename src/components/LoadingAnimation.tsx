"use client";

import { useEffect, useState } from "react";
import loadingAnimation0 from "@/assets/loading/loadingAnimation0.svg";
import loadingAnimation1 from "@/assets/loading/loadingAnimation1.svg";
import loadingAnimation2 from "@/assets/loading/loadingAnimation2.svg";
import loadingAnimation3 from "@/assets/loading/loadingAnimation3.svg";
import loadingAnimation4 from "@/assets/loading/loadingAnimation4.svg";
import { Image } from "@mantine/core";

const svgFiles = [
  loadingAnimation0,
  loadingAnimation1,
  loadingAnimation2,
  loadingAnimation3,
  loadingAnimation4,
];

function LoadingAnimation() {
  const [animationIdx, setAnimationIdx] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimationIdx((prev) => (prev + 1) % svgFiles.length);
    }, 300);
    return () => clearTimeout(timeout);
  }, [animationIdx]);

  return (
    <Image
      src={svgFiles[animationIdx].src}
      alt={`Loading animation ${animationIdx + 1}`}
      className="w-full h-full"
      width={200}
      height={200}
    />
  );
}

export default LoadingAnimation;
