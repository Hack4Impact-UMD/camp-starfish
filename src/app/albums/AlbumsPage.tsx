"use client";

import React from "react";
import AlbumCard from "../../components/AlbumCard";
import plusIcon from "@/assets/icons/plusIcon.svg";
import filterIcon from "@/assets/icons/filterIcon.svg";
import testPicture from "@/assets/images/PolaroidPhotos1.png";
import EditAlbumModal from "@/components/EditAlbumModal";
import CardGallery from "@/components/CardGallery";
import { AlbumID } from "@/types/albumTypes";
import Image from "next/image";

const AlbumsPage: React.FC = () => {
  // Sample data for albums, get data from Firebase
  const albums: AlbumID[] = Array(100).fill({
    title: "Program 1",
    date: "June 2024",
    photoCount: 156,
    imageUrl: testPicture.src, // Replace with actual image URL
    id: "album-1",
  });

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
                />
              }
              mode="CREATE"
            />
          </div>
        </div>
        <CardGallery<AlbumID>
          items={albums}
          renderItem={(album: AlbumID) => <AlbumCard album={album} thumbnail="" />}
        />
      </div>
    </div>
  );
};

export default AlbumsPage;
