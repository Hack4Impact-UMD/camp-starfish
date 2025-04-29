"use client";
import React, { useState, useEffect } from "react";
import ImageView from "@/components/ImageView";
import { ImageID } from "@/types/albumTypes";

// For testing: function to create a blank gray image file
function createGrayImage(): Promise<string> {
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
        const url = URL.createObjectURL(blob);
        resolve(url);
      }
    }, "image/png");
  });
}

export default function TestImageView() {
  const [imageID, setImageID] = useState<ImageID | null>(null);

  useEffect(() => {
    createGrayImage().then((src) => {
      const imageID: ImageID = {
        src,
        id: "test",
        albumId: "sampleAlbumId", // Example albumId
        name: "picture one",
        dateTaken: "2025-04-08",
        inReview: false,
        tags: {
          approved: [
            {
              campminderId: 12345,
              name: {
                firstName: "Student",
                lastName: "1",
              },
              photoPermissions: "PUBLIC",
            },
          ],
          inReview: Array.from({ length: 7 }, (_, i) => ({
            campminderId: 67890 + i,
            name: {
              firstName: "Student",
              lastName: `${i + 1}`,
            },
            photoPermissions: "PUBLIC",
          })),
        },
      };
      setImageID(imageID);
    });
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-200">
      {imageID && (
        <ImageView
          image={imageID}
          onLeftClick={() => alert("Left Click")}
          onRightClick={() => alert("Right Click")}
          onClose={() => alert("Close Clicked")}
          onMoveToClick={() => alert("Move To Clicked")}
        />
      )}
    </div>
  );
}
