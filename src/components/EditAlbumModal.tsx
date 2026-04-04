"use client";

import React, { useState, useRef } from "react";
import { modals } from "@mantine/modals";
import useAlbumById from "@/hooks/albums/useAlbumById";
import { Button, FileInput, Text, TextInput } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/app/error";
import { MdImage } from "react-icons/md";

interface EditAlbumModalProps {
  albumId?: string;
}

export default function EditAlbumModal(props: EditAlbumModalProps) {
  const { albumId } = props;
  const albumQuery = useAlbumById(albumId);

  const [albumName, setAlbumName] = useState<string>(
    albumQuery.data?.name || "",
  );

  if (albumQuery.isLoading) return <LoadingPage />;
  else if (albumQuery.isError) return <ErrorPage error={albumQuery.error} />;

  return (
    <div className="flex flex-col items-center w-full h-full">
      <Dropzone
        multiple={false}
        classNames={{
          root: 'flex justify-center items-center w-2/3 aspect-square m-md',
          inner: 'w-full h-full'
        }}
      >
        <div className="flex flex-col justify-center items-center w-full h-full bg-blue-0 rounded-sm">
          <MdImage className="text-neutral-4 w-10 h-10" size={40} />
          <Text classNames={{ root: 'text-neutral-5' }}>Upload album thumbnail</Text>
        </div>
      </Dropzone>

      <TextInput
        label="Album Title"
        onChange={(e) => setAlbumName(e.target.value)}
        classNames={{ root: 'w-4/5' }}
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
