"use client";

import React, { useState, useRef } from "react";
import imageIcon from "@/assets/icons/imageIcon.png";
import Image from "next/image";
import { modals } from "@mantine/modals";

interface EditAlbumModalProps {
  mode: "CREATE" | "EDIT";
}

const EditAlbumModal: React.FC<EditAlbumModalProps> = ({ mode }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [albumName, setAlbumName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  return (
      <div>
        {/* Header */}
        <div className="bg-camp-primary py-4 px-6 text-left">
          <h2 className="text-white text-lg font-semibold">{mode} ALBUM</h2>
        </div>

        {/* Upload Box */}
        <div
          className="w-1/2 mx-auto mt-4 flex flex-col items-center justify-center py-6 px-4 cursor-pointer bg-[#E6EAEC] rounded-md"
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt="Uploaded"
              className="w-28 h-28 object-cover rounded-md"
              width={112}
              height={112}
            />
          ) : (
            <>
              <Image
                src={imageIcon.src}
                alt="Upload"
                className="w-10 h-10"
                width={40}
                height={40}
              />
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <p className="text-camp-text-subheading mt-2 mb-4 text-sm text-center">
          {!selectedImage && "Upload album thumbnail"}
        </p>

        <div className="px-6 flex justify-center">
          <div className="w-[70%] text-camp-text-subheading">
            <input
              type="text"
              value={albumName}
              placeholder="Album title"
              onChange={(e) => setAlbumName(e.target.value)}
              className="w-full text-center bg-[#E6EAEC] text-bg-camp-buttons-neutral border-none outline-hidden text-lg py-2 placeholder:text-bg-camp-buttons-neutral rounded-md"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-center gap-4 px-6 py-6">
          <button
            onClick={() => modals.closeAll()}
            className="bg-camp-buttons-neutral text-black px-6 py-2 rounded-full font-lato font-semibold"
          >
            CLOSE
          </button>
          <button
            onClick={() => {modals.closeAll()}}
            className="bg-camp-tert-green text-white px-6 py-2 rounded-full font-lato font-semibold"
          >
            {mode === "CREATE" ? "CREATE" : "CONFIRM"}
          </button>
        </div>
      </div>
  );
};

export default EditAlbumModal;

export function openEditAlbumModal() {
  modals.open({
    title: "Edit Album",
    children: <EditAlbumModal mode="EDIT" />,
  })
}