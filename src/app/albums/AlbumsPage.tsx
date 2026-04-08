"use client";

import React from "react";
import AlbumCard from "../../components/AlbumCard";
import { openEditAlbumModal } from "@/components/EditAlbumModal";
import CardGallery from "@/components/CardGallery";
import { Album } from "@/types/albums/albumTypes";
import useAlbums from "@/hooks/albums/useAlbums";
import ErrorPage from "../error";
import LoadingPage from "../loading";
import { ActionIcon, Button, Indicator, Title } from "@mantine/core";
import { MdAdd, MdPendingActions } from "react-icons/md";
import Link from "next/link";

const AlbumsPage: React.FC = () => {
  const albumsQuery = useAlbums();

  if (albumsQuery.isError) {
    return <ErrorPage error={albumsQuery.error} />;
  } else if (albumsQuery.isLoading) {
    return <LoadingPage />;
  }

  const albums = albumsQuery.data || [];
  return (
    <div className="w-full min-h-full bg-neutral-1">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Title order={1}>Albums</Title>
          <div className="flex items-center gap-4 ml-auto">
            <Button>SELECT ALL</Button>
            <Link href="/albums/pending">
              <Indicator color="error" offset={7}>
                <ActionIcon variant="outline">
                  <MdPendingActions size={30} />
                </ActionIcon>
              </Indicator>
            </Link>
            <ActionIcon color="orange" onClick={() => openEditAlbumModal()}>
              <MdAdd size={40} />
            </ActionIcon>
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
