import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import plusIcon from "@/assets/icons/plusIcon.svg";
import filterIcon from "@/assets/icons/filterIcon.svg";
import TestPicture from "@/assets/images/TestPicture.png"; // Replace with actual image URL

const AlbumPage: React.FC = () => {
    const [selectedDates, setSelectedDates] = useState<string[]>([]);

    // Toggle selection
    const handleCheckboxChange = (date: string) => {
        setSelectedDates((prev) =>
            prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
        );
    };

    const dates = [
        "Mon, June 17",
        "Tues, June 18",
        "Wed, June 19",
        "Thurs, June 20",
        "Fri, June 21",
    ];

    const searchParams = useSearchParams();
    const title = searchParams.get("title") || "Unknown Album";
    const session = searchParams.get("session") || "No Session";

    return (
        <div className="w-full min-h-full bg-gray-100">
            <div className="container mx-auto px-4 py-6">
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
                    </div>
                </div>

                <div className="mt-6 space-y-8">
                    {dates.map((date) => (
                        <div key={date}>
                            {/* Checkbox & Date on the Same Line */}
                            <div className="flex items-center gap-8 mb-4">
                                <h2 className="text-xl font-lato text-camp-primary">{date}</h2>
                                <input
                                    type="checkbox"
                                    checked={selectedDates.includes(date)}
                                    onChange={() => handleCheckboxChange(date)}
                                    className="w-5 h-5 text-camp-primary rounded border-gray-300 focus:ring-2 focus:ring-camp-primary"
                                />
                            </div>

                            {/* Photos Grid */}
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                {Array(18)
                                    .fill(null)
                                    .map((_, index) => (
                                        <img
                                            src={TestPicture.src}
                                            alt={`Photo ${index + 1}`}
                                            key={index}
                                            className="w-full h-auto object-cover rounded-lg shadow-md"
                                        />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlbumPage;
