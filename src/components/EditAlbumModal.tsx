"use client";

import React, { useState, useEffect, useMemo } from "react";
import { modals } from "@mantine/modals";
import useAlbumById from "@/hooks/albums/useAlbumById";
import { Button, Image, Indicator, Text, TextInput } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/app/error";
import { MdClose, MdImage } from "react-icons/md";
import useCreateAlbum from "@/hooks/albums/useCreateAlbum";
import useUpdateAlbum from "@/hooks/albums/useUpdateAlbum";
import useNotifications from "@/features/notifications/useNotifications";

interface EditAlbumModalProps {
  albumId?: string;
}

export default function EditAlbumModal(props: EditAlbumModalProps) {
  const { albumId } = props;
  const albumQuery = useAlbumById(albumId);

  const [albumName, setAlbumName] = useState<string>(
    albumQuery.data?.name || "",
  );
  const [albumNameError, setAlbumNameError] = useState<string | null>(null);
  const [albumThumbnail, setAlbumThumbnail] = useState<File | null>(null);

  const albumThumbnailUrl = useMemo(() => (albumThumbnail ? URL.createObjectURL(albumThumbnail) : null), [albumThumbnail]);
  useEffect(() => { return () => { if (albumThumbnailUrl) URL.revokeObjectURL(albumThumbnailUrl); }; }, [albumThumbnailUrl]);

  const createAlbumMutation = useCreateAlbum();
  const updateAlbumMutation = useUpdateAlbum();
  const notifications = useNotifications();

  if (albumQuery.isLoading) return <LoadingPage />;
  else if (albumQuery.isError) return <ErrorPage error={albumQuery.error} />;

  return (
    <div className="flex flex-col items-center w-full h-full">
      <Indicator
        disabled={!albumThumbnail}
        classNames={{
          root: "w-2/3 m-md",
          indicator: "cursor-pointer",
        }}
        label={<MdClose onClick={() => setAlbumThumbnail(null)} />}
        size={20}
      >
        <Dropzone
          onDrop={(files: FileWithPath[]) => setAlbumThumbnail(files[0])}
          multiple={false}
          classNames={{
            root: "flex justify-center items-center w-full h-full aspect-square bg-blue-0 border cursor-pointer",
            inner: "w-full h-full",
          }}
        >
          {albumThumbnail ? (
            <Image
              src={albumThumbnailUrl}
              alt={albumThumbnail.name}
              width={10}
              height={10}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col justify-center items-center w-full h-full p-2">
              <MdImage className="text-neutral-4 w-10 h-10" size={40} />
              <Text classNames={{ root: "text-neutral-5" }}>
                Upload album thumbnail
              </Text>
            </div>
          )}
        </Dropzone>
      </Indicator>

      <TextInput
        label="Album Title"
        onChange={(e) => {
          setAlbumName(e.target.value);
          setAlbumNameError(null);
        }}
        classNames={{ root: "w-4/5" }}
        value={albumName}
        error={albumNameError}
        withAsterisk
      />

      <div className="flex justify-center gap-4 px-6 py-6">
        <Button color="error" onClick={() => modals.closeAll()}>
          CLOSE
        </Button>
        <Button
          color="success"
          loading={createAlbumMutation.isPending || updateAlbumMutation.isPending}
          onClick={() => {
            if (!albumName) { setAlbumNameError("Album name is required"); return; }
            albumId ? updateAlbumMutation.mutate({
              albumId,
              updates: { name: albumName }
            }, {
              onSuccess: () => modals.closeAll(),
              onError: () => notifications.error("Failed to update album. Please try again.")
            }) : createAlbumMutation.mutate({ album: {
              name: albumName,
              hasThumbnail: !!albumThumbnail,
              startDate: "",
              endDate: "",
              numItems: 0,
            } }, {
              onSuccess: () => modals.closeAll(),
              onError: () => notifications.error("Failed to create album. Please try again.")
            });
          }}
        >
          {albumId ? "CONFIRM" : "CREATE"}
        </Button>
      </div>
    </div>
  );
}

export function openEditAlbumModal(albumId?: string) {
  modals.open({
    title: albumId ? "Edit Album" : "Create Album",
    children: <EditAlbumModal albumId={albumId} />,
  });
}
