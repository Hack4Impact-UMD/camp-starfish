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
import { AlbumID, ImageID, ImageTags, Tag } from "@/types/albumTypes";
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
import { allTags, getTags } from "@/data/allTags";
import { useAuth } from "@/auth/useAuth";
import { Role } from "@/types/personTypes";

const imageTagData: { [imageId: string]: ImageTags } = {
  "67fde13c-16f3-4080-847e-f8e935a76aa0": {
    approved: getTags([1, 3, 4]),
    inReview: getTags([2]),
  },
  "c01ecc3c-e313-4541-9af7-014a67e78ca4": {
    approved: getTags([2, 3, 4]),
    inReview: getTags([10, 11]),
  },
  "f5080e37-746d-4d74-9ecb-09b20276365b": {
    approved: getTags([1, 4, 9]),
    inReview: getTags([]),
  },
  "fefe3fbb-0724-4d5d-ab49-af961be8b842": {
    approved: getTags([]),
    inReview: getTags([1, 2, 3, 4, 9, 10, 11]),
  },
};

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

  useEffect(() => {
    async function fetchAlbum() {
      const album = await getAlbumById(albumId);
      setAlbum(album);
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
    }

    Promise.all([fetchAlbum(), fetchImages()]).then(() => setIsLoading(false));
  }, []);

  const auth = useAuth();
  const role: Role = auth.token?.claims.role as Role;
  const campminderId = auth.token?.claims.campminderId;

  const displayImages = images.filter((image) => {
    return (
      role === "ADMIN" ||
      imageTagData[image.id] === "ALL" ||
      imageTagData[image.id].approved.some(
        (tag: Tag) => tag.campminderId === campminderId
      )
    );
  });

  async function uploadImages(images: File[]) {
    let paths = images.map((img: File) => `albums/${albumId}/${uuidv4()}`);
    await uploadFiles(images, paths);
  }

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
    <div className="w-full min-h-screen bg-gray-100">
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
