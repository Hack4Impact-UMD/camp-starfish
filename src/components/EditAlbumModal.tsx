"use client";

import React, { useState, useEffect, useMemo } from "react";
import { modals } from "@mantine/modals";
import { Button, Image, Indicator, Text, TextInput } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/app/error";
import { MdClose, MdImage } from "react-icons/md";
import useCreateAlbum from "@/hooks/albums/useCreateAlbum";
import useUpdateAlbum from "@/hooks/albums/useUpdateAlbum";
import useNotifications from "@/features/notifications/useNotifications";
import useAlbum from "@/hooks/albums/useAlbum";
import { Album } from "@/types/albums/albumTypes";
import { albumFormSchema } from "@/schemas/albums";

interface EditAlbumModalProps {
  albumId?: string;
}

export default function EditAlbumModal(props: EditAlbumModalProps) {
  const { albumId } = props;
  const albumQuery = useAlbum(albumId);

  if (albumQuery.isLoading) return <LoadingPage />;
  else if (albumQuery.isError) return <ErrorPage error={albumQuery.error} />;
  return <EditAlbumModalContent album={albumQuery.data} />;
}

interface EditAlbumModalContentProps {
  album?: Album;
}

function EditAlbumModalContent(props: EditAlbumModalContentProps) {
  const { album } = props;
  const [albumName, setAlbumName] = useState<string>(album?.name ?? "");
  const [albumNameError, setAlbumNameError] = useState<string | null>(null);
  const [albumThumbnail, setAlbumThumbnail] = useState<File | null>(null);
  const [thumbnailTouched, setThumbnailTouched] = useState<boolean>(false);

  const albumThumbnailUrl = useMemo(
    () => (albumThumbnail ? URL.createObjectURL(albumThumbnail) : null),
    [albumThumbnail],
  );
  useEffect(() => {
    return () => {
      if (albumThumbnailUrl) URL.revokeObjectURL(albumThumbnailUrl);
    };
  }, [albumThumbnailUrl]);

  const createAlbumMutation = useCreateAlbum();
  const updateAlbumMutation = useUpdateAlbum();
  const notifications = useNotifications();

  return (
    <div className="flex flex-col items-center w-full h-full">
      <Indicator
        disabled={!albumThumbnail}
        classNames={{
          root: "w-2/3 m-md",
          indicator: "cursor-pointer",
        }}
        label={
          <MdClose
            onClick={() => {
              setAlbumThumbnail(null);
              setThumbnailTouched(true);
            }}
          />
        }
        size={20}
      >
        <Dropzone
          onDrop={(files: FileWithPath[]) => {
            setAlbumThumbnail(files[0]);
            setThumbnailTouched(true);
          }}
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
          loading={
            createAlbumMutation.isPending || updateAlbumMutation.isPending
          }
          onClick={() => {
            const result = albumFormSchema.safeParse({
              name: albumName,
              thumbnail: albumThumbnail,
            });

            if (!result.success) {
              const fieldErrors = result.error.flatten().fieldErrors;
              if (fieldErrors.name?.[0]) {
                setAlbumNameError(fieldErrors.name[0]);
              }
              if (fieldErrors.thumbnail?.[0]) {
                notifications.error(fieldErrors.thumbnail[0]);
              }
              return;
            }

            if (album) {
              updateAlbumMutation.mutate(
                {
                  albumId: album.id,
                  name: result.data.name,
                  thumbnail: thumbnailTouched ? albumThumbnail : undefined,
                },
                {
                  onSuccess: () => modals.closeAll(),
                  onError: () =>
                    notifications.error(
                      "Failed to update album. Please try again.",
                    ),
                },
              );
            } else {
              createAlbumMutation.mutate(
                {
                  name: result.data.name,
                  thumbnail: albumThumbnail ?? undefined,
                },
                {
                  onSuccess: () => modals.closeAll(),
                  onError: () =>
                    notifications.error(
                      "Failed to create album. Please try again.",
                    ),
                },
              );
            }
          }}
        >
          {album ? "CONFIRM" : "CREATE"}
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
