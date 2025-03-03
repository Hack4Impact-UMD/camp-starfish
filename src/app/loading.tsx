"use client";

import LoadingAnimation from "../components/LoadingAnimation";

/**
 * Loading Component
 * Displays looping animated loading indicator using 4 SVG images. Cycles through each image 
 * every 500ms. Uses Framer Motion for smooth transitions.
 */
function loading() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-white">
            <h1 className="font-lato text-black text-[32px] font-extrabold leading-normal transform uppercase">Loading...</h1>
            <div
                className="relative w-24 h-24 flex justify-center items-center"
            >
                <LoadingAnimation />
            </div>
        </div>
    );
}

export default loading;