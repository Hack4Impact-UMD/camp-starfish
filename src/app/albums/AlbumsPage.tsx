"use client";

import React from "react";
import AlbumCard from "../../components/AlbumCard";
import EditAlbumModal from "@/components/EditAlbumModal";
import CardGallery from "@/components/CardGallery";
import { Album } from "@/types/albums/albumTypes";
import useAlbums from "@/hooks/albums/useAlbums";
import ErrorPage from "../error";
import LoadingPage from "../loading";
import { ActionIcon, Button, Indicator, Title } from "@mantine/core";
import { MdAdd, MdPendingActions } from "react-icons/md";

const AlbumsPage: React.FC = () => {
  const albumsQuery = useAlbums();

  if (albumsQuery.isError) {
    return <ErrorPage error={albumsQuery.error} />;
  } else if (albumsQuery.isPending) {
    return <LoadingPage />;
  }

  const albums = albumsQuery.data;
  return (
    <div className="w-full min-h-full bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Title order={1}>Albums</Title>
          <div className="flex items-center gap-4 ml-auto">
            <Button>SELECT ALL</Button>
            <Indicator color="error" offset={7}>
              <ActionIcon variant="outline">
                <MdPendingActions size={30} />
              </ActionIcon>
            </Indicator>
            <EditAlbumModal
              trigger={
                <ActionIcon color="orange">
                  <MdAdd size={40} />
                </ActionIcon>
              }
              mode="CREATE"
            />
          </div>
        </div>
        <CardGallery<Album>
          items={albums}
          renderItem={(album: Album) => (
            <AlbumCard album={album} thumbnail="" />
          )}
        />
      </div>
    </div>
  );
};

export default AlbumsPage;
