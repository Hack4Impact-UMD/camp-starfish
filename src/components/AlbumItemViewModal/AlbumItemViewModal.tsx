import React, { useState } from "react";
import { modals } from "@mantine/modals";
import useAlbumItem from "@/hooks/albumItems/useAlbumItem";
import useAlbumItemSrc from "@/hooks/albumItems/useAlbumItemSrc";
import {
  MdClose,
  MdOutlineFileDownload,
  MdChevronLeft,
  MdChevronRight,
  MdDriveFileMove,
} from "react-icons/md";
import { ActionIcon, Button, Loader, Title } from "@mantine/core";
import useDownloadAlbumItem from "@/features/albums/downloading/useDownloadAlbumItem";
import useNotifications from "@/features/notifications/useNotifications";
import AlbumItemViewModalTagSection from "./AlbumItemViewModalTagSection";
import AlbumItemViewModalReportSection from "./AlbumItemViewModalReportSection";
import { useAuth } from "@/auth/useAuth";
import { Role } from "@/types/users/userTypes";
import RequireAuth from "@/auth/RequireAuth";
import openMoveAlbumItemModal from "./MoveAlbumItemModal";

interface ImageViewProps {
  albumId: string;
  albumItemIds: string[];
  startIndex: number;
}

export function AlbumItemViewModal(props: ImageViewProps) {
  const { albumId, albumItemIds, startIndex } = props;

  const [index, setIndex] = useState<number>(startIndex);
  const albumItemId = albumItemIds[index];

  const albumItemQuery = useAlbumItem({ albumId, albumItemId });
  const albumItemSrcQuery = useAlbumItemSrc(albumId, albumItemId);
  const downloadAlbumItemMutation = useDownloadAlbumItem();
  const notifications = useNotifications();

  const auth = useAuth();
  const role = auth.token?.claims.role as Role | undefined;

  const canGoLeft = index > 0;
  const canGoRight = index < albumItemIds.length - 1;
  const canMove =
    !!role && (["ADMIN", "PHOTOGRAPHER", "STAFF"] as Role[]).includes(role);
  const itemName = albumItemQuery.data?.name ?? "";

  return (
    <div
      onClick={modals.closeAll}
      className="w-full h-full bg-black flex flex-col"
    >
      <div className="w-full shrink-0 flex flex-row justify-between items-start px-sm py-sm">
        <div className="flex flex-row items-center space-x-4 sm:space-x-10">
          <ActionIcon
            variant="transparent"
            onClick={modals.closeAll}
            aria-label="Close Modal"
          >
            <MdClose className="text-white active:outline-none" size={30} />
          </ActionIcon>
          <Title order={5} classNames={{ root: "text-white" }}>
            {itemName}
          </Title>
        </div>
        <div
          className="flex flex-row items-center gap-2 sm:gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          {canMove && (
            <Button
              variant="white"
              leftSection={<MdDriveFileMove size={20} />}
              aria-label="Move Album Item"
              disabled={!albumItemQuery.data}
              onClick={() => openMoveAlbumItemModal(albumId, albumItemId)}
            >
              Move To
            </Button>
          )}
          <Button
            color="aqua"
            rightSection={<MdOutlineFileDownload size={20} />}
            aria-label="Download Album Item"
            disabled={!albumItemQuery.data}
            onClick={() => {
              downloadAlbumItemMutation.mutate(
                { albumId, albumItemId },
                {
                  onError: () =>
                    notifications.error(`Failed to download "${itemName}"`),
                },
              );
            }}
          >
            Download
          </Button>
        </div>
      </div>

      <div className="flex grow min-h-0 items-center justify-center w-full gap-4 px-2">
        <ActionIcon
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => Math.max(0, i - 1));
          }}
          disabled={!canGoLeft}
          aria-label="Previous Item"
        >
          <MdChevronLeft size={50} />
        </ActionIcon>
        <div
          className="flex-1 min-w-0 h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {albumItemSrcQuery.data ? (
            // eslint-disable-next-line @next/next/no-img-element -- full-resolution lightbox image; next/image's fixed sizing/optimization is unwanted here
            <img
              src={albumItemSrcQuery.data}
              alt={itemName}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <Loader color="white" />
          )}
        </div>
        <ActionIcon
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => Math.min(albumItemIds.length - 1, i + 1));
          }}
          disabled={!canGoRight}
          aria-label="Next Item"
        >
          <MdChevronRight size={50} />
        </ActionIcon>
      </div>

      <div className="w-full shrink-0">
        <RequireAuth
          authCases={[
            {
              authFn: () => role === "PARENT",
              component: (
                <AlbumItemViewModalReportSection
                  albumId={albumId}
                  albumItemId={albumItemId}
                />
              ),
            },
            {
              authFn: () =>
                !!role &&
                (["ADMIN", "PHOTOGRAPHER", "STAFF"] as Role[]).includes(role),
              component: (
                <AlbumItemViewModalTagSection
                  albumId={albumId}
                  albumItemId={albumItemId}
                />
              ),
            },
          ]}
          fallbackComponent={<></>}
        />
      </div>
    </div>
  );
}

export default function openAlbumItemViewModal(
  albumId: string,
  albumItemIds: string[],
  startIndex: number,
) {
  modals.open({
    classNames: {
      content: "bg-black",
      body: "w-full h-full",
    },
    children: (
      <AlbumItemViewModal
        albumId={albumId}
        albumItemIds={albumItemIds}
        startIndex={startIndex}
      />
    ),
    fullScreen: true,
    withCloseButton: false,
  });
}
