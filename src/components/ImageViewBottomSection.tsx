import { useState } from "react";
import { useAuth } from "@/auth/useAuth";
import Image from "next/image";
import { MdAdd, MdCheck, MdClose, MdFlag } from "react-icons/md";
import { Switch } from "@mantine/core";
import { Role } from "@/types/users/userTypes";
import { AlbumItem } from "@/types/albums/albumTypes";

type ImageTags = AlbumItem["tagIds"];

interface ImageViewBottomSectionProps {
  image: AlbumItem;
}

export default function ImageViewBottomSection({
  image,
}: ImageViewBottomSectionProps) {
  const [activeTab, setActiveTab] = useState<"APPROVED" | "PENDING">(
    "APPROVED"
  );
  const [localTags, setLocalTags] = useState<ImageTags>(image.tagIds);

  const auth = useAuth();
  const userRole: Role = auth.token?.claims.role as Role;

  const canModerateTags = userRole === "ADMIN" || userRole === "PHOTOGRAPHER";
  const canViewTags = canModerateTags || userRole === "STAFF";

  // --- Parent-only view: show report button ---
  if (userRole === "PARENT") {
    return (
      <div className="w-full bg-camp-white rounded-t-2xl flex flex-row items-center justify-center gap-4 sm:gap-10 p-4 sm:px-10">
        <p className="font-lato text-base sm:text-lg text-center sm:text-left text-camp-primary">
          Something wrong with this image? Report your issue to the Camp
          Starfish team
        </p>
        <button className="bg-camp-primary flex flex-row justify-center space-x-4 p-2 rounded-3xl w-52">
          <p className="text-base sm:text-lg font-lato">REPORT</p>
          <MdFlag size={20} />
        </button>
      </div>
    );
  }

  // --- Guard clause for users without tag access ---
  if (!canViewTags) return null;

  // --- Tag display logic based on tab ---
  const tagsToShow =
    activeTab === "APPROVED" ? localTags.approved : localTags.inReview;

  /**
   * Renders an individual tag with optional moderation controls
   * Displays tag name and, if the user can moderate, shows buttons to approve or reject
   */
  const renderTag = (tagId: number, isPending: boolean) => (
    <div
      key={tagId}
      className="bg-[#E6EAEC] px-4 py-2 rounded-3xl flex items-center gap-2"
    >
      <p className="text-black text-sm sm:text-base">
        Tag #{tagId}
      </p>
      {canModerateTags && (
        <>
          <button
            onClick={() => handleRejectTag(tagId)}
            aria-label="Reject Tag"
            className="inline-flex items-center justify-center min-w-[22px] min-h-[22px]"
          >
            <MdClose size={20} />
          </button>
          {isPending && (
            <button
              onClick={() => handleApproveTag(tagId)}
              aria-label="Approve Tag"
              className="inline-flex items-center justify-center min-w-[22px] min-h-[22px]"
            >
              <MdCheck size={20} />
            </button>
          )}
        </>
      )}
    </div>
  );

 /**
   * Approve a tag by moving it from 'inReview' to 'approved'
   */
  const handleApproveTag = (tagId: number) => {
    const updatedTags: ImageTags = {
      approved: [...localTags.approved, tagId],
      inReview: localTags.inReview.filter((t) => t !== tagId),
    };

    setLocalTags(updatedTags);
  };

  /**
   * Reject a tag by removing it from both 'approved' and 'inReview'
   */
  const handleRejectTag = (tagId: number) => {
    const updatedTags: ImageTags = {
      approved: localTags.approved.filter((t) => t !== tagId),
      inReview: localTags.inReview.filter((t) => t !== tagId),
    };

    setLocalTags(updatedTags);
  };

  /**
   * Placeholder for tag creation flow
   */
  const handleAddTag = () => {
    alert("Add Tag Clicked");
  };

  return (
    <div className="w-full">
      <div className="w-full bg-camp-white rounded-t-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center items-start p-4 gap-4 sm:pl-10 sm:pr-10">
          {/* Header: Toggle for moderators, label for Staff */}
          {canModerateTags ? (
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <p className="text-black text-base sm:text-lg font-lato font-semibold">
                APPROVED
              </p>
              <Switch
                checked={activeTab === "PENDING"}
                onChange={(checked) =>
                  setActiveTab(checked ? "PENDING" : "APPROVED")
                }
              />
              <p className="text-black text-base sm:text-lg font-lato font-semibold">
                PENDING
              </p>
            </div>
          ) : (
            <div className="m-2 mb-2 sm:mb-0 whitespace-nowrap">
              <p className="text-black text-base sm:text-lg font-lato font-semibold">
                APPROVED TAGS
              </p>
            </div>
          )}

          {/* Tags List */}
          <div className="overflow-x-auto whitespace-nowrap flex gap-2 w-full">
            {/* Staff View: Only approved tags without moderation ability */}
            {!canModerateTags && canViewTags ? (
              <> 
                {localTags.approved.map((tag) => renderTag(tag, false))} 
              </>
            ) : (
              // Photographer and Admin View: Can toggle between Approved and Pending tags with ability to moderate
              <>
                {tagsToShow.map((tag) => renderTag(tag, activeTab === "PENDING"))}
              </>
            )}
          </div>

          {/* Add Tag button: Only visible for pending tags and moderators */}
          {activeTab === "PENDING" && canModerateTags && (
            <div className="bg-white flex justify-end">
              <button
                onClick={handleAddTag}
                aria-label="Add Tag"
                className="bg-camp-primary flex flex-row justify-center space-x-2 p-2 px-4 sm:px-6 rounded-3xl shrink-0"
              >
                <p className="text-base sm:text-lg font-lato">ADD TAG</p>
                <MdAdd size={30} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}