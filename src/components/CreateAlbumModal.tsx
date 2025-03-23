"use client";

import React, { useState } from "react";
import uploadThumbnail from "@/assets/logos/upload_album.png";
import type { JSX } from "react";

interface CreateAlbumModalProps {
  trigger: React.ReactNode;
}

const CreateAlbumModal: React.FC<CreateAlbumModalProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [albumName, setAlbumName] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg overflow-hidden w-[450px] text-center shadow-lg">
            {/* Header */}
            <div className="bg-[#002D45] py-4 pl-6 text-left">
              <h2 className="text-white text-lg font-semibold">CREATE ALBUM</h2>
            </div>

            {/* Upload Box */}
            <div
              className="flex flex-col items-center justify-center py-6 px-4 cursor-pointer"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Uploaded"
                  className="w-[120px] h-[120px] object-cover rounded-md"
                />
              ) : (
                <>
                  <img
                    src={uploadThumbnail.src}
                    alt="Upload"
                    className="w-10 h-10"
                  />
                  <p className="text-[#4A4A4A] mt-2">Upload album thumbnail</p>
                </>
              )}

              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Album Title Input */}
            <div className="px-6">
              <input
                type="text"
                value={albumName}
                placeholder="Album title"
                onChange={(e) => setAlbumName(e.target.value)}
                className="w-full text-center text-[#C0C6C9] border-none outline-none text-lg py-2"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-center gap-4 px-6 py-6">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-[#C0C6C9] text-black px-6 py-2 rounded-full font-semibold"
              >
                CLOSE
              </button>
              <button
                onClick={() => {
                  // handle create logic here
                  setIsOpen(false);
                }}
                className="bg-[#07B862] text-white px-6 py-2 rounded-full font-semibold"
              >
                CREATE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateAlbumModal;
