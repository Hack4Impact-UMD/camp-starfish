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

  const [isChecked, setIsChecked] = React.useState(false);
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setIsChecked(!isChecked);
  };

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center bg-gray-400 bg-opacity-30 rounded-md backdrop-blur-sm">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="absolute top-2 left-2 z-10 w-5 h-5 rounded-md border-5 border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
      </div>
      
      <Link href={`/albums/${albumId}`}>
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
          <div className="relative">
            <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-lg" />
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-bold font-lato text-camp-text-headingBody">{title}</h3>
            <p className="text-sm font-lato text-camp-text-subheading">{date} • {photoCount} photos</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AlbumCard;
