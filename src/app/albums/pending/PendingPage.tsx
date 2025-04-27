import React, { useState } from "react";
import TestPicture from "@/assets/images/TestPicture.png";
import PolaroidPhotos1 from "@/assets/images/PolaroidPhotos1.png";
import filterIcon from "@/assets/icons/filterIcon.svg";
import uploadIcon from "@/assets/icons/uploadIcon.svg";
import SelectablePhoto from "@/components/SelectablePhoto";
import ConfirmationModal from "@/components/ConfirmationModal";
import CardGallery, { GroupOptions } from "@/components/CardGallery";
import backIcon from "@/assets/icons/backIcon.svg";
import { useRouter } from "next/navigation";

interface Photo {
  id: string;
  src: string;
  album: string;
}

const PendingPage: React.FC = () => {
  const router = useRouter();

  // Photos have album fields from the start
  const [photos, setPhotos] = useState<Photo[]>([
    { id: "photo-1", src: TestPicture.src, album: "Album1" },
    { id: "photo-2", src: TestPicture.src, album: "Album1" },
    { id: "photo-3", src: TestPicture.src, album: "Album1" },
    { id: "photo-4", src: PolaroidPhotos1.src, album: "Album1" },
    { id: "photo-5", src: TestPicture.src, album: "Album1" },
    { id: "photo-6", src: TestPicture.src, album: "Album1" },
    { id: "photo-7", src: PolaroidPhotos1.src, album: "Album2" },
    { id: "photo-8", src: TestPicture.src, album: "Album2" },
  ]);

  const groups: GroupOptions<Photo> = {
    groupLabels: ["Album1", "Album2"],
    defaultGroupLabel: "Other",
    groupFunc: (photo) => photo.album,
  };

  return (
    <div className="w-full min-h-full bg-gray-100">
      <div className="container mx-auto px-4 py-6">

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={backIcon.src}
              alt="Back"
              className="w-8 h-8 cursor-pointer"
              onClick={() => router.back()}
            />
            <h1 className="text-4xl font-lato font-bold text-camp-primary">Pending</h1>
          </div>

          <div className="flex items-center gap-4">
            <ConfirmationModal
              text="Are you sure you want to approve all the selected photos?"
              onConfirm={() => console.log("Upload confirmed")}
              cannotUndo={true}
              trigger={
                <button className="border-2 border-camp-primary text-lg py-2 px-4 rounded-3xl w-[180px] h-[48px] font-lato font-bold text-camp-text-modalTitle">
                  APPROVE ALL
                </button>
              }
            />
            <img
              className="w-[72px] h-[72px] flex-none cursor-pointer"
              src={filterIcon.src}
              alt="Filter"
            />
            <div className="w-[72px] h-[72px] flex items-center justify-center rounded-full bg-[#00B6CE]">
              <img
                className="w-[40px] h-[40px] flex-none cursor-pointer"
                src={uploadIcon.src}
                alt="Upload"
              />
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="mt-6 space-y-8">
          <CardGallery
            items={photos}
            groups={groups}
            renderItem={(item) => (
              <SelectablePhoto
                key={item.id}
                src={item.src}
                alt={`Thumbnail ${item.id}`}
              />
            )}
          />
        </div>
        
      </div>
    </div>
  );
};

export default PendingPage;
