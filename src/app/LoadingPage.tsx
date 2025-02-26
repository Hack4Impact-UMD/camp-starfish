"use client";

import { useEffect, useState } from "react";
import Animation from "./Animation";

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
                <Animation />
            </div>
        </div>
    );
}

export default LoadingPage;
