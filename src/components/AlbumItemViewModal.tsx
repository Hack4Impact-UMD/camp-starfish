import React from "react";
import { useAuth } from "@/auth/useAuth";
import ImageViewBottomSection from "@/components/ImageViewBottomSection";
import { Role } from "@/types/users/userTypes";
import { modals } from "@mantine/modals";
import useAlbumItem from "@/hooks/albumItems/useAlbumItem";
import useAlbumItemSrc from "@/hooks/albumItems/useAlbumItemSrc";
import {
  MdClose,
  MdOutlineFileDownload,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { ActionIcon, Button, Image, Title } from "@mantine/core";

interface ImageViewProps {
  albumId: string;
  albumItemId: string;
  onClose: () => void;
  onLeftClick: () => void;
  onRightClick: () => void;
}

export function AlbumItemViewModal({
  albumId,
  albumItemId,
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
    alert("Move To Clicked");
  };

  return (
    <div
      onClick={modals.closeAll}
      className="w-full h-full bg-black flex flex-col items-center justify-between"
    >
      <div className="w-full flex flex-row justify-between items-start max-h-1/10 px-sm py-sm">
        <div className="flex flex-row items-center space-x-4 sm:space-x-10">
          <ActionIcon
            variant="transparent"
            onClick={onClose}
            aria-label="Close Modal"
          >
            <MdClose className="text-white active:outline-none" size={30} />
          </ActionIcon>
          <Title order={5} classNames={{ root: "text-white" }}>
            {albumItemQuery.data.name}
          </Title>
        </div>
        <Button
          color="aqua"
          rightSection={<MdOutlineFileDownload size={20} />}
          aria-label="Download Album Item"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Download
        </Button>
      </div>

      <div className="flex grow items-center justify-center w-full gap-4">
        <ActionIcon onClick={(e) => {
          e.stopPropagation();
          onLeftClick();
        }} aria-label="Previous Item">
          <MdChevronLeft size={50} />
        </ActionIcon>
        <div>
          <Image
            src={albumItemSrcQuery.data}
            alt={albumItemQuery.data.name}
            width={200}
            height={200}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <ActionIcon onClick={(e) => {
          e.stopPropagation();
          onRightClick();
        }} aria-label="Next Item">
          <MdChevronRight size={50} />
        </ActionIcon>
      </div>

      {/* Bottom Section: Displays tags and moderation controls if applicable */}
      {/* <ImageViewBottomSection image={albumItemQuery.data} /> */}
    </div>
  );
}

export default function openAlbumItemViewModal(
  albumId: string,
  albumItemId: string,
) {
  modals.open({
    classNames: {
      content: "bg-black",
      body: "w-full h-full",
    },
    children: (
      <AlbumItemViewModal
        albumId={albumId}
        albumItemId={albumItemId}
        onClose={() => {}}
        onLeftClick={() => {}}
        onRightClick={() => {}}
      />
    ),
    fullScreen: true,
    withCloseButton: false,
  });
}
