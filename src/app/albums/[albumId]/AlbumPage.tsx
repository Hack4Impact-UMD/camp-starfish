import React, { useState } from "react";
import plusIcon from "@/assets/icons/plusIcon.svg";
import filterIcon from "@/assets/icons/filterIcon.svg";
import TestPicture from "@/assets/images/PolaroidPhotos1.png"; // Replace with actual image URL
import Link from "next/link";
import ImageCard from "@/components/ImageCard";
import CardGallery from "@/components/CardGallery";
import { ImageID } from "@/types/albumTypes";

const AlbumPage: React.FC = () => {

    const dates = [
        "Mon, June 17",
        "Tues, June 18",
        "Wed, June 19",
        "Thurs, June 20",
        "Fri, June 21",
    ];

    const images: ImageID[] = []
    for (let i = 0; i < 10; i++) {
        images.push({
            src: TestPicture.src,
            name: "Image " + i,
            tags: 'ALL',                              
            dateTaken: dates[i % 5],
            inReview: false,
            id: i.toString(),
            albumId: "iug"
        })
    }

    const albumId = "album-1";


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
                    </div>
                </div>

                {/* Content */}
                <CardGallery<ImageID> items={images}
                                      renderItem={(image: ImageID, isSelected: boolean) => <ImageCard image={image} isSelected={isSelected} />}
                                      groups={{
                                        groupLabels: dates,
                                        defaultGroupLabel: "Date Unknown",
                                        groupFunc: (image: ImageID) => image.dateTaken
                                      }} />
                
            </div>
        </div>
    );
};

export default AlbumPage;
