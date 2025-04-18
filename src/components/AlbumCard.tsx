import React from "react";
import Link from "next/link";
import { getImageURLs } from "@/data/storage/fileOperations";
import Image from "next/image";
import DownloadIcon from "@/assets/icons/Download.svg";

interface AlbumCardProps {
  title: string;
  date: string;
  photoCount: number;
  imageUrl: string;
  albumId: string;
  imagePaths: string[];
}

const AlbumCard: React.FC<AlbumCardProps> = ({ title, date, photoCount, imageUrl, albumId, imagePaths }) => {

  const [isChecked, setIsChecked] = React.useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setIsChecked(!isChecked);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const urls = await getImageURLs(imagePaths);
      urls.forEach((url) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = `album-${albumId}-image-${imagePaths.indexOf(url) + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (error) {
      console.error("Error downloading album images:", error);
    }
  }

  return (
    <div className="relative">
      {/* Checkbox */}
      <div className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center bg-gray-400 bg-opacity-30 rounded-md backdrop-blur-sm">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="absolute top-2 left-2 z-10 w-5 h-5 rounded-md border-5 border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
      </div>

      {/* Download Button */}
      <div
        className="absolute top-4 right-3 z-10 w-10 h-10 flex items-center justify-center cursor-pointer"
        onClick={handleDownload}
      >
        <Image
          src={DownloadIcon}
          alt="Download album"
          width={32}
          height={32}
          className="w-14 h-14 hover:opacity-80 transition-opacity"
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
