import React, { useState } from "react";
import checkIcon from "@/assets/icons/checkIcon.svg";
import crossIcon from "@/assets/icons/crossIcon.svg";
import useAlbumItem from "@/hooks/albumItems/useAlbumItem";
import useRejectPendingAlbumItems from "@/hooks/albumItems/pendingItems/useRejectPendingAlbumItems";
import useApprovePendingAlbumItems from "@/hooks/albumItems/pendingItems/useApprovePendingAlbumItems";
import useAlbumItemBlob from "@/hooks/albumItems/useAlbumItemBlob";

interface PendingAlbumItemCardProps {
    albumId: string;
    albumItemId: string;
}

export default function PendingAlbumItemCard(props: PendingAlbumItemCardProps) {
    const { albumId, albumItemId } = props;

    const albumItemQuery = useAlbumItem({ albumId, albumItemId });
    const albumItemBlobQuery = useAlbumItemBlob(albumId, albumItemId);

    const approvePendingAlbumItemsMutation = useApprovePendingAlbumItems();
    const rejectPendingAlbumItemsMutation = useRejectPendingAlbumItems();

    return (
        <div className="relative group w-full rounded overflow-hidden shadow-md">
            <img
                src={src}
                alt={alt}
                className="w-full h-auto object-cover"
            />

            <div
                className={`absolute top-4 right-4 flex gap-2 px-3 py-1 rounded bg-white/80 transition-opacity ${
                    status === "none" ? "opacity-50 group-hover:opacity-100" : "opacity-100"
                }`}
            >
                <button
                    onClick={handleApprove}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        status === "approved" ? "bg-camp-buttons-success" : "bg-white"
                    }`}
                >
                    <img src={checkIcon.src} alt="Approve" className="w-3 h-3" />
                </button>
                <button
                    onClick={handleReject}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        status === "rejected" ? "bg-camp-primaryScale-p300" : "bg-white"
                    }`}
                >
                    <img src={crossIcon.src} alt="Reject" className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};