import React, { useEffect } from "react";
import Image from "next/image";
import XIcon from "@/assets/icons/xIcon.svg";
import EditIcon from "@/assets/icons/editIcon.svg";
import DownloadIcon from "@/assets/icons/downloadIcon.svg";
import FolderMoveIcon from "@/assets/icons/folderMoveIcon.svg";
import ShareIcon from "@/assets/icons/shareIcon.svg";
import LeftArrowIcon from "@/assets/icons/leftArrow.svg";
import RightArrowIcon from "@/assets/icons/rightArrow.svg";
import ImageViewBottomSection from "@/components/ImageViewBottomSection";

interface ImageViewProps {
  image: File;
  onLeftClick: () => void;
  onRightClick: () => void;
  userRole: "parent" | "staff" | "photographer" | "admin";
}

export default function ImageView({
  image,
  onLeftClick,
  onRightClick,
  userRole,
}: ImageViewProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed w-full h-full inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-start space-y-8 p-10">
      {/* Top Controls */}
      <div className="w-full flex flex-row justify-between items-center p-4 text-white">
        <div className="flex flex-row items-center space-x-10">
          <Image src={XIcon.src} alt="X Icon" width={32} height={32} />
          <div className="flex flex-row space-x-4">
            <p className="text-xl">Photo Title</p>
            <Image src={EditIcon.src} alt="Edit Icon" width={25} height={25} />
          </div>
        </div>

        <div className="flex flex-row justify-between items-center space-x-4">
          {userRole === "parent" ? (
            <button className="bg-camp-tert-green flex flex-row justify-center space-x-4 p-2 rounded-3xl w-64">
              <p className="text-xl">SHARE</p>
              <Image
                src={ShareIcon.src}
                alt="Share Icon"
                width={23}
                height={23}
              />
            </button>
          ) : (
            <button className="bg-camp-tert-green flex flex-row justify-center space-x-4 p-2 rounded-3xl w-64">
              <p className="text-xl">MOVE TO</p>
              <Image
                src={FolderMoveIcon.src}
                alt="Folder Move Icon"
                width={25}
                height={25}
              />
            </button>
          )}
          <button className="bg-camp-tert-blue flex flex-row justify-center space-x-4 p-2 rounded-3xl w-64">
            <p className="text-xl">DOWNLOAD</p>
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
      <div className="relative flex items-center justify-center w-full max-w-5xl">
        <button onClick={onLeftClick} className="absolute left-0">
            <Image src={LeftArrowIcon.src} alt="Left Arrow Icon" width={50} height={50} />
        </button>
        <Image
          src={URL.createObjectURL(image)}
          alt="Selected"
          width={600}
          height={400}
          className="rounded-lg"
        />
        <button onClick={onRightClick} className="absolute right-0">
            <Image src={RightArrowIcon.src} alt="Right Arrow Icon" width={50} height={50} />
        </button>
      </div>

      
    </div>
  );
}