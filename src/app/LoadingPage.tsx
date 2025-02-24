"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import loadingAnimation25 from "@/assets/loading/loadingAnimation25.svg";
import loadingAnimation50 from "@/assets/loading/loadingAnimation50.svg";
import loadingAnimation75 from "@/assets/loading/loadingAnimation75.svg";
import loadingAnimation100 from "@/assets/loading/loadingAnimation100.svg";

function LoadingPage() {
    const [loading, setLoading] = useState(0);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && loading < 4) {
            const timeout = setTimeout(() => {
                setLoading((prev) => (prev < 3 ? prev + 1 : 0));
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [loading, isClient]);

    if (!isClient) return null;

    const svgFiles = [
        loadingAnimation25,
        loadingAnimation50,
        loadingAnimation75,
        loadingAnimation100,
    ];

    const headingStyle = {
        color: "black",
        fontFamily: "Lato, sans-serif",
        fontWeight: 900,
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <h1 style={headingStyle}>LOADING...</h1>
            <div
                className="relative w-60 h-20 flex justify-center items-center"
                style={{ position: "relative", width: "100px", height: "100px" }}
            >
                {svgFiles.map((file, index) => (
                    <motion.img
                        key={index}
                        src={file.src}
                        alt={`Loading animation ${index + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: loading === index ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                        width={100}
                        height={100}
                        style={{
                            position: "absolute",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export default LoadingPage;
