import React, { useState } from "react";
import plusIcon from "@/assets/icons/plusIcon.svg";
import filterIcon from "@/assets/icons/filterIcon.svg";
import TestPicture from "@/assets/images/TestPicture.png"; // Replace with actual image URL
import Link from "next/link";

const AlbumPage: React.FC = () => {
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

    const handleCheckboxChange = (date: string) => {
        setSelectedDates((prev) =>
            prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
        );
    };

    const togglePhotoSelection = (photoId: string) => {
        setSelectedPhotos((prev) =>
            prev.includes(photoId)
                ? prev.filter((id) => id !== photoId)
                : [...prev, photoId]
        );
    };

    const albumId = "album-1";
    const dates = [
        "Mon, June 17",
        "Tues, June 18",
        "Wed, June 19",
        "Thurs, June 20",
        "Fri, June 21",
    ];

    const title = "Unknown Album";
    const session = "No Session";

    return (
        <div className="w-full min-h-full bg-gray-100">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-lato font-bold text-camp-primary">
                        ALBUMS {">>"} {title} {">>"} {session}
                    </h1>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search Tags..."
                            className="px-10 py-2 text-sm border text-black border-gray-500 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-camp-primary"
                        />
                        <img className="w-[72px] h-[72px] flex-none cursor-pointer" src={filterIcon.src} alt="Filter" />
                        <img className="w-[72px] h-[72px] flex-none cursor-pointer" src={plusIcon.src} alt="Plus" />
                        <Link href={`/albums/${albumId}/pending`}>
                            <button className="px-4 py-2 text-sm font-semibold text-white bg-camp-primary rounded-full shadow-md hover:bg-camp-primary-dark focus:outline-none focus:ring-2 focus:ring-camp-primary">
                                Pending
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-6 space-y-8">
                    {dates.map((date, dateIndex) => (
                        <div key={date}>
                            {/* Date + Checkbox */}
                            <div className="flex items-center gap-8 mb-4">
                                <h2 className="text-xl font-lato text-camp-primary">{date}</h2>
                                <input
                                    type="checkbox"
                                    checked={selectedDates.includes(date)}
                                    onChange={() => handleCheckboxChange(date)}
                                    className="w-5 h-5 text-camp-primary rounded border-gray-300 focus:ring-2 focus:ring-camp-primary"
                                />
                            </div>

                            {/* Photo Grid */}
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                {Array(18).fill(null).map((_, photoIndex) => {
                                    const photoId = `date-${dateIndex}-photo-${photoIndex}`;
                                    const isSelected = selectedPhotos.includes(photoId);

                                    return (
                                        <div
                                            key={photoId}
                                            className={`relative group w-full h-auto rounded-lg overflow-hidden shadow-md border-4 transition duration-300 cursor-pointer ${
                                                isSelected ? "border-blue-500" : "border-transparent"
                                            }`}
                                            onClick={() => togglePhotoSelection(photoId)}
                                        >
                                            <img
                                                src={TestPicture.src}
                                                alt={`Photo ${photoIndex + 1}`}
                                                className="w-full h-auto object-cover"
                                            />

                                            <div
                                                className={`absolute top-2 left-2 w-8 h-8 rounded-md bg-white bg-opacity-80 flex items-center justify-center transition-opacity duration-200 ${
                                                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                }`}
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${
                                                        isSelected ? "bg-blue-500 border-blue-500" : "border-gray-400"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <svg
                                                            className="w-4 h-4 text-white"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlbumPage;
