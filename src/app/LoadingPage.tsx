"use client";

import Animation from "./Animation";

/**
 * LoadingPage Component
 * Displays looping animated loading indicator using 4 SVG images. Cycles through each image 
 * every 500ms. Uses Framer Motion for smooth transitions.
 */
function LoadingPage() {
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
