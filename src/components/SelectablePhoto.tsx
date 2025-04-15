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
                className={`absolute top-4 right-4 flex gap-2 px-3 py-1 rounded bg-white/80 transition-opacity ${
                    status === "none" ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                }`}
            >
                <button
                    onClick={handleApprove}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        status === "approved" ? "bg-camp-tert-green" : "bg-white"
                    }`}
                >
                    <img src={checkIcon.src} alt="Approve" className="w-3 h-3" />
                </button>
                <button
                    onClick={handleReject}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        status === "rejected" ? "bg-blue-900" : "bg-white"
                    }`}
                >
                    <img src={crossIcon.src} alt="Reject" className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

export default SelectablePhoto;
