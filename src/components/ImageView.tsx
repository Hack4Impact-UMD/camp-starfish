import React, { useEffect, useRef } from "react";
import { useAuth } from "@/auth/useAuth";
import Image from "next/image";
import CloseIcon from "@/assets/icons/closeIcon.svg";
import DownloadIcon from "@/assets/icons/downloadIcon.svg";
import FolderMoveIcon from "@/assets/icons/folderMoveIcon.svg";
import LeftArrowIcon from "@/assets/icons/leftArrow.svg";
import RightArrowIcon from "@/assets/icons/rightArrow.svg";
import ImageViewBottomSection from "@/components/ImageViewBottomSection";
import { Role } from "@/types/personTypes";
import { ImageMetadata } from "@/types/albumTypes";

interface ImageViewProps {
  image: File;
  onLeftClick: () => void;
  onRightClick: () => void;
  metadata: ImageMetadata;
  userRole: "ADMIN" | "PARENT" | "PHOTOGRAPHER" | "STAFF";
}

export default function ImageView({
  image,
  onLeftClick,
  onRightClick,
  metadata,
  userRole,
}: ImageViewProps) {

  const auth = useAuth();
  // const userRole: Role = auth.token?.claims.role as Role;

  return (
    <div className="fixed w-full h-full inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-between">
      {/* Top Controls */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 px-6 sm:px-10 pt-6 sm:pt-8 pb-4 text-white">
        <div className="flex flex-row items-center space-x-4 sm:space-x-10">
          <button>
            <Image src={CloseIcon.src} alt="X Icon" width={32} height={32} />
          </button>
          <p className="text-xl font-lato"> {metadata.name} </p>
          {/* <p className="text-xl font-lato"> Photo Name </p> */}
        </div>

        <div className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          {userRole !== "PARENT" && (
            <button className="bg-camp-primary flex flex-row justify-center space-x-4 p-2 rounded-3xl w-full sm:w-64 border border-camp-buttons-neutral">
              <p className="text-base sm:text-lg font-lato">MOVE TO</p>
              <Image
                src={FolderMoveIcon.src}
                alt="Folder Move Icon"
                width={25}
                height={25}
              />
            </button>
          )}
          <button className="bg-camp-tert-blue flex flex-row justify-center space-x-4 p-2 rounded-3xl w-full sm:w-64">
            <p className="text-base sm:text-lg font-lato">DOWNLOAD</p>
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
        <button onClick={onLeftClick} className="absolute left-2 sm:left-0">
          <Image
            src={LeftArrowIcon.src}
            alt="Left Arrow Icon"
            width={50}
            height={50}
          />
        </button>
        <Image
          src={URL.createObjectURL(image)}
          alt="Selected Image"
          width={500}
          height={500}
        />
        <button onClick={onRightClick} className="absolute right-2 sm:right-0">
          <Image
            src={RightArrowIcon.src}
            alt="Right Arrow Icon"
            width={50}
            height={50}
          />
        </button>
      </div>

      {/* Bottom Section */}
      <ImageViewBottomSection userRole={userRole} tags={metadata.tags}/>
    </div>
  );
}
