import React, { JSX, useState } from "react";
import useAlbumItem from "@/hooks/albumItems/useAlbumItem";
import useRejectPendingAlbumItems from "@/hooks/albumItems/pendingItems/useRejectPendingAlbumItems";
import useApprovePendingAlbumItems from "@/hooks/albumItems/pendingItems/useApprovePendingAlbumItems";
import useAlbumItemBlob from "@/hooks/albumItems/useAlbumItemBlob";
import {
  ActionIcon,
  BackgroundImage,
  Card,
  Checkbox,
  Image,
  Overlay,
  Text,
} from "@mantine/core";
import classNames from "classnames";
import useAlbumItemSrc from "@/hooks/albumItems/useAlbumItemSrc";
import LoadingAnimation from "./LoadingAnimation";
import { MdCheck, MdClose, MdError } from "react-icons/md";
import { useHover } from "@mantine/hooks";

interface PendingAlbumItemCardProps {
  albumId: string;
  albumItemId: string;
  isSelected: boolean;
}

export default function PendingAlbumItemCard(props: PendingAlbumItemCardProps) {
  const { albumId, albumItemId, isSelected } = props;

  const albumItemQuery = useAlbumItem({ albumId, albumItemId });
  const albumItemSrcQuery = useAlbumItemSrc(albumId, albumItemId);

  const approvePendingAlbumItemsMutation = useApprovePendingAlbumItems();
  const rejectPendingAlbumItemsMutation = useRejectPendingAlbumItems();

  const { ref, hovered } = useHover();

  let cardContent: JSX.Element;
  switch (albumItemSrcQuery.status) {
    case "error":
      cardContent = <MdError className="text-error" size={60} />;
      break;
    case "pending":
      cardContent = <LoadingAnimation />;
      break;
    case "success":
      cardContent = (
        <>
          <Image
            src={albumItemSrcQuery.data}
            alt={albumItemQuery.data?.name ?? albumItemId}
            width={100}
            height={100}
            className="object-contain w-full h-full"
            unoptimized
          />
          {hovered && (
            <Overlay className="flex flex-row justify-between items-start bg-transparent p-xs">
              <div className="flex justify-center items-center rounded-sm bg-[#ffffffc0] w-8 h-8">
                <Checkbox
                  color="neutral.8"
                  classNames={{
                    input: "rounded-sm",
                  }}
                  checked={isSelected}
                />
              </div>

              <div className="flex flex-row w-fit h-fit bg-[#ffffffc0] rounded-sm gap-xs">
                <ActionIcon color="success" size="md">
                  <MdCheck size={20} />
                </ActionIcon>
                <ActionIcon color="error" size="md">
                  <MdClose size={20} />
                </ActionIcon>
              </div>
            </Overlay>
          )}
        </>
      );
  }

  return (
    <Card
      classNames={{
        root: classNames("rounded-none p-0 aspect-3/2 cursor-pointer group", {
          "border-neutral-8": isSelected,
          "border-transparent": !isSelected,
          "border-4": albumItemSrcQuery.isSuccess,
        }),
      }}
      ref={ref}
    >
      {cardContent}
    </Card>
  );
}
