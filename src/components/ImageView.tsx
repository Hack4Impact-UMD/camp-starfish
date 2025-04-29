import React from "react";
import { useAuth } from "@/auth/useAuth";
import Image from "next/image";
import CloseIcon from "@/assets/icons/closeIcon.svg";
import DownloadIcon from "@/assets/icons/downloadIcon.svg";
import FolderMoveIcon from "@/assets/icons/folderMoveIcon.svg";
import LeftArrowIcon from "@/assets/icons/leftArrow.svg";
import RightArrowIcon from "@/assets/icons/rightArrow.svg";
import ImageViewBottomSection from "@/components/ImageViewBottomSection";
import { Role } from "@/types/personTypes";
import { ImageID } from "@/types/albumTypes";
import { downloadImage } from "@/data/storage/fileOperations";


interface ImageViewProps {
  image: ImageID;
  onClose: () => void;
  onLeftClick: () => void;
  onRightClick: () => void;
}

export default function ImageView({
  image,
  onClose,
  onLeftClick,
  onRightClick,
}: ImageViewProps) {
  const auth = useAuth();
  const userRole: Role = auth.token?.claims.role as Role;

  // const handleDownload = () => {
  //   const element = document.createElement("a");
  //   element.href = image.src
  //   element.download = image.name || "downloaded-image";
  //   document.body.appendChild(element);
  //   element.click();
  //   document.body.removeChild(element);
  //   URL.revokeObjectURL(element.href);
  // };

  const handleDownload = async () => {
    try {
      await downloadImage(image.src, image.name || "downloaded-image");
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const handleMoveTo = () => {
    alert("Move To Clicked")
  };
 

  return (
    <div className="fixed w-full h-full inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-between">
      {/* Top Controls */}
      <div className="w-full flex flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 px-6 sm:px-10 pt-6 sm:pt-8 pb-4 text-white">
        <div className="flex flex-row items-center space-x-4 sm:space-x-10">
          <button onClick={onClose} aria-label="Close">
            <Image src={CloseIcon.src} alt="X Icon" width={32} height={32} />
          </button>
          <p className="text-xl font-lato"> {image.name} </p>
        </div>

        <div className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          {userRole !== "PARENT" && (
            <button
              onClick={handleMoveTo}
              className="bg-camp-primary flex flex-row justify-center gap-4 p-2 rounded-3xl w-12 md:w-64 border border-camp-buttons-neutral"
              aria-label="Move Image"
            >
              <p className="hidden md:inline text-sm md:text-lg font-lato">
                MOVE TO
              </p>
              <Image
                src={FolderMoveIcon.src}
                alt="Folder Move Icon"
                width={25}
                height={25}
              />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="bg-camp-tert-blue flex flex-row justify-center gap-4 p-2 rounded-3xl w-12 md:w-64"
            aria-label="Download Image"
          >
            <p className="hidden md:inline text-sm md:text-lg font-lato">
              DOWNLOAD
            </p>
            <Image
              src={DownloadIcon.src}
              alt="Download Icon"
              width={18}
              height={18}
            />
          </button>
        </div>
      </div>

      {/* Image Display */}
      <div className="relative flex flex-grow items-center justify-center w-full px-4 max-w-full sm:max-w-5xl">
        <button
          onClick={onLeftClick}
          className="absolute left-2 sm:left-0"
          aria-label="Previous Image"
        >
          <Image
            src={LeftArrowIcon.src}
            alt="Left Arrow Icon"
            width={50}
            height={50}
          />
        </button>
        <Image
          src={image.src}
          alt="Selected Image"
          width={500}
          height={500}
        />
        <button
          onClick={onRightClick}
          className="absolute right-2 sm:right-0"
          aria-label="Next Image"
        >
          <Image
            src={RightArrowIcon.src}
            alt="Right Arrow Icon"
            width={50}
            height={50}
          />
        </button>
      </div>

      {/* Bottom Section */}
      <ImageViewBottomSection
        image={image}
      />
    </div>
  );
}
