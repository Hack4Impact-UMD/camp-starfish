"use client";
import React, { useState, useEffect } from "react";
import ImageView from "@/components/ImageView";
import { ImageMetadata, ImageTags } from "@/types/albumTypes";

// For testing: function to create a blank gray image file
function createGrayImage(): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "#B0B0B0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "gray-image.png", { type: "image/png" });
        resolve(file);
      }
    }, "image/png");
  });
}

export default function TestImageView() {
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    createGrayImage().then(setImage);
  }, []);

  const imageTags: ImageTags = {
    approved: [
      {
        campminderId: 12345,
        name: {
          firstName: "Student",
          lastName: "One",
        },
        photoPermissions: 'PUBLIC',
      },
    ],
    inReview: [
      {
        campminderId: 67890,
        name: {
          firstName: "Student",
          lastName: "Two",
        },
        photoPermissions: 'PUBLIC',
      },
      {
        campminderId: 67890,
        name: {
          firstName: "Student",
          lastName: "Two",
        },
        photoPermissions: 'PUBLIC',
      },
      {
        campminderId: 67890,
        name: {
          firstName: "Student",
          lastName: "Two",
        },
        photoPermissions: 'PUBLIC',
      },
      {
        campminderId: 67890,
        name: {
          firstName: "Student",
          lastName: "Two",
        },
        photoPermissions: 'PUBLIC',
      },
      {
        campminderId: 67890,
        name: {
          firstName: "Student",
          lastName: "Two",
        },
        photoPermissions: 'PUBLIC',
      },
      {
        campminderId: 67890,
        name: {
          firstName: "Student",
          lastName: "Two",
        },
        photoPermissions: 'PUBLIC',
      },
      {
        campminderId: 67890,
        name: {
          firstName: "Student",
          lastName: "Two",
        },
        photoPermissions: 'PUBLIC',
      },
    ],
  };
  const metadata : ImageMetadata = {
    name: "picture one",
    dateTaken: "2025-04-08",
    inReview: false,
    tags: imageTags,
  }
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-200">
      {image && (
        <ImageView
          image={image}
          onLeftClick={() => alert("Left Click")}
          onRightClick={() => alert("Right Click")}
          metadata={metadata}
          userRole="ADMIN"
        />
      )}
    </div>
  );
}
