import React, { JSX, useState } from "react";
import useAlbumItem from "@/hooks/albumItems/useAlbumItem";
import useRejectPendingAlbumItems from "@/hooks/albumItems/pendingItems/useRejectPendingAlbumItems";
import useApprovePendingAlbumItems from "@/hooks/albumItems/pendingItems/useApprovePendingAlbumItems";
import useAlbumItemBlob from "@/hooks/albumItems/useAlbumItemBlob";
import { BackgroundImage, Card, Image, Overlay } from "@mantine/core";
import classNames from "classnames";
import useAlbumItemSrc from "@/hooks/albumItems/useAlbumItemSrc";
import LoadingAnimation from "./LoadingAnimation";
import { MdError } from "react-icons/md";

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

    console.log(albumItemSrcQuery.data)

    let cardContent: JSX.Element;
    switch (albumItemSrcQuery.status) {
        case "error":
            cardContent = <MdError className="text-error" size={60} />
            break;
        case "pending":
            cardContent = <LoadingAnimation />
            break;
        case "success":
            cardContent = (
                <Image src={albumItemSrcQuery.data} alt={albumItemQuery.data?.name ?? albumItemId} width={100} height={100} className="object-contain w-full h-full" unoptimized/>
            )
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
            >
              {cardContent}
            </Card>
    )
};