"use client";

import React from "react";
import AlbumCard from "../../components/AlbumCard";
import { openEditAlbumModal } from "@/components/EditAlbumModal";
import CardGallery from "@/components/CardGallery";
import { Album } from "@/types/albums/albumTypes";
import useAlbums from "@/hooks/albums/useAlbums";
import ErrorPage from "../error";
import LoadingPage from "../loading";
import { ActionIcon, Button, Indicator, Menu, Text, Title } from "@mantine/core";
import { MdAdd, MdFilterList, MdPendingActions } from "react-icons/md";
import Link from "next/link";

export default function AlbumsPage() {
  const albumsQuery = useAlbums();

  if (albumsQuery.isError) {
    return <ErrorPage error={albumsQuery.error} />;
  } else if (albumsQuery.isLoading) {
    return <LoadingPage />;
  }

  const albums = albumsQuery.data || [];
  return (
    <div className="flex flex-col w-6/7 grow mx-auto px-4 py-6 gap-6">
      <div className="flex items-center justify-between">
        <Title order={1}>Albums</Title>
        <div className="flex items-center gap-4 ml-auto">
          <Menu>
            <Menu.Target>
              <ActionIcon variant="transparent">
                <MdFilterList size={50} />
              </ActionIcon>
            </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item>Oldest → Newest</Menu.Item>
            <Menu.Item>Newest → Oldest</Menu.Item>
            <Menu.Item>A → Z</Menu.Item>
            <Menu.Item>Z → A</Menu.Item>
          </Menu.Dropdown>
          </Menu>
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
      {albums.length === 0 ? (
        <div className="flex flex-col justify-center items-center grow bg-neutral-3 gap-4">
          <Title order={4}>No albums yet</Title>
          <Button color="orange" rightSection={<MdAdd size={24} />} onClick={() => openEditAlbumModal()}>Create</Button>
        </div>
      ) : (
        <CardGallery<Album>
          items={albums}
          renderItem={(album: Album) => (
            <AlbumCard albumId={album.id} />
          )}
        />
      )}
    </div>
  );
};