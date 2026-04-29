"use client";

import Image from "next/image";
import { AlbumItem } from "@/types/albums/albumTypes";

interface AlbumItemCardProps {
  albumItem: AlbumItem;
  isSelected: boolean;
}

export default function AlbumItemCard(props: AlbumItemCardProps) {
  const { albumItem, isSelected } = props;
  return (
    <div
      key={albumItem.id}
      className={`relative group w-full h-auto rounded-lg overflow-hidden shadow-md border-4 transition duration-300 cursor-pointer ${
        isSelected ? "border-blue-500" : "border-transparent"
      }`}
    >
      <Image
        src={""}
        alt={`${albumItem.name}`}
        width={200}
        height={200}
        className="w-full h-auto object-cover"
      />
      <div
        className={`absolute top-2 left-2 w-8 h-8 rounded-md bg-white bg-opacity-80 flex items-center justify-center transition-opacity duration-200 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${
            isSelected ? "bg-blue-500 border-blue-500" : "border-gray-400"
          }`}
        >
          {isSelected && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
