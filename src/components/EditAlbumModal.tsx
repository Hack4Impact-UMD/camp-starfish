"use client";

import React, { useState, useEffect } from "react";
import { modals } from "@mantine/modals";
import useAlbumById from "@/hooks/albums/useAlbumById";
import { Button, Image, Indicator, Text, TextInput } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/app/error";
import { MdClose, MdImage } from "react-icons/md";

interface EditAlbumModalProps {
  albumId?: string;
}

export default function EditAlbumModal(props: EditAlbumModalProps) {
  const { albumId } = props;
  const albumQuery = useAlbumById(albumId);

  const [albumName, setAlbumName] = useState<string>(
    albumQuery.data?.name || "",
  );
  const [albumThumbnail, setAlbumThumbnail] = useState<File | null>(null);
  const [albumThumbnailURL, setAlbumThumbnailURL] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!albumThumbnail) {
      setAlbumThumbnailURL(null);
      return;
    }
    const albumThumbnailURL = URL.createObjectURL(albumThumbnail);
    setAlbumThumbnailURL(albumThumbnailURL);
    return () => URL.revokeObjectURL(albumThumbnailURL);
  }, [albumThumbnail]);

  if (albumQuery.isLoading) return <LoadingPage />;
  else if (albumQuery.isError) return <ErrorPage error={albumQuery.error} />;

  return (
    <div className="flex flex-col items-center w-full h-full">
      <Indicator
        disabled={!(albumThumbnail && albumThumbnailURL)}
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
          {albumThumbnail && albumThumbnailURL ? (
            <Image
              src={albumThumbnailURL}
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
        onChange={(e) => setAlbumName(e.target.value)}
        classNames={{ root: "w-4/5" }}
        value={albumName}
      />

      <div className="flex justify-center gap-4 px-6 py-6">
        <Button color="error" onClick={() => modals.closeAll()}>
          CLOSE
        </Button>
        <Button
          color="success"
          onClick={() => {
            console.log("TODO: Perform album mutation");
            modals.closeAll();
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
