"use client";

import { useState } from "react";
import { modals } from "@mantine/modals";
import { Button, Loader, Modal, Select, Text, Title } from "@mantine/core";
import { MdDriveFileMove, MdError } from "react-icons/md";
import useAlbumList from "@/hooks/albums/useAlbumList";
import useMoveAlbumItem from "@/features/albums/moving/useMoveAlbumItem";
import useNotifications from "@/features/notifications/useNotifications";

interface MoveAlbumItemModalProps {
  albumId: string;
  albumItemId: string;
  opened: boolean;
  onClose: () => void;
}

export default function MoveAlbumItemModal(props: MoveAlbumItemModalProps) {
  const { albumId, albumItemId, opened, onClose } = props;

  const [targetAlbumId, setTargetAlbumId] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState<boolean>(false);

  const albumsQuery = useAlbumList({
    orderBy: [{ fieldPath: "name", direction: "asc" }],
    limit: 100,
    limitToLast: undefined,
  });
  const moveMutation = useMoveAlbumItem();
  const notifications = useNotifications();

  const handleClose = () => {
    onClose();
    setTargetAlbumId(null);
    setSucceeded(false);
  };

  const albums = (albumsQuery.data?.pages.flatMap((page) => page.docs) ?? [])
    .filter((album) => album.id !== albumId)
    .map((album) => ({ value: album.id, label: album.name }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      withCloseButton={false}
      centered
      zIndex={1000}
    >
      {succeeded ? (
        <div className="flex flex-col items-center gap-3 pb-2">
          <MdDriveFileMove className="text-success" size={48} />
          <Title order={4} className="text-success">
            Moved!
          </Title>
          <Text className="text-center text-neutral-6">
            The photo was moved to the selected album.
          </Text>
          {/* The item no longer lives in this album, so close the whole viewer. */}
          <Button color="neutral" onClick={() => modals.closeAll()}>
            CLOSE
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 pb-2">
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
            comboboxProps={{ zIndex: 1100 }}
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
            <Button color="neutral" onClick={handleClose}>
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
      )}
    </Modal>
  );
}
