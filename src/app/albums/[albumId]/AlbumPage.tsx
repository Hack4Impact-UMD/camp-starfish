import React, { useState, useEffect } from "react";
import UploadIcon from "@/assets/icons/Upload.svg";
import filterIcon from "@/assets/icons/filterIcon.svg";
import PendingIcon from "@/assets/icons/Pending.svg";
import DownloadIcon from "@/assets/icons/Download.svg";
import TestPicture from "@/assets/images/PolaroidPhotos1.png"; // Replace with actual image URL
import Link from "next/link";
import ImageCard from "@/components/ImageCard";
import CardGallery from "@/components/CardGallery";
import { ImageID } from "@/types/albumTypes";
import Tagging from "@/components/Tagging";
import FileUploadModal from "@/components/FileUploadModal";
import JSZip from "jszip";

const AlbumPage: React.FC = () => {

    const dateObjects = [
        new Date(2023, 5, 17), // June 17
        new Date(2023, 5, 18), // June 18
        new Date(2023, 5, 19), // June 19
        new Date(2023, 5, 20), // June 20
        new Date(2023, 5, 21), // June 21
    ]

    const dates = [
        "Mon, June 17",
        "Tues, June 18",
        "Wed, June 19",
        "Thurs, June 20",
        "Fri, June 21",
    ];

    const allTags = [
        { id: "1", name: "Claire C." },
        { id: "2", name: "Nitin K." },
        { id: "3", name: "Ben E." },
        { id: "4", name: "Maia J." },
        { id: "5", name: "Harshitha J." },
        { id: "6", name: "Tej S." },
        { id: "7", name: "Advik D." },
        { id: "8", name: "Christine N." },
        { id: "9", name: "Esha V." },
        { id: "10", name: "Gelila K." },
        { id: "11", name: "Joel C." },
        { id: "12", name: "Nishtha D." },
        { id: "13", name: "Rivan P." },
        { id: "14", name: "Riya M." },
        { id: "15", name: "Saharsh M." },
    ]

    const [selectedTags, setSelectedTags] = useState<typeof allTags[0][]>([]);
    const [sortOrder, setSortOrder] = useState<"oldest-newest" | "newest-oldest">("oldest-newest");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [filteredImages, setFilteredImages] = useState<ImageID[]>([]);

    // Initial images (for testing purposes, replace with actual data)
    const initialImages: ImageID[] = [];
    for (let i = 0; i < 10; i++) {
        const dateIndex = i % 5;
        initialImages.push({
            src: TestPicture.src,
            name: "Image " + i,
            tags: [],
            dateTaken: dates[i % 5],
            dateObject: dateObjects[dateIndex],
            inReview: false,
            id: i.toString(),
            albumId: "iug"
        });
    }

    // Manual tags (randomized, for testing purposes)
    initialImages[0].tags = ['1', '2'];
    initialImages[1].tags = ['3', '4'];
    initialImages[2].tags = ['5', '6', '7'];
    initialImages[3].tags = ['1', '8'];
    initialImages[4].tags = ['9', '10', '11'];
    initialImages[5].tags = ['12', '13'];
    initialImages[6].tags = ['14', '15'];
    initialImages[7].tags = ['1', '2', '3'];
    initialImages[8].tags = ['4', '5', '6'];
    initialImages[9].tags = ['7', '8', '9'];

    const [images] = useState<ImageID[]>(initialImages);

    // Update filtered images whenever selected tags or images change
    useEffect(() => {
        if (selectedTags.length > 0) {
            const filtered = images.filter(image => {
                return selectedTags.some(tag => image.tags.includes(tag.id));
            });
            setFilteredImages(filtered);
        } else {
            setFilteredImages(images);
        }
    }, [selectedTags, images]);

    // Sort images based on selected sort order
    const sortedImages = [...filteredImages].sort((a, b) => {
        if (sortOrder === "oldest-newest") {
            return a.dateObject.getTime() - b.dateObject.getTime();
        } else {
            return b.dateObject.getTime() - a.dateObject.getTime();
        }
    });

    // Get unique dates from filtered images for grouping
    const filteredDates = [...new Set(filteredImages.map(image => image.dateTaken))];
    const sortedDates = [...filteredDates].sort((a, b) => {
        const dateA = dateObjects[dates.indexOf(a)];
        const dateB = dateObjects[dates.indexOf(b)];
        if (sortOrder === "oldest-newest") {
            return dateA.getTime() - dateB.getTime();
        } else {
            return dateB.getTime() - dateA.getTime();
        }
    });

    // Download images as zip file
    const handleDownloadAll = async () => {
        try {
            // Ensure it's downloading images in filtered list (only selected tags)
            if (filteredImages.length === 0) {
                alert("No images to download");
                return;
            }

            // Create zip file containing all images
            const zip = new JSZip();
            const imgFolder = zip.folder("album_images");

            // Add each image to zip file
            await Promise.all(filteredImages.map(async (image, index) => {
                const response = await fetch(image.src);
                const blob = await response.blob();
                imgFolder?.file(`image_${index + 1}.jpg`, blob);
            }));

            // Generate zip file
            const content = await zip.generateAsync({ type: "blob" });

            // Create download link
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title}_images.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading images:", error);
        }
    };

    const albumId = "album-1";
    const title = "Unknown Album";
    const session = "No Session";

    return (
        <div className="w-full min-h-full bg-gray-100">
            <div className="container mx-auto px-4 py-6 w-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-lato font-bold text-camp-primary">
                        ALBUMS {">>"} {title} {">>"} {session}
                    </h1>
                    <div className="flex items-center gap-4 shrink-0">
                        {/* Tagging */}
                        <Tagging
                            items={allTags}
                            selectedItems={selectedTags}
                            onSelectionChange={setSelectedTags}
                            getOptionLabel={(tag) => tag.name}
                            getOptionValue={(tag) => tag.id}
                            placeholder="Search Tags..."
                            className="w-64 cursor-pointer"

                        />

                        {/* Filter Dropdown */}
                        <div className="relative">
                            <img
                                className="w-[80px] h-[48px] flex-none cursor-pointer"
                                src={filterIcon.src}
                                alt="Filter"
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                            />
                            {showSortDropdown && (
                                <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                    <div
                                        className={`px-4 py-2 hover:bg-gray-300 text-black cursor-pointer ${sortOrder === "oldest-newest" ? "bg-gray-300 font-medium" : ""}`}
                                        onClick={() => {
                                            setSortOrder("oldest-newest");
                                            setShowSortDropdown(false);
                                        }}
                                    >
                                        Oldest → Newest
                                        {sortOrder === "oldest-newest" && <span className="ml-2 text-camp-primary">✓</span>}
                                    </div>
                                    <div
                                        className={`px-4 py-2 hover:bg-gray-300 text-black cursor-pointer ${sortOrder === "newest-oldest" ? "bg-gray-300 font-medium" : ""}`}
                                        onClick={() => {
                                            setSortOrder("newest-oldest");
                                            setShowSortDropdown(false);
                                        }}
                                    >
                                        Newest → Oldest
                                        {sortOrder === "newest-oldest" && <span className="ml-2 text-camp-primary">✓</span>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pending */}
                        <Link href="/albums/pending">
                            <img
                                className="w-[90px] h-[48px] flex-none cursor-pointer"
                                src={PendingIcon.src}
                                alt="Pending"
                            />
                        </Link>

                        {/* Upload */}
                        <img className="w-[48px] h-[48px] flex-none cursor-pointer" src={UploadIcon.src} alt="Upload" />
                        {/* <FileUploadModal
                            onUpload={(files) => {
                                console.log("Uploaded files:", files);
                            }}
                            acceptedFileExtensions={['.jpg', '.jpeg', '.png', '.gif']}
                            maxFileSize={10}
                        >
                            <img
                                className="w-[56px] h-[56px] flex-none cursor-pointer"
                                src={UploadIcon.src}
                                alt="Upload"
                            />
                        </FileUploadModal> */}

                        {/* Download */}
                        <img className="w-[48px] h-[48px] flex-none cursor-pointer" src={DownloadIcon.src} alt="Download" onClick={handleDownloadAll} />
                    </div>
                </div>

                {/* Content */}
                <CardGallery<ImageID>
                    items={sortedImages}
                    renderItem={(image: ImageID, isSelected: boolean) => <ImageCard image={image} isSelected={isSelected} />}
                    groups={{
                        groupLabels: sortedDates,
                        defaultGroupLabel: "Date Unknown",
                        groupFunc: (image: ImageID) => image.dateTaken
                    }} />
            </div>
        </div>
    );
};

export default AlbumPage;
