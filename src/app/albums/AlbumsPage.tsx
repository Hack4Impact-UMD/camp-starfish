"use client";

import React, { useEffect, useState } from "react";
import AlbumCard from "../../components/AlbumCard";
import plusIcon from "@/assets/icons/plusIcon.svg";
import filterIcon from "@/assets/icons/filterIcon.svg";
import EditAlbumModal from "@/components/EditAlbumModal";
import CardGallery from "@/components/CardGallery";
import { AlbumID } from "@/types/albumTypes";
import { getAllAlbums } from "@/data/firestore/albums";
import { getFileURL } from "@/data/storage/fileOperations";

const AlbumsPage: React.FC = () => {
  const [albums, setAlbums] = useState<AlbumID[]>([]);
  const [thumbnails, setThumbnails] = useState<{ [albumId: string]: string }>(
    {}
  );

  const fetchAlbums = async () => {
    const albums = await getAllAlbums();
    const albumsWithThumbnails = albums.filter((album: AlbumID) => album.hasThumbnail);
    const thumbnails = await Promise.all(
      albumsWithThumbnails.map((album: AlbumID) => getFileURL(`/albums/${album.id}/thumbnail.png`))
    );
    setAlbums(albums);
    const thumbnailLookup: { [albumId: string]: string } = {};
    albumsWithThumbnails.forEach((album: AlbumID, i: number) => {
      thumbnailLookup[album.id] = thumbnails[i];
    })
    setThumbnails(thumbnailLookup);
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-5xl font-newSpirit font-bold text-camp-primary">
            Albums
          </h1>
          <div className="flex items-center gap-4 ml-auto">
            <img
              className="w-[72px] h-[72px] flex-none cursor-pointer"
              src={filterIcon.src}
              alt="Filter"
            />
            <button className="border-2 border-camp-primary text-lg py-2 px-4 rounded-3xl w-[252px] h-[48px] font-lato font-bold text-camp-text-modalTitle">
              SELECT ALL
            </button>
            {/* Wrap plus icon with modal trigger */}
            <EditAlbumModal
              trigger={
                <img
                  className="w-[72px] h-[72px] flex-none cursor-pointer"
                  src={plusIcon.src}
                  alt="Plus"
                />
              }
              mode="CREATE"
            />
          </div>
        </div>
        <CardGallery<AlbumID>
          items={albums}
          renderItem={(album: AlbumID) => <AlbumCard album={album} thumbnail={thumbnails[album.id]} />}
        />
      </div>
    </div>
  );
};

export default AlbumsPage;
