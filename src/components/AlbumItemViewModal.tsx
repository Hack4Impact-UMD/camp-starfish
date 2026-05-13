import React from "react";
import { useAuth } from "@/auth/useAuth";
import Image from "next/image";
import ImageViewBottomSection from "@/components/ImageViewBottomSection";
import { Role } from "@/types/users/userTypes";
import { modals } from "@mantine/modals";
import useAlbumItem from "@/hooks/albumItems/useAlbumItem";
import useAlbumItemSrc from "@/hooks/albumItems/useAlbumItemSrc";
import { MdClose, MdOutlineFileDownload, MdArrowBack, MdArrowForward } from "react-icons/md";

interface ImageViewProps {
  albumId: string;
  albumItemId: string;
  onClose: () => void;
  onLeftClick: () => void;
  onRightClick: () => void;
}


export function AlbumItemViewModal({
  albumId, albumItemId,
  onClose,
  onLeftClick,
  onRightClick,
}: ImageViewProps) {

  const albumItemQuery = useAlbumItem({ albumId, albumItemId });
  const albumItemSrcQuery = useAlbumItemSrc(albumId, albumItemId);


  const auth = useAuth();
  const userRole: Role = auth.token?.claims.role as Role;

  const handleDownload = async () => {
    //try {
    //  await downloadImage(image.src, image.name || "downloaded-image");
    //} catch (error) {
    //  console.error("Failed to download image:", error);
    //}
  };

  if (!albumItemQuery.data || !albumItemSrcQuery.data) return <></>;

  const handleMoveTo = () => {
    alert("Move To Clicked")
  };
 
  return (
    <div className="fixed w-full h-full inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-between">
      {/* Header Section: Close button, image name, and action buttons */}
      <div className="w-full flex flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 px-6 sm:px-10 pt-6 sm:pt-8 pb-4 text-white">
        <div className="flex flex-row items-center space-x-4 sm:space-x-10">
          <button onClick={onClose} aria-label="Close">
            <MdClose size={30} />
          </button>
          <p className="text-xl font-lato"> {albumItemQuery.data.name} </p>
        </div>

        <div className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <button
            onClick={handleDownload}
            className="bg-camp-tert-blue flex flex-row justify-center gap-4 p-2 rounded-3xl w-12 md:w-64"
            aria-label="Download Image"
          >
            <p className="hidden md:inline text-sm md:text-lg font-lato">
              DOWNLOAD
            </p>
            <MdOutlineFileDownload size={20} />
          </button>
        </div>
      </div>

      <div className="relative flex flex-grow items-center justify-center w-full px-4 max-w-full sm:max-w-5xl">
        <button
          onClick={onLeftClick}
          className="absolute left-2 sm:left-0"
          aria-label="Previous Image"
        >
          <MdArrowBack size={50} />
        </button>
        <Image
          src={""}
          alt="Selected Image"
          width={500}
          height={500}
        />
        <button
          onClick={onRightClick}
          className="absolute right-2 sm:right-0"
          aria-label="Next Image"
        >
          <MdArrowForward size={50} />
        </button>
      </div>

      {/* Bottom Section: Displays tags and moderation controls if applicable */}
      {/* <ImageViewBottomSection
        image={albumItemQuery.data}
      /> */}
    </div>
  );
}

export default function openAlbumItemViewModal(albumId: string, albumItemId: string) {
  modals.open({
    children: <AlbumItemViewModal albumId={albumId} albumItemId={albumItemId} onClose={( ) => {}} onLeftClick={( ) => {}} onRightClick={( ) => {}} />,
    fullScreen: true,
    withCloseButton: false
  });
}