"use client";

import { useEffect, useState } from "react";
import loadingAnimation0 from "@/assets/loading/loadingAnimation0.svg";
import loadingAnimation25 from "@/assets/loading/loadingAnimation25.svg";
import loadingAnimation50 from "@/assets/loading/loadingAnimation50.svg";
import loadingAnimation75 from "@/assets/loading/loadingAnimation75.svg";
import loadingAnimation100 from "@/assets/loading/loadingAnimation100.svg";
import { Image } from "@mantine/core";

const svgFiles = [
  loadingAnimation0,
  loadingAnimation25,
  loadingAnimation50,
  loadingAnimation75,
  loadingAnimation100,
];

function LoadingAnimation() {
  const [animationIdx, setAnimationIdx] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimationIdx((prev) => (prev < svgFiles.length - 1 ? prev + 1 : 0));
    }, 300);
    return () => clearTimeout(timeout);
  }, [animationIdx, svgFiles.length]);

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
