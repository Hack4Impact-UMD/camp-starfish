"use client";

import ImageUploadModal from "@/components/ImageUploadModal";

export default function Page() {
  return (
    <div className="bg-white h-full">
        <ImageUploadModal albumID="testAlbum">
            <button className="bg-camp-primary m-1 p-1">Trigger Modal</button>
        </ImageUploadModal>
    </div>
  );
}