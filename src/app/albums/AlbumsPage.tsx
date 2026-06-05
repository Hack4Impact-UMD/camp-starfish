"use client";

import React, { useEffect, useState } from "react";
import AlbumCard from "../../components/AlbumCard";
import { openEditAlbumModal } from "@/components/EditAlbumModal";
import CardGallery from "@/components/CardGallery";
import { Album } from "@/types/albums/albumTypes";
import useAlbumList from "@/hooks/albums/useAlbumList";
import ErrorPage from "../error";
import LoadingPage from "../loading";
import {
  ActionIcon,
  Button,
  Indicator,
  Menu,
  Title,
  Tooltip,
} from "@mantine/core";
import { MdAdd, MdPendingActions, MdSort } from "react-icons/md";
import Link from "next/link";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { AlbumDoc } from "@/data/firestore/types/documents";
import { useInViewport } from "@mantine/hooks";
import LoadingAnimation from "@/components/LoadingAnimation";

const enum AlbumsPageSortOption {
  NEWEST_TO_OLDEST = "Newest → Oldest",
  OLDEST_TO_NEWEST = "Oldest → Newest",
  A_TO_Z = "A → Z",
  Z_TO_A = "Z → A",
}

const sortQueryOptions: Record<
  AlbumsPageSortOption,
  FirestoreQueryOptions<AlbumDoc>
> = {
  "Newest → Oldest": {
    orderBy: [{ fieldPath: "startDate", direction: "desc" }],
  },
  "Oldest → Newest": {
    orderBy: [{ fieldPath: "startDate", direction: "asc" }],
  },
  "A → Z": { orderBy: [{ fieldPath: "name", direction: "asc" }] },
  "Z → A": { orderBy: [{ fieldPath: "name", direction: "desc" }] },
};

export default function AlbumsPage() {
  const [sortOption, setSortOption] = useState<AlbumsPageSortOption>(
    AlbumsPageSortOption.NEWEST_TO_OLDEST,
  );

  const albumsQuery = useAlbumList({
    ...sortQueryOptions[sortOption],
    limit: 10,
    limitToLast: undefined,
  });

  const { ref, inViewport } = useInViewport();
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = albumsQuery;
  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inViewport, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (albumsQuery.isError) {
    return <ErrorPage error={albumsQuery.error} />;
  } else if (albumsQuery.isLoading) {
    return <LoadingPage />;
  }

  const albums = albumsQuery.data?.pages.flatMap((page) => page.docs) ?? [];
  return (
    <div className="flex flex-col w-6/7 grow mx-auto px-4 py-6 gap-6">
      <div className="flex items-center justify-between">
        <Title order={1} className="uppercase">
          Albums
        </Title>
        <div className="flex items-center gap-4 ml-auto">
          <Menu>
            <Tooltip label="Sort">
              <Menu.Target>
                <ActionIcon variant="transparent">
                  <MdSort size={50} />
                </ActionIcon>
              </Menu.Target>
            </Tooltip>
            <Menu.Dropdown>
              <Menu.Item
                onClick={() =>
                  setSortOption(AlbumsPageSortOption.NEWEST_TO_OLDEST)
                }
              >
                Newest → Oldest
              </Menu.Item>
              <Menu.Item
                onClick={() =>
                  setSortOption(AlbumsPageSortOption.OLDEST_TO_NEWEST)
                }
              >
                Oldest → Newest
              </Menu.Item>
              <Menu.Item
                onClick={() => setSortOption(AlbumsPageSortOption.A_TO_Z)}
              >
                A → Z
              </Menu.Item>
              <Menu.Item
                onClick={() => setSortOption(AlbumsPageSortOption.Z_TO_A)}
              >
                Z → A
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Link href="/albums/pending">
            <Tooltip label="Pending Items">
              <Indicator color="error" offset={7}>
                <ActionIcon variant="outline">
                  <MdPendingActions size={30} />
                </ActionIcon>
              </Indicator>
            </Tooltip>
          </Link>
          <Tooltip label="Create Album">
            <ActionIcon color="orange" onClick={() => openEditAlbumModal()}>
              <MdAdd size={40} />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
      {albums.length === 0 ? (
        <div className="flex flex-col justify-center items-center grow bg-neutral-3 gap-4">
          <Title order={4}>No albums yet</Title>
          <Button
            color="orange"
            rightSection={<MdAdd size={24} />}
            onClick={() => openEditAlbumModal()}
          >
            Create
          </Button>
        </div>
      ) : (
        <>
          <CardGallery<Album>
            items={albums}
            renderItem={(album: Album) => <AlbumCard albumId={album.id} />}
          />
          {albumsQuery.isFetchingNextPage && (
            <div className="w-1/3 self-center">
              <LoadingAnimation />
            </div>
          )}
          {!albumsQuery.hasNextPage && (
            <Title order={4} classNames={{ root: "self-center" }}>
              All Done!
            </Title>
          )}
          <div className="invisible" ref={ref} />
        </>
      )}
    </div>
  );
}
