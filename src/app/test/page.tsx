"use client";

import ImageUploadModal from "@/components/ImageUploadModal";

export default function Page() {

  let testAlbum = {
    name: "Test Album",
    programId: "program_id_test",
  
    numPhotos: 0,
    nextPhotoId: 0,
    startDate: "",
    endDate: "",
  }

  return (
    <div className="bg-white h-full">
        <ImageUploadModal album={testAlbum}>
            <button className="bg-camp-primary m-1 p-1">Trigger Modal</button>
        </ImageUploadModal>
    </div>
  );
}