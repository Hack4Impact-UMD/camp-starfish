import React from "react";
import PendingImageCard from "@/components/PendingImageCard";
import ConfirmationModal from "@/components/ConfirmationModal";
import CardGallery, { GroupOptions } from "@/components/CardGallery";
import { useRouter } from "next/navigation";
import useAlbumItemList from "@/hooks/albumItems/useAlbumItemList";
import ErrorPage from "@/app/error";
import LoadingAnimation from "@/components/LoadingAnimation";
import { UploadAlbumItemsModal } from "@/components/UploadAlbumItemsModal/UploadAlbumItemsModal";

interface PendingPageProps {
  albumId: string;
}

export default function PendingPage(props: PendingPageProps) {\
  const { albumId } = props;

  const albumItemsQuery = useAlbumItemList(albumId, {
    where: [{ fieldPath: 'inReview', operation: '==', value: true }]
  });

  const router = useRouter();

  if (albumItemsQuery.isError) {
    return <ErrorPage error={albumItemsQuery.error} />
  } else if (albumItemsQuery.isPending) {
    return <LoadingAnimation />
  }

  const albumItems = albumItemsQuery.data.pages.flatMap(page => page.docs);

  const groups: GroupOptions<ImageID> = {
    groupLabels: ["album-1"],
    defaultGroupLabel: "Other",
    groupFunc: (photo) => photo.albumId,
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
              <PendingImageCard
                key={item.id}
                src={item.src}
                alt={`Thumbnail ${item.id}`}
                status="none"
                onApprove={() => console.log("Approve", item.id)}
                onReject={() => console.log("Reject", item.id)}
              />
            )}
          />
        </div>
        
      </div>
    </div>
  );
};