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

import { SchedulePDF } from "../../features/scheduleGeneration/camperStafferAdminGrid";

const TestPage: React.FC = () => {
  // Sample data for albums, get data from Firebase
  const albums: AlbumID[] = Array(100).fill({
    title: "Program 1",
    date: "June 2024",
    photoCount: 156,
    imageUrl: testPicture.src, // Replace with actual image URL
    id: "album-1",
  });

  return (
    <button>
        
    </button>
  );
};

export default TestPage;
