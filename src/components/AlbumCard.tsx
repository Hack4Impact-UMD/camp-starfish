import React from "react";
import Link from "next/link";

interface AlbumCardProps {
  title: string;
  date: string;
  photoCount: number;
  imageUrl: string;
  albumId: string;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ title, date, photoCount, imageUrl, albumId }) => {
  return (
    <Link href={`/albums/${albumId}`}>
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
            <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-lg" />
            <div className="mt-2">
                <h3 className="text-lg font-bold font-lato text-camp-text-headingBody">{title}</h3>
                <p className="text-sm font-lato text-camp-text-subheading">{date} • {photoCount} photos</p>
            </div>
        </div>
    </Link>
  );
};

export default AlbumCard;
