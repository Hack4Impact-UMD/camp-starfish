"use client";

import FileUploadModal from "@/components/FileUploadModal";
import { useState } from "react";

export default function Page() {
  let testAlbum = {
    name: "Test Album",
    programId: "program_id_test",

    numPhotos: 0,
    nextPhotoId: 0,
    startDate: "",
    endDate: "",
  };

  let [fail, setFail] = useState<boolean>(false);

  return (
    <div className="bg-white h-full">
      <input
        type="checkbox"
        checked={fail}
        onChange={(e) => setFail(e.target.checked)}
      />
      <span className="text-camp-primary">Make upload fail</span>
      <br />
      <FileUploadModal
        onUpload={(files) => {
          if (fail) {
            throw TypeError();
          }
          console.log(files);
        }}
        acceptedFileExtensions={[".jpg",".png"]}
        maxFileSize={5}
      >
        <button className="bg-camp-primary m-1 p-1 text-camp-white">Trigger Modal</button>
      </FileUploadModal>
    </div>
  );
}
