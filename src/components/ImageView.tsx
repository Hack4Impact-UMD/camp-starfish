import React, { useEffect } from "react";
import Image from "next/image";
import CloseIcon from "@/assets/icons/closeIcon.svg";
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
  userRole: "ADMIN" | "PARENT" | "PHOTOGRAPHER" | "STAFF";
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
    <div className="fixed w-full h-full inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-between">
      {/* Top Controls */}
      <div className="w-full flex flex-row justify-between items-center px-10 pt-8 pb-4 text-white">
        <div className="flex flex-row items-center space-x-10">
          <button>
            <Image src={CloseIcon.src} alt="X Icon" width={32} height={32} />
          </button>

          <div className="flex flex-row space-x-4">
            <p className="text-xl font-lato">Photo Title</p>
            {userRole !== "PARENT" && (
              <button>
                <Image
                  src={EditIcon.src}
                  alt="Edit Icon"
                  width={25}
                  height={25}
                />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-row justify-between items-center space-x-4">
          {userRole === "PARENT" ? (
            <button className="bg-camp-tert-green flex flex-row justify-center space-x-4 p-2 rounded-3xl w-64">
              <p className="text-lg font-lato">SHARE</p>
              <Image
                src={ShareIcon.src}
                alt="Share Icon"
                width={23}
                height={23}
              />
            </button>
          ) : (
            <button className="bg-camp-tert-green flex flex-row justify-center space-x-4 p-2 rounded-3xl w-64">
              <p className="text-lg font-lato">MOVE TO</p>
              <Image
                src={FolderMoveIcon.src}
                alt="Folder Move Icon"
                width={25}
                height={25}
              />
            </button>
          )}
          <button className="bg-camp-tert-blue flex flex-row justify-center space-x-4 p-2 rounded-3xl w-64">
            <p className="text-lg font-lato">DOWNLOAD</p>
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
      <div className="relative flex flex-grow items-center justify-center w-full max-w-5xl">
        <button onClick={onLeftClick} className="absolute left-0">
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
        <button onClick={onRightClick} className="absolute right-0">
          <Image
            src={RightArrowIcon.src}
            alt="Right Arrow Icon"
            width={50}
            height={50}
          />
        </button>
      </div>

      {/* Bottom Section */}
      <ImageViewBottomSection userRole={userRole} />
    </div>
  );
}
