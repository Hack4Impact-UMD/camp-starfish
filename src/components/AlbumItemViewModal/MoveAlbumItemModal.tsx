"use client";

import { useState } from "react";
import { modals } from "@mantine/modals";
import { Button, Loader, Select, Text, Title } from "@mantine/core";
import { MdDriveFileMove, MdError } from "react-icons/md";
import useAlbumList from "@/hooks/albums/useAlbumList";
import useMoveAlbumItem from "@/features/albums/moving/useMoveAlbumItem";
import useNotifications from "@/features/notifications/useNotifications";

interface MoveAlbumItemModalProps {
  albumId: string;
  albumItemId: string;
}

function MoveAlbumItemModalContent(props: MoveAlbumItemModalProps) {
  const { albumId, albumItemId } = props;

  const [targetAlbumId, setTargetAlbumId] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState<boolean>(false);

  const albumsQuery = useAlbumList({
    orderBy: [{ fieldPath: "name", direction: "asc" }],
    limit: 100,
    limitToLast: undefined,
  });
  const moveMutation = useMoveAlbumItem();
  const notifications = useNotifications();

  if (succeeded) {
    return (
      <div className="flex flex-col items-center gap-3 px-2 pb-2">
        <MdDriveFileMove className="text-success" size={48} />
        <Title order={4} className="text-success">
          Moved!
        </Title>
        <Text className="text-center text-neutral-6">
          The photo was moved to the selected album.
        </Text>
        <Button color="neutral" onClick={() => modals.closeAll()}>
          CLOSE
        </Button>
      </div>
    );
  }

  const albums = (albumsQuery.data?.pages.flatMap((page) => page.docs) ?? [])
    .filter((album) => album.id !== albumId)
    .map((album) => ({ value: album.id, label: album.name }));

  return (
    <div className="flex flex-col items-center gap-4 px-2 pb-2">
      <Title order={4} className="text-center">
        Move to album
      </Title>
      <Text className="text-center text-neutral-6">
        Choose an album to move this photo to
      </Text>

      <Select
        className="w-full"
        placeholder="Select an album..."
        data={albums}
        value={targetAlbumId}
        onChange={setTargetAlbumId}
        searchable
        nothingFoundMessage="No albums found"
        rightSection={
          albumsQuery.isPending ? (
            <Loader size={16} />
          ) : albumsQuery.isError ? (
            <MdError className="text-error" size={18} />
          ) : null
        }
        disabled={albumsQuery.isPending || albumsQuery.isError}
      />

      <div className="flex w-full justify-center gap-4 pt-2">
        <Button color="neutral" onClick={() => modals.closeAll()}>
          CLOSE
        </Button>
        <Button
          color="green"
          disabled={!targetAlbumId}
          loading={moveMutation.isPending}
          onClick={() =>
            targetAlbumId &&
            moveMutation.mutate(
              { fromAlbumId: albumId, albumItemId, toAlbumId: targetAlbumId },
              {
                onSuccess: () => setSucceeded(true),
                onError: () =>
                  notifications.error(
                    "Failed to move the photo. Please try again.",
                  ),
              },
            )
          }
        >
          MOVE
        </Button>
      </div>
    </div>
  );
}

export default function openMoveAlbumItemModal(
  albumId: string,
  albumItemId: string,
) {
  modals.open({
    withCloseButton: false,
    children: (
      <MoveAlbumItemModalContent albumId={albumId} albumItemId={albumItemId} />
    ),
  });
}
