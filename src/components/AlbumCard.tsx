import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { getImageURLs } from "@/data/storage/fileOperations";
import Image from "next/image";
import Download from "@/assets/icons/Download.svg";
import { Pencil1Icon, DownloadIcon, TrashIcon } from '@radix-ui/react-icons';
import { useAuth } from "@/auth/useAuth";

// User roles
type Role = "ADMIN" | "PHOTOGRAPHER" | "PARENT" | "STAFF";

interface AlbumCardProps {
  title: string;
  date: string;
  photoCount: number;
  imageUrl: string;
  albumId: string;
  imagePaths: string[];
  onEdit?: (albumID: string) => void;
  onDelete?: (albumID: string) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ title, date, photoCount, imageUrl, albumId, imagePaths, onEdit, onDelete }) => {

  const [isChecked, setIsChecked] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const auth = useAuth();
  const role: Role = auth.token?.claims.role as Role;

  const menuRef = useRef<HTMLDivElement>(null);

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
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onEdit) {
      onEdit(albumId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) {
      onDelete(albumId);
    }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }
    , [menuRef]);

  const showControls = isHovered || isChecked;

  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Checkbox */}
      <div className={`absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center bg-gray-400 bg-opacity-30 rounded-md backdrop-blur-sm transition-opacity duration-200 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="absolute top-2 left-2 z-10 w-5 h-5 rounded-md border-5 border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
      </div>

      {/* Menu for ADMIN and PHOTOGRAPHER */}
      {(role === "ADMIN" || role === "PHOTOGRAPHER") && (
        <div
          ref={menuRef}
          className={`absolute top-4 right-3 z-20 transition-opacity duration-200 ${showControls || isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Three vertical dots button */}
          <button
            onClick={handleMenuToggle}
            className="absolute right-1.5 w-9 h-9 flex flex-col items-center justify-center rounded-md bg-gray-400 bg-opacity-30 backdrop-blur-sm hover:bg-opacity-40"
          >
            <div className={`w-1.5 h-1.5 rounded-full mb-1 ${isMenuOpen ? 'bg-gray-600' : isHovered ? 'bg-gray-400' : 'bg-white'}`}></div>
            <div className={`w-1.5 h-1.5 rounded-full mb-1 ${isMenuOpen ? 'bg-gray-600' : isHovered ? 'bg-gray-400' : 'bg-white'}`}></div>
            <div className={`w-1.5 h-1.5 rounded-full ${isMenuOpen ? 'bg-gray-600' : isHovered ? 'bg-gray-400' : 'bg-white'}`}></div>
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute top-12 right-0 w-40 bg-white font-weight-500 rounded-lg shadow-lg overflow-hidden border-[1.5px] border-gray-300">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left flex items-center text-camp-primary hover:bg-gray-100 border-[1px] border-gray-300 text-lg"
              >
                <Pencil1Icon className="w-5 h-5 mr-2" />
                Edit
              </button>

              <button
                onClick={handleDownload}
                className="w-full px-4 py-2 text-left flex items-center text-camp-primary hover:bg-gray-100 border-[1px] border-gray-300 text-lg"
              >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download
              </button>

              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left flex items-center text-camp-primary hover:bg-gray-100 border-[1px] border-gray-300 text-lg"
              >
                <TrashIcon className="w-5 h-5 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Download button for PARENT and STAFF */}
      {(role === "PARENT" || role === "STAFF") && (
        <div
          className={`absolute top-4 right-3 z-10 w-10 h-10 flex items-center justify-center cursor-pointer transition-opacity duration-200 ${showControls ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleDownload}
        >
          <Image
            src={Download}
            alt="Download album"
            width={32}
            height={32}
            className="w-14 h-14 hover:opacity-80 transition-opacity"
          />
        </div>
      )}

      {/* Album Card */}
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
