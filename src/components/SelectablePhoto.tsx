import React, { useState } from "react";
import checkIcon from "@/assets/icons/checkIcon.svg";
import crossIcon from "@/assets/icons/crossIcon.svg";

type PhotoStatus = "approved" | "rejected" | "none";

interface Props {
    src: string;
    alt?: string;
}

const SelectablePhoto: React.FC<Props> = ({ src, alt = "Pending Photo" }) => {
    const [status, setStatus] = useState<PhotoStatus>("none");

    const handleApprove = () => {
        setStatus((prev) => (prev === "approved" ? "none" : "approved"));
    };

    const handleReject = () => {
        setStatus((prev) => (prev === "rejected" ? "none" : "rejected"));
    };

    return (
        <div className="relative group w-full rounded overflow-hidden shadow-md">
            <img
                src={src}
                alt={alt}
                className="w-full h-auto object-cover"
            />

            <div
                className={`absolute top-4 right-4 flex gap-4 px-6 py-4 rounded-xl bg-white bg-opacity-80 transition-opacity duration-300 ${
                    status === "none" ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                }`}
            >
                <button
                    onClick={handleApprove}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        status === "approved" ? "bg-green-600" : "bg-white"
                    }`}
                >
                    <img src={checkIcon.src} alt="Approve" className="w-6 h-6" />
                </button>
                <button
                    onClick={handleReject}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        status === "rejected" ? "bg-blue-900" : "bg-white"
                    }`}
                >
                    <img src={crossIcon.src} alt="Reject" className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default SelectablePhoto;
