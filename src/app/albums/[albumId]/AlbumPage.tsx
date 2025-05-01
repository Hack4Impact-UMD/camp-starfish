import React, { useEffect, useState } from "react";
import plusIcon from "@/assets/icons/plusIcon.svg";
import UploadIcon from "@/assets/icons/Upload.svg";
import filterIcon from "@/assets/icons/filterIcon.svg";
import PendingIcon from "@/assets/icons/Pending.svg";
import DownloadIcon from "@/assets/icons/Download.svg";
import TestPicture from "@/assets/images/PolaroidPhotos1.png"; // Replace with actual image URL
import Link from "next/link";
import ImageCard from "@/components/ImageCard";
import CardGallery from "@/components/CardGallery";
import { AlbumID, ImageID, Tag } from "@/types/albumTypes";
import FileUploadModal from "@/components/FileUploadModal";
import { getFileURL, uploadFiles } from "@/data/storage/fileOperations";
import { v4 as uuidv4 } from "uuid";
import { getAlbumById } from "@/data/firestore/albums";
import { getMetadata, listAll, ref } from "firebase/storage";
import { storage } from "@/config/firebase";
import LoadingPage from "@/app/loading";
import Tagging from "@/components/Tagging";
import JSZip from "jszip";
import SortDropdown from "@/components/SortDropdown";

interface AlbumPageProps {
  albumId: string;
}

export default function AlbumPage(props: AlbumPageProps) {
  const { albumId } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [album, setAlbum] = useState<AlbumID>();
  const [images, setImages] = useState<ImageID[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const displayImages = images.filter((image) => {
    return (
      image.tags === "ALL" ||
      image.tags.approved.some((tag) => selectedTags.includes(tag))
    );
  });

  useEffect(() => {
    async function fetchAlbum() {
      const album = await getAlbumById(albumId);
      setAlbum(album);
      console.log('album set')
    }

    async function fetchImages() {
      const storageAlbum = ref(storage, `/albums/${albumId}`);
      const allImages = (await listAll(storageAlbum)).items.filter(
        (item) => item.name !== "thumbnail.png"
      );

      const [imageURLs, metadatas] = await Promise.all([
        Promise.all(allImages.map((item) => getFileURL(item.fullPath))),
        Promise.all(allImages.map((item) => getMetadata(item))),
      ]);

      const imageMetadatas = metadatas.map((metadata, i) => {
        return {
          ...metadata.customMetadata,
          id: allImages[i].name,
          albumId: albumId,
          src: imageURLs[i],
        };
      });
      setImages(imageMetadatas as ImageID[]);
      console.log('images set')
    }

    Promise.all([fetchAlbum(), fetchImages()]).then(() => setIsLoading(false));
  }, []);

  async function uploadImages(images: File[]) {
    let paths = images.map((img: File) => `albums/${albumId}/${uuidv4()}`);
    await uploadFiles(images, paths);
  }

  const allTags: Tag[] = [
    {
      campminderId: 1,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 2,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 3,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 4,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 5,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 6,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 7,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 8,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 9,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 10,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 11,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 12,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 13,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 14,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
    {
      campminderId: 15,
      name: { firstName: "", lastName: "" },
      photoPermissions: "INTERNAL",
    },
  ];

  // Download images as zip file
  const handleDownloadAll = async () => {
    try {
      // Ensure it's downloading images in filtered list (only selected tags)
      if (displayImages.length === 0) {
        alert("No images to download");
        return;
      }

      // Create zip file containing all images
      const zip = new JSZip();
      const imgFolder = zip.folder("album_images");

      // Add each image to zip file
      await Promise.all(
        displayImages.map(async (image, index) => {
          const response = await fetch(image.src);
          const blob = await response.blob();
          imgFolder?.file(`image_${index + 1}.jpg`, blob);
        })
      );

      // Generate zip file
      const content = await zip.generateAsync({ type: "blob" });

      // Create download link
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${album!.name}_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading images:", error);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="w-full min-h-full bg-gray-100">
      <div className="container mx-auto px-4 py-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-lato font-bold text-camp-primary">
            {album!.name}
          </h1>
          <div className="flex items-center gap-4 shrink-0">
            {/* Tagging */}
            <Tagging
              items={allTags}
              selectedItems={selectedTags}
              onSelectionChange={setSelectedTags}
              getOptionLabel={(tag) =>
                `${tag.name.firstName} ${tag.name.lastName}`
              }
              getOptionValue={(tag) => tag.campminderId.toString()}
              placeholder="Search Tags..."
              className="w-64 cursor-pointer"
            />

            {/* Sort Dropdown */}
            <div className="relative">
              <img
                className="w-[80px] h-[48px] flex-none cursor-pointer"
                src={filterIcon.src}
                alt="Filter"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              />
              {showSortDropdown && (
                <SortDropdown
                  options={[
                    {
                      label: "Oldest → Newest",
                      onSelect: () => {
                        setImages((prev: ImageID[]) =>
                          prev.sort((a: ImageID, b: ImageID) =>
                            a.dateTaken.localeCompare(b.dateTaken)
                          )
                        );
                      },
                    },
                    {
                      label: "Newest → Oldest",
                      onSelect: () => {
                        setImages((prev: ImageID[]) =>
                          prev.sort((a: ImageID, b: ImageID) =>
                            b.dateTaken.localeCompare(a.dateTaken)
                          )
                        );
                      },
                    },
                  ]}
                />
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
            <FileUploadModal
              onUpload={uploadImages}
              acceptedFileExtensions={[".jpg", ".png"]}
              maxFileSize={5}
            >
              <img
                className="w-[72px] h-[72px] flex-none cursor-pointer"
                src={plusIcon.src}
                alt="Plus"
              />
            </FileUploadModal>

            {/* Download */}
            <img
              className="w-[48px] h-[48px] flex-none cursor-pointer"
              src={DownloadIcon.src}
              alt="Download"
              onClick={handleDownloadAll}
            />
          </div>
        </div>

        {/* Content */}
        <CardGallery<ImageID>
          items={displayImages}
          renderItem={(image: ImageID, isSelected: boolean) => (
            <ImageCard image={image} isSelected={isSelected} />
          )}
          groups={{
            groupLabels: [
              ...new Set(
                displayImages.map((image: ImageID) => image.dateTaken)
              ),
            ].sort((a, b) => a.localeCompare(b)),
            defaultGroupLabel: "Date Unknown",
            groupFunc: (image: ImageID) => image.dateTaken,
          }}
        />
      </div>
    </div>
  );
}
