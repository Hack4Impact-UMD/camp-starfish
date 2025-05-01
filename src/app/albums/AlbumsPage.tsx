/*************  ✨ Windsurf Command 🌟  *************/
"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AlbumCard from "../../components/AlbumCard";
import plusIcon from "@/assets/icons/plusIcon.svg";
import filterIcon from "@/assets/icons/filterIcon.svg";
import testPicture from "@/assets/images/PolaroidPhotos1.png";
import EditAlbumModal from "@/components/EditAlbumModal";
import CardGallery from "@/components/CardGallery";
import { AlbumID } from "@/types/albumTypes";
import { ImageID } from "@/types/albumTypes";
import SortDropdown from "@/components/SortDropdown";
import { motion, AnimatePresence } from "framer-motion";
import pendingIcon from "@/assets/icons/pendingIcon.svg";
import { Role } from "@/types/personTypes";
import { useAuth } from "@/auth/useAuth";
import downloadIcon from "@/assets/icons/downloadIcon.svg";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const AlbumsPage: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();
  const role: Role = auth.token?.claims.role as Role;

  // Sample data for albums, get data from Firebase
  const initialAlbums: AlbumID[] = Array.from({ length: 100 }, (_, index) => ({
    name: `Album ${index + 1}`,
    sessionId: `session-${index + 1}`,
    numPhotos: Math.floor(Math.random() * 200) + 50,
    startDate: new Date(2024, 0, 1 + index).toISOString(),
    endDate: new Date(2024, 0, 5 + index).toISOString(),
    hasThumbnail: true,
    id: `album-${index + 1}`, 
    imageUrl: testPicture.src, 
  }));

  const initialPictures: ImageID[] = Array.from({ length: 100 }, (_, index) => ({
      name: `Picture ${index + 1}`,
      dateTaken: new Date(2024, 0, 1 + index).toISOString(),
      inReview: index % 2 === 0,
      tags: {
        approved: [],
        inReview: [],
      },
      albumId: `album-${Math.floor(index / 2) + 1}`,
      src: testPicture.src,
      id: `picture-${index + 1}`,
  }));

  const [albums, setAlbums] = useState(initialAlbums);


  const downloadAllImages = () => {
    const zip = new JSZip();
    const imagePromises = initialPictures.map(image =>
      fetch(image.src)
        .then(response => response.blob())
        .then(blob => {
          zip.file(image.name || 'image.jpg', blob);
        })
        .catch(error => console.error('Download failed:', error))
    );

    Promise.all(imagePromises)
      .then(() => {
        zip.generateAsync({ type: "blob" })
          .then(blob => {
            saveAs(blob, "images.zip");
          })
          .catch(error => console.error('Zip generation failed:', error));
      })
      .catch(error => console.error('Download failed:', error));

  };



  const handleSort = (option: string) => {
    setSortOption(option);
    let sortedAlbums = [...albums];

    if (option === "Oldest -> Newest") {
      sortedAlbums.sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    } else if (option === "Newest -> Oldest") {
      sortedAlbums.sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
    }
    setAlbums(sortedAlbums);
    setIsDropdownOpen(false);
  };



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full min-h-full bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-5xl font-newSpirit font-bold text-camp-primary">
            Albums
          </h1>
          <div className="flex items-center gap-4 ml-auto">
            {/* Filter Icon Button */}
            <div className="relative"
            >
              <img
                className="w-[72px] h-[72px] flex-none cursor-pointer"
                src={filterIcon.src}
                alt="Filter"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
              {/* Dropdown Content */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-[70px] bg-white border-[1px] border-solid border-[#3B4E57] rounded-[4px] shadow-lg"
                  >
                    <SortDropdown
                      options={[
                        {
                          label: "Oldest → Newest",
                          onSelect: () => handleSort("Oldest -> Newest"),
                        },
                        {
                          label: "Newest → Oldest",
                          onSelect: () => handleSort("Newest -> Oldest"),
                        },

                      ]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {(role == "ADMIN" || role == "PHOTOGRAPHER") && (
              <div className="flex items-center justify-center gap-4">


                <Link href="/albums/pending" className="m-0 p-0 w-[65px] h-[65px] flex justify-center items-center">
                  <div className="w-[63px] h-[63px] rounded-full border-[3px] border-camp-primary flex justify-center items-center">
                    <img
                      src={pendingIcon.src}
                      alt="Pending Icon"
                      className="w-[35px] h-[35px] block ml-[2px]"
                    />
                  </div>
                </Link>

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

            )}

            {(role == "PARENT") && (
              <div>
                <img onClick = {downloadAllImages} src={downloadIcon.src} alt="Pending Icon" className="w-[65px] h-[65px] cursor-pointer" />
              </div>

            )}
          </div>
        </div>
        <CardGallery<AlbumID>
          items={albums}
          renderItem={(album: AlbumID) => <AlbumCard album={album} />}
        />
      </div>
    </div>
  );
};

export default AlbumsPage;

