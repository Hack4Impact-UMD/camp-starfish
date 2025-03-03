"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import loadingAnimation25 from "@/assets/loading/loadingAnimation25.svg";
import loadingAnimation50 from "@/assets/loading/loadingAnimation50.svg";
import loadingAnimation75 from "@/assets/loading/loadingAnimation75.svg";
import loadingAnimation100 from "@/assets/loading/loadingAnimation100.svg";

/**
 * Loading Animation Component
 * Looping animation using 4 SVG images. Cycles through each image 
 * every 500ms. Uses Framer Motion for smooth transitions.
 */
function LoadingAnimation() {
    // Array of SVG files
    const svgFiles = [
        loadingAnimation25,
        loadingAnimation50,
        loadingAnimation75,
        loadingAnimation100,
    ];
    const [loading, setLoading] = useState(0); // Track current loading animation

    /**
     * Cycle through loading animations every 500ms
     */
    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading((prev) => (prev < svgFiles.length - 1 ? prev + 1 : 0));
        }, 500);
        return () => clearTimeout(timeout);
    }, [loading]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
                {svgFiles.map((file, index) => (
                    <motion.img
                        key={index}
                        src={file.src} // Load current SVG file
                        alt={`Loading animation ${index + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: loading === index ? 1 : 0, scale: 2.75 }} // Show active animation
                        transition={{ duration: 0.5 }} // Smooth fading transition
                        style={{
                            position: "absolute", // Position each SVG on top of each other
                        }}
                    />
                ))}
        </div>
    );
}

export default LoadingAnimation;
