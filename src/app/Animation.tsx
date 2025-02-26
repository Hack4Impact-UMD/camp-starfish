"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import loadingAnimation25 from "@/assets/loading/loadingAnimation25.svg";
import loadingAnimation50 from "@/assets/loading/loadingAnimation50.svg";
import loadingAnimation75 from "@/assets/loading/loadingAnimation75.svg";
import loadingAnimation100 from "@/assets/loading/loadingAnimation100.svg";

/**
 * Animation Component
 * Looping animation using 4 SVG images. Cycles through each image 
 * every 500ms. Uses Framer Motion for smooth transitions.
 */
function LoadingPage() {
    const [loading, setLoading] = useState(0); // Track current loading animation
    const [isClient, setIsClient] = useState(false); // Track if component is mounted

    /**
     * Set isClient to true when component is mounted
     */
    useEffect(() => {
        setIsClient(true);
    }, []);

    /**
     * Cycle through loading animations every 500ms
     */
    useEffect(() => {
        if (isClient && loading < 4) {
            const timeout = setTimeout(() => {
                setLoading((prev) => (prev < 3 ? prev + 1 : 0));
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [loading, isClient]);

    // Return null if not running on client
    if (!isClient) return null;

    // Array of SVG files
    const svgFiles = [
        loadingAnimation25,
        loadingAnimation50,
        loadingAnimation75,
        loadingAnimation100,
    ];

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
                {svgFiles.map((file, index) => (
                    <motion.img
                        key={index}
                        src={file.src} // Load current SVG file
                        alt={`Loading animation ${index + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: loading === index ? 1 : 0 }} // Show active animation
                        transition={{ duration: 0.5 }} // Smooth fading transition
                        width={100}
                        height={100}
                        style={{
                            position: "absolute", // Position each SVG on top of each other
                        }}
                    />
                ))}
        </div>
    );
}

export default LoadingPage;
