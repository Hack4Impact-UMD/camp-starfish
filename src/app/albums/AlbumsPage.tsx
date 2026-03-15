"use client";

import React from "react";
import AlbumCard from "../../components/AlbumCard";
import plusIcon from "@/assets/icons/plusIcon.svg";
import filterIcon from "@/assets/icons/filterIcon.svg";
import EditAlbumModal from "@/components/EditAlbumModal";
import CardGallery from "@/components/CardGallery";
import { Album } from "@/types/albums/albumTypes";
import Image from "next/image";
import useAlbums from "@/hooks/albums/useAlbums";
import ErrorPage from "../error";
import LoadingPage from "../loading";

const AlbumsPage: React.FC = () => {
  const albumsQuery = useAlbums();
  
  if (albumsQuery.isError) {
    return <ErrorPage error={albumsQuery.error} />
  } else if (albumsQuery.isPending) {
    return <LoadingPage />;
  }

  const albums = albumsQuery.data;
  return (
    <div className="w-full min-h-full bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-5xl font-newSpirit font-bold text-camp-primary">
            Albums
          </h1>
          <div className="flex items-center gap-4 ml-auto">
            <Image
              className="w-[72px] h-[72px] flex-none cursor-pointer"
              src={filterIcon.src}
              alt="Filter"
              width={48}
              height={48}
            />
            <button className="border-2 border-camp-primary text-lg py-2 px-4 rounded-3xl w-[252px] h-[48px] font-lato font-bold text-camp-text-modalTitle">
              SELECT ALL
            </button>
            {/* Wrap plus icon with modal trigger */}
            <EditAlbumModal
              trigger={
                <Image
                  className="w-[72px] h-[72px] flex-none cursor-pointer"
                  src={plusIcon.src}
                  alt="Plus"
                  width={48}
                  height={48}
                />
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
