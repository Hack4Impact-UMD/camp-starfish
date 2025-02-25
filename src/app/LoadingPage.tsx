"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import loadingAnimation25 from "@/assets/loading/loadingAnimation25.svg";
import loadingAnimation50 from "@/assets/loading/loadingAnimation50.svg";
import loadingAnimation75 from "@/assets/loading/loadingAnimation75.svg";
import loadingAnimation100 from "@/assets/loading/loadingAnimation100.svg";
import { text } from "stream/consumers";
import { line } from "framer-motion/client";

/**
 * LoadingPage Component
 * Displays looping animated loading indicator using 4 SVG images. Cycles through each image 
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

    // Style for "LOADING..." heading
    const headingStyle = {
        color: "black",
        fontFamily: "Lato, sans-serif",
        fontSize: "32px",
        fontWeight: 900,
        lineHeight: 'normal',
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <h1 style={headingStyle}>LOADING...</h1>
            <div
                className="relative w-40 h-40 flex justify-center items-center"
                style={{ position: "relative", width: "100px", height: "100px" }}
            >
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
        </div>
    );
}

export default LoadingPage;
