import React from "react";
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
import useDownloadAlbumItem from "@/features/albums/downloading/useDownloadAlbumItem";
import useNotifications from "@/features/notifications/useNotifications";

interface ImageViewProps {
  albumId: string;
  albumItemId: string;
  onClose: () => void;
  onLeftClick: () => void;
  onRightClick: () => void;
}

export function AlbumItemViewModal(props: ImageViewProps) {
  const { albumId, albumItemId, onClose, onLeftClick, onRightClick } = props;

  const albumItemQuery = useAlbumItem({ albumId, albumItemId });
  const albumItemSrcQuery = useAlbumItemSrc(albumId, albumItemId);
  const downloadAlbumItemMutation = useDownloadAlbumItem();
  const notifications = useNotifications();

  if (!albumItemQuery.data || !albumItemSrcQuery.data) return <></>;

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
            downloadAlbumItemMutation.mutate({ albumId, albumItemId }, { onError: () => notifications.error(`Failed to download "${albumItemQuery.data.name}"`) });
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
