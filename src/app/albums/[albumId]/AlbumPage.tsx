import React, { useState } from "react";
import UploadIcon from "@/assets/icons/Upload.svg";
import filterIcon from "@/assets/icons/filterIcon.svg";
import PendingIcon from "@/assets/icons/Pending.svg";
import TestPicture from "@/assets/images/PolaroidPhotos1.png"; // Replace with actual image URL
import Link from "next/link";
import ImageCard from "@/components/ImageCard";
import CardGallery from "@/components/CardGallery";
import { ImageID } from "@/types/albumTypes";
import Tagging from "@/components/Tagging";

const AlbumPage: React.FC = () => {

    const dates = [
        "Mon, June 17",
        "Tues, June 18",
        "Wed, June 19",
        "Thurs, June 20",
        "Fri, June 21",
    ];

    const allTags = [
        { id: "1", name: "Claire C."},
        { id: "2", name: "Nitin K."},        
        { id: "3", name: "Ben E."},
        { id: "4", name: "Maia J."},
        { id: "5", name: "Harshitha J."},
        { id: "6", name: "Tej S."},
        { id: "7", name: "Advik D."},
        { id: "8", name: "Christine N."},
        { id: "9", name: "Esha V."},
        { id: "10", name: "Gelila K."},
        { id: "11", name: "Joel C."},
        { id: "12", name: "Nishtha D."},
        { id: "13", name: "Rivan P."},
        { id: "14", name: "Riya M."},
        { id: "15", name: "Saharsh M."},
    ]

    const [selectedTags, setSelectedTags] = useState<typeof allTags[0][]>([]);

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
                        <Tagging
                            items={allTags}
                            selectedItems={selectedTags}
                            onSelectionChange={setSelectedTags}
                            getOptionLabel={(tag) => tag.name}
                            getOptionValue={(tag) => tag.id}
                            placeholder="Search Tags..."
                            className="w-64"
                        />
                        <img className="w-[64px] h-[64px] flex-none cursor-pointer" src={filterIcon.src} alt="Filter" />
                        <img className="w-[64px] h-[64px] flex-none cursor-pointer" src={PendingIcon.src} alt="Pending" />
                        <img className="w-[64px] h-[64px] flex-none cursor-pointer" src={UploadIcon.src} alt="Upload" />
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
