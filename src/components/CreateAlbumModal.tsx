"use client";

import React, { useState } from "react";
import cancel from "@/assets/logos/cancel.png";
import pencil from "@/assets/logos/pencil.png";
import upload from "@/assets/logos/upload.png";

const CreateAlbumModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [albumName, setAlbumName] = useState("Program 1");

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div
          className="relative bg-[#D9D9D9] p-6 rounded-lg shadow-lg flex flex-col"
          style={{ width: "851px", height: "654.027px" }}
        >
          {/* First Row: 3-Column Layout */}
          <div className="grid grid-cols-3 items-start gap-4">
            {/* Column 1: Create Album Text */}
            <h2
              className="text-black text-2xl uppercase leading-tight"
              style={{ fontFamily: "var(--font-lato)", fontWeight: 900 }}
            >
              CREATE <br /> ALBUM
            </h2>

            {/* Column 2: Upload Box */}
            <div className="flex flex-col items-center">
              <div className="w-[511.63px] h-[511.63px] flex flex-col justify-between rounded-lg bg-[#D3D3D3] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-4">
                {/* Inner White Container (Upload Box) */}
                <div
                  className="w-[445.58px] h-[355.7px] flex flex-col items-center justify-center bg-white rounded-lg mx-auto cursor-pointer mt-6"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Uploaded"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <img
                        src={upload.src}
                        alt="Upload"
                        className="w-12 h-12"
                      />
                      <p className="text-black text-sm mt-2">
                        Upload Album Thumbnail
                      </p>
                    </>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Album Name & Edit Button (Bottom Left) */}
                <div className="flex items-center mt-[-10px] w-[445.58px] mx-auto">
                  {isEditing ? (
                    <input
                      className="border-b-2 border-black outline-none bg-transparent text-[38.25px] w-[300px] max-w-full"
                      value={albumName}
                      onChange={(e) => setAlbumName(e.target.value)}
                      autoFocus
                      onBlur={() => setIsEditing(false)}
                      style={{
                        fontFamily: "var(--font-lato)",
                        fontWeight: 700,
                      }}
                    />
                  ) : (
                    <span
                      className="text-[38.25px]"
                      style={{
                        fontFamily: "var(--font-lato)",
                        fontWeight: 700,
                      }}
                    >
                      {albumName}
                    </span>
                  )}
                  <button onClick={() => setIsEditing(true)} className="ml-2">
                    <img
                      src={pencil.src}
                      alt="Edit"
                      className="w-[45.9px] h-[45.9px]"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Close Button */}
            <div className="flex justify-end">
              <button
                className="w-[47.81px] h-[47.81px] flex items-center justify-center"
                onClick={() => setIsOpen(false)}
              >
                <img
                  src={cancel.src}
                  alt="Cancel"
                  className="w-[47.81px] h-[47.81px]"
                />
              </button>
            </div>
          </div>

          {/* Second Row: Buttons in Bottom Right */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              className="flex items-center gap-x-2 px-4 py-2 bg-[#002D45] text-white rounded-full"
              onClick={() => setIsOpen(false)}
            >
              CANCEL
              <img src={cancel.src} alt="Cancel" className="w-4 h-4 invert" />
            </button>
            <button className="flex items-center gap-x-2 px-6 py-2 bg-[#F4831F] text-white rounded-full">
              CREATE <span className="text-2xl">+</span>
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default CreateAlbumModal;
