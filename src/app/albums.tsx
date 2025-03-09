"use client";

import React from "react";
import AlbumCard from "../components/AlbumCard";
import createAlbum from "@/assets/Create Album.svg";
import frame92 from "@/assets/Frame 92.svg";

const AlbumsPage: React.FC = () => {
  // Sample data for albums, get data from Firebase
  const albums = Array(8).fill({
    title: "Program 1",
    date: "June 2024",
    photoCount: 156,
    imageUrl: "/path/to/image.jpg", // Replace with actual image URL
  });

  return (
    <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
                <h1 className="text-5xl font-newSpirit font-bold text-camp-primary">
                    Albums
                </h1>
                <div className="flex items-center gap-4 ml-auto">
                    <img className="w-[72px] h-[72px] flex-none cursor-pointer" src={frame92.src} alt="Frame 92" />
                    <img className="w-[72px] h-[72px] flex-none cursor-pointer" src={createAlbum.src} alt="Create Album" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                {albums.map((album, index) => (
                    <AlbumCard className="cursor-pointer" key={index} {...album} />
                ))}
            </div>
        </div>
    </div>


  );
};

export default AlbumsPage;
