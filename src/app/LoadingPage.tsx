"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import animation25 from "@/assets/loading/loadingAnimation25.svg";
import animation50 from "@/assets/loading/loadingAnimation50.svg";
import animation75 from "@/assets/loading/loadingAnimation75.svg";
import animation100 from "@/assets/loading/loadingAnimation100.svg";

function LoadingPage() {
    const [loading, setLoading] = useState(0);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (loading < 4) {
            const timeout = setTimeout(() => {
                setLoading((prev) => prev + 1);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [loading]);

    const svgFiles = [animation25, animation50, animation75, animation100];
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            {/* Navbar Space */}

            {/* Loading Text */}
            <h1>LOADING...</h1>

            {/* Loading Animation */}
            <div className="flex space-x-4 mt-4">
                {svgFiles.map((file, index) => (
                <motion.img
                    key={index}
                    src={file}
                    alt={`Loading animation ${index + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loading > index ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    width={50}
                    height={50}
                />
                ))}
            </div>
        </div >
    );
}

export default LoadingPage;